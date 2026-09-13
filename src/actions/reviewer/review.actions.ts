"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import prisma from "@/utils/prisma.client";

export type ReviewActionResult =
  | { ok: true }
  | { ok: false; reason: string };

export async function rejectReport(
  reportId: string,
  remark: string,
): Promise<ReviewActionResult> {
  const reviewer = await requireRole(["REVIEWER", "ADMIN"]);

  const trimmed = remark.trim();
  if (trimmed.length < 5) {
    return { ok: false, reason: "A reviewer remark is required." };
  }

  const updated = await prisma.citizenReport.updateMany({
    where: { id: reportId, status: "SUBMITTED" },
    data: {
      status: "REJECTED",
      reviewedById: reviewer.id,
      reviewedAt: new Date(),
      resolutionRemarks: trimmed,
    },
  });

  if (updated.count === 0) {
    return { ok: false, reason: "This report is no longer pending review." };
  }

  revalidatePath("/reviewer");
  revalidatePath("/reviewer/reports");
  revalidatePath(`/reviewer/reports/${reportId}`);

  return { ok: true };
}

export async function forwardReport(
  reportId: string,
  remark: string,
): Promise<ReviewActionResult> {
  const reviewer = await requireRole(["REVIEWER", "ADMIN"]);

  const trimmed = remark.trim();
  if (trimmed.length < 5) {
    return { ok: false, reason: "A forwarding note is required." };
  }

  const updated = await prisma.citizenReport.updateMany({
    where: { id: reportId, status: "SUBMITTED" },
    data: {
      status: "FORWARDED_TO_INSPECTOR",
      reviewedById: reviewer.id,
      reviewedAt: new Date(),
      resolutionRemarks: trimmed,
    },
  });

  if (updated.count === 0) {
    return { ok: false, reason: "This report is no longer pending review." };
  }

  revalidatePath("/reviewer");
  revalidatePath("/reviewer/reports");
  revalidatePath(`/reviewer/reports/${reportId}`);

  return { ok: true };
}