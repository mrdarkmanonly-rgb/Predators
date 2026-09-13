import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type WeekPoint = {
  label: string; // "W of 8 Sep"
  reports: number;
  violations: number;
};

export type FunnelRow = {
  key: "SUBMITTED" | "FORWARDED_TO_INSPECTOR" | "RESOLVED" | "REJECTED";
  label: string;
  value: number;
  color: string;
};

export type TopInspector = {
  id: string;
  name: string;
  email: string;
  claimed: number;
  completed: number;
  violations: number;
};

export type TopProduct = {
  id: string;
  name: string;
  category: string | null;
  reports: number;
};

export type AnalyticsData = {
  weeks: WeekPoint[];
  funnel: FunnelRow[];
  topInspectors: TopInspector[];
  topProducts: TopProduct[];
  avgResolutionDays: number | null;
  avgClaimDays: number | null;
  totalReports: number;
  totalInspections: number;
};

const WEEKS = 12;
const DAY_MS = 86_400_000;

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = x.getDay(); // 0 = Sun
  x.setDate(x.getDate() - dow);
  return x;
}

function weekLabel(d: Date): string {
  return `W of ${d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })}`;
}

export async function getAdminAnalytics(): Promise<AnalyticsData> {
  await requireRole(["ADMIN"]);

  const now = new Date();
  const thisWeekStart = startOfWeek(now);
  const twelveWeeksAgo = new Date(
    thisWeekStart.getTime() - (WEEKS - 1) * 7 * DAY_MS,
  );

  const [
    reportsInWindow,
    violationsInWindow,
    funnelRaw,
    inspectionGroups,
    productReportGroups,
    resolvedReports,
    totalReports,
    totalInspections,
  ] = await Promise.all([
    // reports per week
    prisma.citizenReport.findMany({
      where: { createdAt: { gte: twelveWeeksAgo } },
      select: { createdAt: true },
    }),

    // violations per week
    prisma.inspection.findMany({
      where: {
        violationFound: true,
        completedAt: { gte: twelveWeeksAgo },
      },
      select: { completedAt: true },
    }),

    // status counts
    prisma.citizenReport.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),

    // inspectors leaderboard
    prisma.inspection.groupBy({
      by: ["inspectorId"],
      _count: { _all: true },
    }),

    // products with most reports
    prisma.citizenReport.groupBy({
      by: ["productId"],
      _count: { _all: true },
      where: { productId: { not: null } },
    }),

    // resolved reports for avg resolution time
    prisma.citizenReport.findMany({
      where: { status: "RESOLVED", resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    }),

    prisma.citizenReport.count(),
    prisma.inspection.count(),
  ]);

  // ── weekly buckets ──
  const weeks: WeekPoint[] = [];
  for (let i = 0; i < WEEKS; i++) {
    const start = new Date(twelveWeeksAgo.getTime() + i * 7 * DAY_MS);
    weeks.push({ label: weekLabel(start), reports: 0, violations: 0 });
  }
  const bucketIndex = (d: Date) => {
    const diff = startOfWeek(d).getTime() - twelveWeeksAgo.getTime();
    return Math.floor(diff / (7 * DAY_MS));
  };

  for (const r of reportsInWindow) {
    const idx = bucketIndex(r.createdAt);
    if (idx >= 0 && idx < weeks.length) weeks[idx].reports += 1;
  }
  for (const v of violationsInWindow) {
    if (!v.completedAt) continue;
    const idx = bucketIndex(v.completedAt);
    if (idx >= 0 && idx < weeks.length) weeks[idx].violations += 1;
  }

  // ── funnel ──
  const funnelMap = new Map(funnelRaw.map((f) => [f.status, f._count._all]));
  const funnel: FunnelRow[] = [
    {
      key: "SUBMITTED",
      label: "Pending Review",
      value: funnelMap.get("SUBMITTED") ?? 0,
      color: "#F59E0B",
    },
    {
      key: "FORWARDED_TO_INSPECTOR",
      label: "Sent to Inspector",
      value: funnelMap.get("FORWARDED_TO_INSPECTOR") ?? 0,
      color: "#1769AA",
    },
    {
      key: "RESOLVED",
      label: "Resolved",
      value: funnelMap.get("RESOLVED") ?? 0,
      color: "#16A34A",
    },
    {
      key: "REJECTED",
      label: "Rejected",
      value: funnelMap.get("REJECTED") ?? 0,
      color: "#DC2626",
    },
  ];

  // ── inspectors ──
  const inspectorIds = inspectionGroups.map((g) => g.inspectorId);
  const inspectors = inspectorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: inspectorIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const inspectorMap = new Map(inspectors.map((u) => [u.id, u]));

  // completed + violations per inspector
  const completedByInspector = await prisma.inspection.groupBy({
    by: ["inspectorId"],
    where: { completedAt: { not: null } },
    _count: { _all: true },
  });
  const violationsByInspector = await prisma.inspection.groupBy({
    by: ["inspectorId"],
    where: { violationFound: true },
    _count: { _all: true },
  });

  const completedMap = new Map(
    completedByInspector.map((g) => [g.inspectorId, g._count._all]),
  );
  const violationsMap = new Map(
    violationsByInspector.map((g) => [g.inspectorId, g._count._all]),
  );

  const topInspectors: TopInspector[] = inspectionGroups
    .map((g) => {
      const u = inspectorMap.get(g.inspectorId);
      return {
        id: g.inspectorId,
        name: u?.name ?? u?.email.split("@")[0] ?? "Unknown",
        email: u?.email ?? "",
        claimed: g._count._all,
        completed: completedMap.get(g.inspectorId) ?? 0,
        violations: violationsMap.get(g.inspectorId) ?? 0,
      };
    })
    .sort((a, b) => b.claimed - a.claimed)
    .slice(0, 5);

  // ── top products ──
  const productIds = productReportGroups
    .map((g) => g.productId)
    .filter((id): id is string => Boolean(id));
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          productName: true,
          brandName: true,
          category: true,
        },
      })
    : [];
  const productMap = new Map(products.map((p) => [p.id, p]));

  const topProducts: TopProduct[] = productReportGroups
    .map((g) => {
      const p = g.productId ? productMap.get(g.productId) : undefined;
      return {
        id: g.productId ?? "unknown",
        name: p?.productName ?? p?.brandName ?? "Unknown product",
        category: p?.category ?? null,
        reports: g._count._all,
      };
    })
    .sort((a, b) => b.reports - a.reports)
    .slice(0, 5);

  // ── averages ──
  const avgResolutionDays =
    resolvedReports.length > 0
      ? resolvedReports.reduce((sum, r) => {
          if (!r.resolvedAt) return sum;
          return sum + (r.resolvedAt.getTime() - r.createdAt.getTime());
        }, 0) /
        resolvedReports.length /
        DAY_MS
      : null;

  return {
    weeks,
    funnel,
    topInspectors,
    topProducts,
    avgResolutionDays,
    avgClaimDays: null, // future: needs updatedAt-as-forwarded-time
    totalReports,
    totalInspections,
  };
}