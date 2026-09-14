"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import prisma from "@/utils/prisma.client";

export type InspectionFormData = {
  violationFound: boolean;
  violationType: string | null;
  observation: string | null;
  actionType: string | null;
  actionDetails: string | null;
  actionDate: string | null;
  followUpRequired: boolean;
  remarks: string;
  decision: "REJECT" | "RESOLVE";
};

export type ActionResult =
  | { ok: true }
  | { ok: false; reason: string };

export async function completeInspection(
  inspectionId: string,
  data: InspectionFormData,
): Promise<ActionResult> {
  const inspector = await requireRole(["INSPECTOR", "ADMIN"]);

  const trimmedRemark = data.remarks.trim();
  if (trimmedRemark.length < 5) {
    return { ok: false, reason: "A final remark is required." };
  }

  // race-safe: only claimer can complete; only if not already completed
  const inspection = await prisma.inspection.findFirst({
    where: {
      id: inspectionId,
      inspectorId: inspector.id,
      completedAt: null,
    },
    select: { id: true, reportId: true },
  });

  if (!inspection) {
    return {
      ok: false,
      reason: "Inspection not found, already completed, or not yours.",
    };
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.inspection.update({
      where: { id: inspection.id },
      data: {
        violationFound: data.violationFound,
        violationType: data.violationType,
        observation: data.observation,
        actionType: data.actionType,
        actionDetails: data.actionDetails,
        actionDate: data.actionDate ? new Date(data.actionDate) : null,
        followUpRequired: data.followUpRequired,
        remarks: trimmedRemark,
        completedAt: now,
      },
    }),
    prisma.citizenReport.update({
      where: { id: inspection.reportId },
      data: {
        status: data.decision === "REJECT" ? "REJECTED" : "RESOLVED",
        resolutionRemarks: trimmedRemark,
        resolvedAt: now,
      },
    }),
  ]);

  revalidatePath("/inspector");
  revalidatePath("/inspector/my-cases");
  revalidatePath("/inspector/history");
  revalidatePath(`/inspector/inspections/${inspectionId}`);

  return { ok: true };
}