import "server-only";

import prisma from "@/utils/prisma.client";
import { getCurrentUser } from "@/lib/auth-guard";
import { reportStatusLabel } from "./report-status";

export type DashboardScan = {
  id: string;
  productName: string;
  createdAt: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
};

export type DashboardReport = {
  id: string;
  reportCode: string;
  productName: string;
  createdAt: string;
  status: string;
  resolutionRemarks: string | null;
};

export type DashboardData = {
  user: { name: string; email: string; imageUrl: string | null; role: string };
  stats: {
    totalScans: number;
    reportsSubmitted: number;
    pendingReports: number;
    resolvedReports: number;
    productsChecked: number;
  };
  recentScans: DashboardScan[];
  recentReports: DashboardReport[];
};

const RECENT_LIMIT = 4;

export async function getUserDashboard(): Promise<DashboardData | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const userId = user.id;

  const [
    totalScans,
    reportsSubmitted,
    pendingReports,
    resolvedReports,
    distinctProducts,
    scans,
    reports,
  ] = await Promise.all([
    prisma.scan.count({ where: { userId } }),

    prisma.citizenReport.count({ where: { submittedById: userId } }),

    prisma.citizenReport.count({
      where: {
        submittedById: userId,
        status: { in: ["SUBMITTED", "FORWARDED_TO_INSPECTOR"] },
      },
    }),

    prisma.citizenReport.count({
      where: { submittedById: userId, status: "RESOLVED" },
    }),

    prisma.scan.findMany({
      where: { userId, productId: { not: null } },
      distinct: ["productId"],
      select: { productId: true },
    }),

    prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: RECENT_LIMIT,
      select: {
        id: true,
        status: true,
        createdAt: true,
        product: { select: { productName: true, brandName: true } },
      },
    }),

    prisma.citizenReport.findMany({
      where: { submittedById: userId },
      orderBy: { createdAt: "desc" },
      take: RECENT_LIMIT,
      select: {
        id: true,
        reportCode: true,
        status: true,
        createdAt: true,
        resolutionRemarks: true,
        product: { select: { productName: true, brandName: true } },
      },
    }),
  ]);

  return {
    user: {
      name: user.name ?? user.email.split("@")[0],
      email: user.email,
      imageUrl: user.imageUrl,
      role: user.role,
    },
    stats: {
      totalScans,
      reportsSubmitted,
      pendingReports,
      resolvedReports,
      productsChecked: distinctProducts.length,
    },
    recentScans: scans.map((s) => ({
      id: s.id,
      productName:
        s.product?.productName ?? s.product?.brandName ?? "Unknown product",
      createdAt: s.createdAt.toISOString(),
      status: s.status,
    })),
    recentReports: reports.map((r) => ({
      id: r.id,
      reportCode: r.reportCode,
      productName:
        r.product?.productName ?? r.product?.brandName ?? "Unknown product",
      createdAt: r.createdAt.toISOString(),
      status: reportStatusLabel(r.status),
      resolutionRemarks: r.resolutionRemarks,
    })),
  };
}