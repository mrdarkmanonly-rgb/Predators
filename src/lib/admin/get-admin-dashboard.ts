import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

// ── types ──────────────────────────────────────────────
export type AdminStats = {
  totalUsers: number;
  totalProducts: number;
  totalScans: number;
  totalReports: number;
  violationsFound: number;
  activeInspections: number;
  resolvedCases: number;
  pendingReviews: number;
};

export type TrendPoint = {
  label: string;      // e.g. "1 Sep"
  reports: number;
  violations: number;
};

export type IssueType = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

export type RecentReport = {
  id: string;         // report id
  code: string;       // "#CR-2026-00842"
  product: string;
  date: string;       // ISO
  status: "Pending Review" | "Sent to Inspector" | "Rejected" | "Resolved";
  statusRaw: "SUBMITTED" | "FORWARDED_TO_INSPECTOR" | "REJECTED" | "RESOLVED";
};

export type ActiveInspection = {
  id: string;         // inspection id
  code: string;       // "#INS-..."
  location: string;
  inspectorName: string;
  status: "In Progress";
};

export type RecentActivity = {
  id: string;
  type: "report" | "user" | "inspection" | "product";
  title: string;
  description: string;
  occurredAt: string; // ISO
};

export type AdminDashboardData = {
  admin: { name: string; email: string };
  stats: AdminStats;
  trends: TrendPoint[];
  issueTypes: IssueType[];
  recentReports: RecentReport[];
  activeInspections: ActiveInspection[];
  recentActivities: RecentActivity[];
};

// ── helpers ────────────────────────────────────────────
const ISSUE_COLORS: Record<string, string> = {
  "Incorrect Weight": "#1769AA",
  "Misleading Label": "#16A34A",
  "Expired Product": "#F59E0B",
  "Price Mismatch": "#DC2626",
  Other: "#94A3B8",
};

function reportStatusLabel(
  s: "SUBMITTED" | "FORWARDED_TO_INSPECTOR" | "REJECTED" | "RESOLVED",
): RecentReport["status"] {
  switch (s) {
    case "SUBMITTED": return "Pending Review";
    case "FORWARDED_TO_INSPECTOR": return "Sent to Inspector";
    case "REJECTED": return "Rejected";
    case "RESOLVED": return "Resolved";
  }
}

