import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type WeekPoint = {
  label: string;
  reviewed: number;
};

export type IssueRow = {
  label: string;
  value: number;
  color: string;
};

export type StatusRow = {
  key: "SUBMITTED" | "FORWARDED_TO_INSPECTOR" | "REJECTED" | "RESOLVED";
  label: string;
  value: number;
  color: string;
};

export type ReviewerAnalytics = {
  weeks: WeekPoint[];
  issues: IssueRow[];
  statuses: StatusRow[];
  totalReviewed: number;
  forwardedCount: number;
  rejectedCount: number;
  avgPerWeek: number;
};

const ISSUE_COLORS: Record<string, string> = {
  "Incorrect Weight": "#1769AA",
  "Misleading Label": "#16A34A",
  "Expired Product": "#F59E0B",
  "Price Mismatch": "#DC2626",
  Other: "#94A3B8",
};

const WEEKS = 12;
const DAY_MS = 86_400_000;

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

function weekLabel(d: Date): string {
  return `W of ${d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  })}`;
}

export async function getReviewerAnalytics(): Promise<ReviewerAnalytics> {
  const reviewer = await requireRole(["REVIEWER", "ADMIN"]);

  const now = new Date();
  const thisWeekStart = startOfWeek(now);
  const twelveWeeksAgo = new Date(
    thisWeekStart.getTime() - (WEEKS - 1) * 7 * DAY_MS,
  );

  const [reviewed, issueGroups, statusGroups] = await Promise.all([
    prisma.citizenReport.findMany({
      where: {
        reviewedById: reviewer.id,
        status: { not: "SUBMITTED" },
        reviewedAt: { gte: twelveWeeksAgo },
      },
      select: { reviewedAt: true },
    }),

    prisma.citizenReport.groupBy({
      by: ["issueType"],
      where: {
        reviewedById: reviewer.id,
        status: { not: "SUBMITTED" },
      },
      _count: { _all: true },
    }),

    prisma.citizenReport.groupBy({
      by: ["status"],
      where: { reviewedById: reviewer.id },
      _count: { _all: true },
    }),
  ]);

  // 12-week buckets
  const weeks: WeekPoint[] = [];
  for (let i = 0; i < WEEKS; i++) {
    const start = new Date(twelveWeeksAgo.getTime() + i * 7 * DAY_MS);
    weeks.push({ label: weekLabel(start), reviewed: 0 });
  }

  for (const r of reviewed) {
    if (!r.reviewedAt) continue;
    const idx = Math.floor(
      (startOfWeek(r.reviewedAt).getTime() - twelveWeeksAgo.getTime()) /
        (7 * DAY_MS),
    );
    if (idx >= 0 && idx < weeks.length) weeks[idx].reviewed += 1;
  }

  const issues: IssueRow[] = issueGroups
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

  const smap = new Map(statusGroups.map((s) => [s.status, s._count._all]));
  const statuses: StatusRow[] = [
    {
      key: "SUBMITTED",
      label: "Pending Review",
      value: smap.get("SUBMITTED") ?? 0,
      color: "#F59E0B",
    },
    {
      key: "FORWARDED_TO_INSPECTOR",
      label: "Sent to Inspector",
      value: smap.get("FORWARDED_TO_INSPECTOR") ?? 0,
      color: "#1769AA",
    },
    {
      key: "RESOLVED",
      label: "Resolved",
      value: smap.get("RESOLVED") ?? 0,
      color: "#16A34A",
    },
    {
      key: "REJECTED",
      label: "Rejected",
      value: smap.get("REJECTED") ?? 0,
      color: "#DC2626",
    },
  ];

  const totalReviewed = statuses
    .filter((s) => s.key !== "SUBMITTED")
    .reduce((sum, s) => sum + s.value, 0);
  const forwardedCount = smap.get("FORWARDED_TO_INSPECTOR") ?? 0;
  const rejectedCount = smap.get("REJECTED") ?? 0;

  return {
    weeks,
    issues,
    statuses,
    totalReviewed,
    forwardedCount,
    rejectedCount,
    avgPerWeek: totalReviewed > 0 ? totalReviewed / 12 : 0,
  };
}