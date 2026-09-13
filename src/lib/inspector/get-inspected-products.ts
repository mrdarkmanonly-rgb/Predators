import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type InspectedProduct = {
  productId: string;
  productName: string;
  brandName: string | null;
  category: string | null;
  inspectionCount: number;
  lastInspectedAt: string;
  latestStatus: "RESOLVED" | "REJECTED";
  latestViolationFound: boolean;
  hasAnyViolation: boolean; // any past inspection of this product found a violation
};

export async function getInspectedProducts(): Promise<InspectedProduct[]> {
  const inspector = await requireRole(["INSPECTOR"]);

  const inspections = await prisma.inspection.findMany({
    where: {
      inspectorId: inspector.id,
      completedAt: { not: null },
      report: { productId: { not: null } },
    },
    orderBy: { completedAt: "desc" },
    select: {
      completedAt: true,
      violationFound: true,
      report: {
        select: {
          status: true,
          product: {
            select: {
              id: true,
              productName: true,
              brandName: true,
              category: true,
            },
          },
        },
      },
    },
  });

  // group by productId (inspections already newest-first)
  const map = new Map<string, InspectedProduct>();

  for (const i of inspections) {
    const p = i.report.product;
    if (!p) continue;

    const existing = map.get(p.id);
    const thisViolation = i.violationFound ?? false;
    const thisStatus =
      i.report.status === "RESOLVED" ? "RESOLVED" : "REJECTED";

    if (existing) {
      existing.inspectionCount += 1;
      existing.hasAnyViolation = existing.hasAnyViolation || thisViolation;
    } else {
      map.set(p.id, {
        productId: p.id,
        productName: p.productName ?? p.brandName ?? "Unknown product",
        brandName: p.brandName,
        category: p.category,
        inspectionCount: 1,
        lastInspectedAt: i.completedAt!.toISOString(),
        latestStatus: thisStatus,
        latestViolationFound: thisViolation,
        hasAnyViolation: thisViolation,
      });
    }
  }

  return Array.from(map.values());
}