import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type HistoryItem = {
  inspectionId: string;
  reportId: string;
  reportCode: string;
  productName: string;
  brandName: string | null;
  issueType: string | null;
  locationText: string | null;
  completedAt: string;
  claimedAt: string;
  violationFound: boolean;
  violationType: string | null;
  observation: string | null;
  actionType: string | null;
  followUpRequired: boolean | null;
  remarks: string | null;
  reportStatus: "RESOLVED" | "REJECTED";
};

export async function getInspectionHistory(): Promise<HistoryItem[]> {
  const inspector = await requireRole(["INSPECTOR"]);

  const inspections = await prisma.inspection.findMany({
    where: {
      inspectorId: inspector.id,
      completedAt: { not: null },
    },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      claimedAt: true,
      completedAt: true,
      violationFound: true,
      violationType: true,
      observation: true,
      actionType: true,
      followUpRequired: true,
      remarks: true,
      report: {
        select: {
          id: true,
          reportCode: true,
          status: true,
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
    completedAt: i.completedAt!.toISOString(),
    claimedAt: i.claimedAt.toISOString(),
    violationFound: i.violationFound ?? false,
    violationType: i.violationType,
    observation: i.observation,
    actionType: i.actionType,
    followUpRequired: i.followUpRequired,
    remarks: i.remarks,
    reportStatus:
      i.report.status === "RESOLVED" ? "RESOLVED" : "REJECTED",
  }));
}