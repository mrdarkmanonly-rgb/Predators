import "server-only";

import prisma from "@/utils/prisma.client";
import { getCurrentUser } from "@/lib/auth-guard";

export type UserProduct = {
  productId: string;
  productName: string;
  brandName: string | null;
  category: string | null;
  scanCount: number;
  lastScannedAt: string;
  latestStatus: "PROCESSING" | "COMPLETED" | "FAILED";
};

export async function getUserProducts(): Promise<UserProduct[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const scans = await prisma.scan.findMany({
    where: {
      userId: user.id,
      productId: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: {
      productId: true,
      status: true,
      createdAt: true,
      product: {
        select: {
          productName: true,
          brandName: true,
          category: true,
        },
      },
    },
  });

  // Group by productId (scans already sorted newest-first)
  const map = new Map<string, UserProduct>();
  for (const s of scans) {
    if (!s.productId || !s.product) continue;

    const existing = map.get(s.productId);
    if (existing) {
      existing.scanCount += 1;
      // latestStatus stays — it's the newest since orderBy desc
    } else {
      map.set(s.productId, {
        productId: s.productId,
        productName:
          s.product.productName ??
          s.product.brandName ??
          "Unknown product",
        brandName: s.product.brandName,
        category: s.product.category,
        scanCount: 1,
        lastScannedAt: s.createdAt.toISOString(),
        latestStatus: s.status,
      });
    }
  }

  return Array.from(map.values());
}