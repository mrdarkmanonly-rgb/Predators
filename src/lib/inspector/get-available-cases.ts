import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type AvailableCase = {
  reportId: string;
  reportCode: string;
  productName: string;
  brandName: string | null;
  issueType: string | null;
  description: string | null;
  locationText: string | null;
  forwardedAt: string; // updatedAt when reviewer forwarded it
  createdAt: string;
};

export async function getAvailableCases(): Promise<AvailableCase[]> {
  await requireRole(["INSPECTOR"]); // ensures authed; discards returned user

  const reports = await prisma.citizenReport.findMany({
    where: {
      status: "FORWARDED_TO_INSPECTOR",
      inspection: null,
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      reportCode: true,
      issueType: true,
      description: true,
      locationText: true,
      updatedAt: true,
      createdAt: true,
      product: { select: { productName: true, brandName: true } },
    },
  });

  return reports.map((r) => ({
    reportId: r.id,
    reportCode: r.reportCode,
    productName:
      r.product?.productName ?? r.product?.brandName ?? "Unknown product",
    brandName: r.product?.brandName ?? null,
    issueType: r.issueType,
    description: r.description,
    locationText: r.locationText,
    forwardedAt: r.updatedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));
}