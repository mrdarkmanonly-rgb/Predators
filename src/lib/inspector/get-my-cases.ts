import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type MyCase = {
  inspectionId: string;
  reportId: string;
  reportCode: string;
  productName: string;
  brandName: string | null;
  issueType: string | null;
  locationText: string | null;
  claimedAt: string;
  completedAt: string | null;
  violationFound: boolean | null;
};

export async function getMyCases(): Promise<MyCase[]> {
  const inspector = await requireRole(["INSPECTOR"]);

  const inspections = await prisma.inspection.findMany({
    where: {
      inspectorId: inspector.id,
      completedAt: null, // active cases only
    },
    orderBy: { claimedAt: "desc" },
    select: {
      id: true,
      claimedAt: true,
      completedAt: true,
      violationFound: true,
      report: {
        select: {
          id: true,
          reportCode: true,
          issueType: true,
          locationText: true,
          product: { select: { productName: true, brandName: true } },
        },
      },
    },
  });

  return inspections.map((i) => ({
    inspectionId: i.id,
    reportId: i.report.id,
    reportCode: i.report.reportCode,
    productName:
      i.report.product?.productName ??
      i.report.product?.brandName ??
      "Unknown product",
    brandName: i.report.product?.brandName ?? null,
    issueType: i.report.issueType,
    locationText: i.report.locationText,
    claimedAt: i.claimedAt.toISOString(),
    completedAt: i.completedAt?.toISOString() ?? null,
    violationFound: i.violationFound,
  }));
}