import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type AdminInspection = {
  id: string;
  reportId: string;
  reportCode: string;
  productName: string;
  locationText: string | null;
  inspectorName: string;
  inspectorEmail: string;
  claimedAt: string;
  completedAt: string | null;
  violationFound: boolean | null;
  isActive: boolean;
};

export async function getAdminInspections(): Promise<{
  active: AdminInspection[];
  completed: AdminInspection[];
  total: number;
}> {
  await requireRole(["ADMIN"]);

  const [total, inspections] = await Promise.all([
    prisma.inspection.count(),
    prisma.inspection.findMany({
      orderBy: { claimedAt: "desc" },
      take: 300,
      select: {
        id: true,
        claimedAt: true,
        completedAt: true,
        violationFound: true,
        report: {
          select: {
            id: true,
            reportCode: true,
            locationText: true,
            product: { select: { productName: true, brandName: true } },
          },
        },
        inspector: { select: { name: true, email: true } },
      },
    }),
  ]);

  const rows: AdminInspection[] = inspections.map((i) => ({
    id: i.id,
    reportId: i.report.id,
    reportCode: `#${i.report.reportCode}`,
    productName:
      i.report.product?.productName ??
      i.report.product?.brandName ??
      "Unknown product",
    locationText: i.report.locationText,
    inspectorName: i.inspector.name ?? i.inspector.email.split("@")[0],
    inspectorEmail: i.inspector.email,
    claimedAt: i.claimedAt.toISOString(),
    completedAt: i.completedAt?.toISOString() ?? null,
    violationFound: i.violationFound,
    isActive: i.completedAt === null,
  }));

  const active = rows.filter((r) => r.isActive);
  const completed = rows
    .filter((r) => !r.isActive)
    .sort((a, b) =>
      (b.completedAt ?? "").localeCompare(a.completedAt ?? ""),
    );

  return { active, completed, total };
}