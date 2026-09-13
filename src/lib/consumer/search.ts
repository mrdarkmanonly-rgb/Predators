import "server-only";

import prisma from "@/utils/prisma.client";
import { getCurrentUser } from "@/lib/auth-guard";

export type SearchResults = {
  scans: {
    id: string;
    productName: string;
    status: string;
    createdAt: string;
  }[];
  reports: {
    id: string;
    reportCode: string;
    productName: string;
    status: string;
    createdAt: string;
  }[];
};

export async function searchUserData(q: string): Promise<SearchResults | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const query = q.trim();
  if (!query) return { scans: [], reports: [] };

  const [scans, reports] = await Promise.all([
    prisma.scan.findMany({
      where: {
        userId: user.id,
        OR: [
          { product: { productName: { contains: query, mode: "insensitive" } } },
          { product: { brandName: { contains: query, mode: "insensitive" } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        status: true,
        createdAt: true,
        product: { select: { productName: true, brandName: true } },
      },
    }),

    prisma.citizenReport.findMany({
      where: {
        submittedById: user.id,
        OR: [
          { reportCode: { contains: query, mode: "insensitive" } },
          { product: { productName: { contains: query, mode: "insensitive" } } },
          { product: { brandName: { contains: query, mode: "insensitive" } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        reportCode: true,
        status: true,
        createdAt: true,
        product: { select: { productName: true, brandName: true } },
      },
    }),
  ]);

  return {
    scans: scans.map((s) => ({
      id: s.id,
      productName:
        s.product?.productName ?? s.product?.brandName ?? "Unknown product",
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    })),
    reports: reports.map((r) => ({
      id: r.id,
      reportCode: r.reportCode,
      productName:
        r.product?.productName ?? r.product?.brandName ?? "Unknown product",
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}