import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type InspectorStats = {
  availableCases: number;
  myCases: number;
  completed: number;
  violations: number;
  actions: number;
};

export type CaseSegment = {
  label: string;
  value: number;
  color: string;
};

export type ActivityItem = {
  id: string;
  tone: "green" | "blue" | "amber";
  title: string;
  detail: string;
  time: string;
  occurredAt: string;
};

export type ViolationTypeCount = {
  label: string;
  value: number;
  color: string;
};

export type InspectorDashboardData = {
  inspector: {
    name: string;
    email: string;
    role: string;
    imageUrl: string | null;
  };
  stats: InspectorStats;
  segments: CaseSegment[];
  totalCases: number;
  recentActivity: ActivityItem[];
  violationsByType: ViolationTypeCount[];
};

function relativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function getInspectorDashboard(): Promise<InspectorDashboardData> {
  const inspector = await requireRole(["INSPECTOR"]);

  const [
    availableCases,
    myCases,
    completed,
    violations,
    actions,
    recentInspections,
    violationTypeRows,
  ] = await Promise.all([
    prisma.citizenReport.count({
      where: {
        status: "FORWARDED_TO_INSPECTOR",
        inspection: null,
      },
    }),

    prisma.inspection.count({
      where: { inspectorId: inspector.id, completedAt: null },
    }),

    prisma.inspection.count({
      where: {
        inspectorId: inspector.id,
        completedAt: { not: null },
      },
    }),

    prisma.inspection.count({
      where: { inspectorId: inspector.id, violationFound: true },
    }),

    prisma.inspection.count({
      where: {
        inspectorId: inspector.id,
        actionType: { not: null },
      },
    }),

    prisma.inspection.findMany({
      where: { inspectorId: inspector.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        claimedAt: true,
        completedAt: true,
        violationFound: true,
        report: {
          select: {
            reportCode: true,
            product: { select: { productName: true, brandName: true } },
          },
        },
      },
    }),

    prisma.inspection.findMany({
      where: {
        inspectorId: inspector.id,
        completedAt: { not: null },
        violationFound: true,
        violationType: { not: null },
      },
      select: { violationType: true },
    }),
  ]);

  const activity: ActivityItem[] = [];

  for (const i of recentInspections) {
    const product =
      i.report.product?.productName ??
      i.report.product?.brandName ??
      "Unknown product";

    if (i.completedAt) {
      activity.push({
        id: `done-${i.id}`,
        tone: i.violationFound ? "amber" : "green",
        title: i.violationFound
          ? "Inspection completed · Violation found"
          : "Inspection completed",
        detail: `${i.report.reportCode} · ${product}`,
        time: relativeTime(i.completedAt),
        occurredAt: i.completedAt.toISOString(),
      });
    } else {
      activity.push({
        id: `claim-${i.id}`,
        tone: "blue",
        title: "Case claimed",
        detail: `${i.report.reportCode} · ${product}`,
        time: relativeTime(i.claimedAt),
        occurredAt: i.claimedAt.toISOString(),
      });
    }
  }

  activity.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const trimmed = activity.slice(0, 5);

  // ── build violations-by-type ──
  const VIOLATION_TYPES = [
    { key: "Incorrect Weight", color: "#1769AA" },
    { key: "Misleading Label", color: "#16A34A" },
    { key: "Expired Product", color: "#F59E0B" },
    { key: "Price Mismatch", color: "#DC2626" },
    { key: "Other", color: "#627D98" },
  ];

  const typeCounts = new Map<string, number>();
  for (const row of violationTypeRows) {
    const k = row.violationType ?? "Other";
    typeCounts.set(k, (typeCounts.get(k) ?? 0) + 1);
  }

  const violationsByType: ViolationTypeCount[] = VIOLATION_TYPES.map((t) => ({
    label: t.key,
    value: typeCounts.get(t.key) ?? 0,
    color: t.color,
  })).filter((t) => t.value > 0);

  return {
    inspector: {
      name: inspector.name ?? inspector.email.split("@")[0],
      email: inspector.email,
      role: inspector.role,
      imageUrl: inspector.imageUrl,
    },
    stats: { availableCases, myCases, completed, violations, actions },
    segments: [
      { label: "Available", value: availableCases, color: "#1769AA" },
      { label: "My Cases", value: myCases, color: "#F59E0B" },
      { label: "Completed", value: completed, color: "#16A34A" },
      { label: "Violations", value: violations, color: "#DC2626" },
    ],
    totalCases: availableCases + myCases + completed,
    recentActivity: trimmed,
    violationsByType,
  };
}