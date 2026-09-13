import "server-only";

import prisma from "@/utils/prisma.client";
import { getCurrentUser } from "@/lib/auth-guard";
import { reportStatusLabel } from "./report-status";

export type UserReport = {
  id: string;
  reportCode: string;
  productId: string | null;
  productName: string;
  brandName: string | null;
  status: string; // already human-readable
  statusRaw: "SUBMITTED" | "FORWARDED_TO_INSPECTOR" | "REJECTED" | "RESOLVED";
  issueType: string | null;
  resolutionRemarks: string | null;
  createdAt: string;
};

export async function getUserReports(): Promise<UserReport[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const reports = await prisma.citizenReport.findMany({
    where: { submittedById: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reportCode: true,
      productId: true,
      status: true,
      issueType: true,
      resolutionRemarks: true,
      createdAt: true,
      product: { select: { productName: true, brandName: true } },
    },
  });

  return reports.map((r) => ({
    id: r.id,
    reportCode: r.reportCode,
    productId: r.productId,
    productName:
      r.product?.productName ?? r.product?.brandName ?? "Unknown product",
    brandName: r.product?.brandName ?? null,
    status: reportStatusLabel(r.status),
    statusRaw: r.status,
    issueType: r.issueType,
    resolutionRemarks: r.resolutionRemarks,
    createdAt: r.createdAt.toISOString(),
  }));
}