import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type InspectorNotificationKind =
  | "AVAILABLE"
  | "CLAIMED"
  | "COMPLETED";

export type InspectorNotification = {
  id: string;
  kind: InspectorNotificationKind;
  reportCode: string;
  productName: string;
  detail: string;
  occurredAt: string;
  href: string;
};

export async function getInspectorNotifications(): Promise<
  InspectorNotification[]
> {
  const inspector = await requireRole(["INSPECTOR"]);

  const [availableReports, myInspections] = await Promise.all([
    // available cases (unclaimed forwarded reports)
    prisma.citizenReport.findMany({
      where: {
        status: "FORWARDED_TO_INSPECTOR",
        inspection: null,
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        reportCode: true,
        updatedAt: true,
        product: { select: { productName: true, brandName: true } },
      },
    }),

    // my claimed/completed inspections
    prisma.inspection.findMany({
      where: { inspectorId: inspector.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
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
  ]);

  const list: InspectorNotification[] = [];

  for (const r of availableReports) {
    const product =
      r.product?.productName ?? r.product?.brandName ?? "Unknown product";
    list.push({
      id: `avail-${r.id}`,
      kind: "AVAILABLE",
      reportCode: r.reportCode,
      productName: product,
      detail: "New case available",
      occurredAt: r.updatedAt.toISOString(),
      href: "/inspector/available",
    });
  }

  for (const i of myInspections) {
    const product =
      i.report.product?.productName ??
      i.report.product?.brandName ??
      "Unknown product";

    if (i.completedAt) {
      list.push({
        id: `done-${i.id}`,
        kind: "COMPLETED",
        reportCode: i.report.reportCode,
        productName: product,
        detail: i.violationFound
          ? "Inspection completed · Violation found"
          : "Inspection completed · No violation",
        occurredAt: i.completedAt.toISOString(),
        href: "/inspector/history",
      });
    } else {
      list.push({
        id: `claim-${i.id}`,
        kind: "CLAIMED",
        reportCode: i.report.reportCode,
        productName: product,
        detail: "You claimed this case",
        occurredAt: i.claimedAt.toISOString(),
        href: "/inspector/my-cases",
      });
    }
  }

  list.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return list.slice(0, 30);
}