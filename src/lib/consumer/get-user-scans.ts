import "server-only";

import prisma from "@/utils/prisma.client";
import { getCurrentUser } from "@/lib/auth-guard";

export type UserScan = {
  id: string;
  productId: string | null;
  productName: string;
  brandName: string | null;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  ocrConfidence: number | null;
};

export async function getUserScans(): Promise<UserScan[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const scans = await prisma.scan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      productId: true,
      status: true,
      createdAt: true,
      ocrConfidence: true,
      product: { select: { productName: true, brandName: true } },
    },
  });

  return scans.map((s) => ({
    id: s.id,
    productId: s.productId,
    productName:
      s.product?.productName ?? s.product?.brandName ?? "Unknown product",
    brandName: s.product?.brandName ?? null,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    ocrConfidence: s.ocrConfidence,
  }));
}