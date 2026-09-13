import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type AdminProduct = {
  id: string;
  productName: string;
  brandName: string | null;
  category: string | null;
  manufacturer: string | null;
  mrp: string | null;
  netQuantity: string | null;
  scansCount: number;
  reportsCount: number;
  createdAt: string;
};

const LIMIT = 200;

export async function getAdminProducts(): Promise<{
  products: AdminProduct[];
  categories: string[];
  total: number;
  capped: boolean;
}> {
  await requireRole(["ADMIN"]);

  const [total, products, categoryRows] = await Promise.all([
    prisma.product.count(),

    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      select: {
        id: true,
        productName: true,
        brandName: true,
        category: true,
        manufacturer: true,
        mrp: true,
        netQuantityValue: true,
        netQuantityUnit: true,
        createdAt: true,
        _count: {
          select: { scans: true, reports: true },
        },
      },
    }),

    prisma.product.findMany({
      where: { category: { not: null } },
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ]);

  const rows: AdminProduct[] = products.map((p) => {
    const qty =
      p.netQuantityValue != null
        ? `${p.netQuantityValue.toString()}${
            p.netQuantityUnit ? ` ${p.netQuantityUnit}` : ""
          }`
        : null;

    return {
      id: p.id,
      productName: p.productName ?? p.brandName ?? "Unknown product",
      brandName: p.brandName,
      category: p.category,
      manufacturer: p.manufacturer,
      mrp: p.mrp != null ? `₹${p.mrp.toString()}` : null,
      netQuantity: qty,
      scansCount: p._count.scans,
      reportsCount: p._count.reports,
      createdAt: p.createdAt.toISOString(),
    };
  });

  const categories = categoryRows
    .map((c) => c.category)
    .filter((c): c is string => Boolean(c));

  return {
    products: rows,
    categories,
    total,
    capped: total > LIMIT,
  };
}