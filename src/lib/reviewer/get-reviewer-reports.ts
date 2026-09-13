import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type ReportStatusKey =
  | "SUBMITTED"
  | "FORWARDED_TO_INSPECTOR"
  | "REJECTED"
  | "RESOLVED";

export type ReviewerReportRow = {
  id: string;
  code: string;
  status: ReportStatusKey;
  statusLabel: string;
  productName: string;
  brandName: string | null;
  category: string | null;
  issueType: string | null;
  locationText: string | null;
  submitterName: string;
  reviewedByName: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

const STATUS_LABEL: Record<ReportStatusKey, string> = {
  SUBMITTED: "Pending Review",
  FORWARDED_TO_INSPECTOR: "Sent to Inspector",
  REJECTED: "Rejected",
  RESOLVED: "Resolved",
};

export function reviewerReportStatusLabel(s: ReportStatusKey): string {
  return STATUS_LABEL[s];
}

export async function getReviewerReports(): Promise<{
  rows: ReviewerReportRow[];
  total: number;
}> {
  await requireRole(["REVIEWER", "ADMIN"]);

  const [total, reports] = await Promise.all([
    prisma.citizenReport.count(),
    prisma.citizenReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        reportCode: true,
        status: true,
        issueType: true,
        locationText: true,
        createdAt: true,
        reviewedAt: true,
        submittedBy: { select: { name: true, email: true } },
        reviewedBy: { select: { name: true, email: true } },
        product: {
          select: { productName: true, brandName: true, category: true },
        },
      },
    }),
  ]);

  const rows: ReviewerReportRow[] = reports.map((r) => ({
    id: r.id,
    code: `#${r.reportCode}`,
    status: r.status,
    statusLabel: STATUS_LABEL[r.status],
    productName:
      r.product?.productName ?? r.product?.brandName ?? "Unknown product",
    brandName: r.product?.brandName ?? null,
    category: r.product?.category ?? null,
    issueType: r.issueType,
    locationText: r.locationText,
    submitterName: r.submittedBy.name ?? r.submittedBy.email.split("@")[0],
    reviewedByName: r.reviewedBy
      ? r.reviewedBy.name ?? r.reviewedBy.email.split("@")[0]
      : null,
    createdAt: r.createdAt.toISOString(),
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
  }));

  return { rows, total };
}