function dayLabel(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function buildLast15Days(): { start: Date; days: Date[] } {
  const days: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 14);
  for (let i = 0; i < 15; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return { start, days };
}

// ── loader ─────────────────────────────────────────────
export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const admin = await requireRole(["ADMIN"]);

  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 14);
  fifteenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalProducts,
    totalScans,
    totalReports,
    violationsFound,
    activeInspections,
    resolvedCases,
    pendingReviews,
    reportsInWindow,
    inspectionsInWindow,
    issueGrouped,
    recentReportsRaw,
    activeInspectionsRaw,
    recentReportRows,
    recentRoleLogs,
    recentCompletedInspections,
    recentProducts,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.product.count(),

    prisma.scan.count(),

    prisma.citizenReport.count(),

    prisma.inspection.count({ where: { violationFound: true } }),

    prisma.inspection.count({ where: { completedAt: null } }),

    prisma.citizenReport.count({ where: { status: "RESOLVED" } }),

    prisma.citizenReport.count({ where: { status: "SUBMITTED" } }),

    // for the 15-day trend
    prisma.citizenReport.findMany({
      where: { createdAt: { gte: fifteenDaysAgo } },
      select: { createdAt: true },
    }),

    // violations in window — by completed inspection
    prisma.inspection.findMany({
      where: {
        violationFound: true,
        completedAt: { gte: fifteenDaysAgo },
      },
      select: { completedAt: true },
    }),

    // issue type distribution
    prisma.citizenReport.groupBy({
      by: ["issueType"],
      _count: { _all: true },
    }),

    // recent reports for the list
    prisma.citizenReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        reportCode: true,
        status: true,
        createdAt: true,
        product: { select: { productName: true, brandName: true, category: true } },
      },
    }),

    // active inspections
    prisma.inspection.findMany({
      where: { completedAt: null },
      orderBy: { claimedAt: "desc" },
      take: 4,
      select: {
        id: true,
        report: {
          select: {
            reportCode: true,
            locationText: true,
          },
        },
        inspector: { select: { name: true, email: true } },
      },
    }),

    // activity sources
    prisma.citizenReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, reportCode: true, createdAt: true },
    }),

    prisma.roleChangeLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        newRole: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),

    prisma.inspection.findMany({
      where: { completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: {
        id: true,
        completedAt: true,
        report: { select: { reportCode: true } },
        inspector: { select: { name: true, email: true } },
      },
    }),

    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        productName: true,
        brandName: true,
        createdAt: true,
      },
    }),
  ]);

  // ── build 15-day trend ──
  const { days } = buildLast15Days();
  const trends: TrendPoint[] = days.map((d) => ({
    label: dayLabel(d),
    reports: 0,
    violations: 0,
  }));

  for (const r of reportsInWindow) {
    const idx = Math.floor(
      (r.createdAt.getTime() - fifteenDaysAgo.getTime()) / 86_400_000,
    );
    if (idx >= 0 && idx < trends.length) trends[idx].reports += 1;
  }
  for (const i of inspectionsInWindow) {
    if (!i.completedAt) continue;
    const idx = Math.floor(
      (i.completedAt.getTime() - fifteenDaysAgo.getTime()) / 86_400_000,
    );
    if (idx >= 0 && idx < trends.length) trends[idx].violations += 1;
  }

  // ── issue types ──
  const totalIssueReports = issueGrouped.reduce(
    (sum, g) => sum + g._count._all,
    0,
  );
  const issueTypes: IssueType[] = issueGrouped
    .map((g) => {
      const name = g.issueType ?? "Other";
      const value = g._count._all;
      const pct =
        totalIssueReports > 0
          ? Math.round((value / totalIssueReports) * 100)
          : 0;
      return {
        name,
        value,
        percentage: pct,
        color: ISSUE_COLORS[name] ?? "#94A3B8",
      };
    })
    .sort((a, b) => b.value - a.value);

  // ── recent reports ──
  const recentReports: RecentReport[] = recentReportsRaw.map((r) => ({
    id: r.id,
    code: `#${r.reportCode}`,
    product:
      r.product?.productName ??
      r.product?.category ??
      r.product?.brandName ??
      "Unknown product",
    date: r.createdAt.toISOString(),
    status: reportStatusLabel(r.status),
    statusRaw: r.status,
  }));

  // ── active inspections ──
  const activeInspectionList: ActiveInspection[] = activeInspectionsRaw.map(
    (i) => ({
      id: i.id,
      code: `#${i.report.reportCode}`,
      location: i.report.locationText ?? "Location not recorded",
      inspectorName:
        i.inspector.name ?? i.inspector.email.split("@")[0],
      status: "In Progress",
    }),
  );

  // ── recent activities (merged) ──
  const activities: RecentActivity[] = [];

  for (const r of recentReportRows) {
    activities.push({
      id: `report-${r.id}`,
      type: "report",
      title: "New report submitted",
      description: `#${r.reportCode}`,
      occurredAt: r.createdAt.toISOString(),
    });
  }

  for (const log of recentRoleLogs) {
    activities.push({
      id: `role-${log.id}`,
      type: "user",
      title: "User role updated",
      description: `${log.user.name ?? log.user.email.split("@")[0]} → ${log.newRole}`,
      occurredAt: log.createdAt.toISOString(),
    });
  }

  for (const i of recentCompletedInspections) {
    if (!i.completedAt) continue;
    activities.push({
      id: `inspection-${i.id}`,
      type: "inspection",
      title: "Inspection completed",
      description: `#${i.report.reportCode}`,
      occurredAt: i.completedAt.toISOString(),
    });
  }

  for (const p of recentProducts) {
    activities.push({
      id: `product-${p.id}`,
      type: "product",
      title: "Product added",
      description: p.productName ?? p.brandName ?? "Unnamed product",
      occurredAt: p.createdAt.toISOString(),
    });
  }

  activities.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const recentActivities = activities.slice(0, 8);

  return {
    admin: {
      name: admin.name ?? admin.email.split("@")[0],
      email: admin.email,
    },
    stats: {
      totalUsers,
      totalProducts,
      totalScans,
      totalReports,
      violationsFound,
      activeInspections,
      resolvedCases,
      pendingReviews,
    },
    trends,
    issueTypes,
    recentReports,
    activeInspections: activeInspectionList,
    recentActivities,
  };
}