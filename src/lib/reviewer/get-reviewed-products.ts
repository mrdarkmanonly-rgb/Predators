import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type ReviewedProduct = {
  productId: string;
  productName: string;
  brandName: string | null;
  category: string | null;
  reportCount: number;
  lastReviewedAt: string;
};

export async function getReviewedProducts(): Promise<{
  products: ReviewedProduct[];
  categories: string[];
}> {
  const reviewer = await requireRole(["REVIEWER", "ADMIN"]);

  // Reports I reviewed, with products
  const rows = await prisma.citizenReport.findMany({
    where: {
      reviewedById: reviewer.id,
      status: { not: "SUBMITTED" },
      productId: { not: null },
    },
    orderBy: { reviewedAt: "desc" },
    select: {
      reviewedAt: true,
      product: {
        select: {
          id: true,
          productName: true,
          brandName: true,
          category: true,
        },
      },
    },
  });

  const map = new Map<string, ReviewedProduct>();
  const categorySet = new Set<string>();

  for (const r of rows) {
    const p = r.product;
    if (!p || !r.reviewedAt) continue;

    if (p.category) categorySet.add(p.category);

    const existing = map.get(p.id);
    if (existing) {
      existing.reportCount += 1;
      // latest already at top since orderBy desc — no need to update lastReviewedAt
    } else {
      map.set(p.id, {
        productId: p.id,
        productName:
          p.productName ?? p.brandName ?? "Unknown product",
        brandName: p.brandName,
        category: p.category,
        reportCount: 1,
        lastReviewedAt: r.reviewedAt.toISOString(),
      });
    }
  }

  return {
    products: Array.from(map.values()),
    categories: Array.from(categorySet).sort(),
  };
}