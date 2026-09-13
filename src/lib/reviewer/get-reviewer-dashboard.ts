import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type ReviewerStats = {
  pendingReviews: number;
  forwardedCases: number;
  reviewedByYou: number;
};

export type StatusSegment = {
  key: "SUBMITTED" | "FORWARDED_TO_INSPECTOR" | "RESOLVED" | "REJECTED";
  label: string;
  value: number;
  color: string;
};

export type IssueTypeCount = {
  label: string;
  value: number;
  color: string;
};

export type QueueRow = {
  id: string;
  code: string;
  productName: string;
  brandName: string | null;
  category: string | null;
  issueType: string | null;
  locationText: string | null;
  submitterName: string;
  createdAt: string;
  status: "SUBMITTED" | "FORWARDED_TO_INSPECTOR" | "RESOLVED" | "REJECTED";
  statusLabel: string;
};

export type ReviewerDashboardData = {
  reviewer: { name: string; email: string; imageUrl: string | null; role: string };
  stats: ReviewerStats;
  segments: StatusSegment[];
  totalReports: number;
  issueTypes: IssueTypeCount[];
  queue: QueueRow[];
};

const STATUS_LABEL: Record<QueueRow["status"], string> = {
  SUBMITTED: "Pending Review",
  FORWARDED_TO_INSPECTOR: "Sent to Inspector",
  REJECTED: "Rejected",
  RESOLVED: "Resolved",
};

const ISSUE_COLORS: Record<string, string> = {
  "Incorrect Weight": "#1769AA",
  "Misleading Label": "#16A34A",
  "Expired Product": "#F59E0B",
  "Price Mismatch": "#DC2626",
  Other: "#94A3B8",
};

export function reviewerStatusLabel(s: QueueRow["status"]): string {
  return STATUS_LABEL[s];
}

export async function getReviewerDashboard(): Promise<ReviewerDashboardData> {
  const reviewer = await requireRole(["REVIEWER", "ADMIN"]);

  const [
    pendingReviews,
    forwardedCases,
    reviewedByYou,
    statusCounts,
    issueGroups,
    queueRows,
  ] = await Promise.all([
    prisma.citizenReport.count({ where: { status: "SUBMITTED" } }),

    prisma.citizenReport.count({
      where: { status: "FORWARDED_TO_INSPECTOR" },
    }),

    prisma.citizenReport.count({
      where: {
        reviewedById: reviewer.id,
        status: { not: "SUBMITTED" },
      },
    }),

    prisma.citizenReport.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),

    prisma.citizenReport.groupBy({
      by: ["issueType"],
      _count: { _all: true },
    }),

    prisma.citizenReport.findMany({
      where: { status: "SUBMITTED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        reportCode: true,
        status: true,
        issueType: true,
        locationText: true,
        createdAt: true,
        submittedBy: { select: { name: true, email: true } },
        product: {
          select: { productName: true, brandName: true, category: true },
        },
      },
    }),
  ]);

  const map = new Map(statusCounts.map((s) => [s.status, s._count._all]));
  const segments: StatusSegment[] = [
    {
      key: "SUBMITTED",
      label: "Pending Review",
      value: map.get("SUBMITTED") ?? 0,
      color: "#F59E0B",
    },
    {
      key: "FORWARDED_TO_INSPECTOR",
      label: "Sent to Inspector",
      value: map.get("FORWARDED_TO_INSPECTOR") ?? 0,
      color: "#1769AA",
    },
    {
      key: "RESOLVED",
      label: "Resolved",
      value: map.get("RESOLVED") ?? 0,
      color: "#16A34A",
    },
    {
      key: "REJECTED",
      label: "Rejected",
      value: map.get("REJECTED") ?? 0,
      color: "#DC2626",
    },
  ];

  const totalReports = segments.reduce((sum, s) => sum + s.value, 0);

  const issueTypes: IssueTypeCount[] = issueGroups
    .map((g) => {
      const name = g.issueType ?? "Other";
      return {
        label: name,
        value: g._count._all,
        color: ISSUE_COLORS[name] ?? "#94A3B8",
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const queue: QueueRow[] = queueRows.map((r) => ({
    id: r.id,
    code: `#${r.reportCode}`,
    productName:
      r.product?.productName ?? r.product?.brandName ?? "Unknown product",
    brandName: r.product?.brandName ?? null,
    category: r.product?.category ?? null,
    issueType: r.issueType,
    locationText: r.locationText,
    submitterName: r.submittedBy.name ?? r.submittedBy.email.split("@")[0],
    createdAt: r.createdAt.toISOString(),
    status: r.status,
    statusLabel: STATUS_LABEL[r.status],
  }));

  return {
    reviewer: {
      name: reviewer.name ?? reviewer.email.split("@")[0],
      email: reviewer.email,
      imageUrl: reviewer.imageUrl,
      role: reviewer.role,
    },
    stats: { pendingReviews, forwardedCases, reviewedByYou },
    segments,
    totalReports,
    issueTypes,
    queue,
  };
}