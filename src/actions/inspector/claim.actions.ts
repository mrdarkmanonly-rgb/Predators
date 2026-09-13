"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import prisma from "@/utils/prisma.client";

export type ClaimResult =
  | { ok: true; inspectionId: string }
  | { ok: false; reason: "ALREADY_CLAIMED" | "NOT_AVAILABLE" | "UNAUTHORIZED" };

export async function claimCase(reportId: string): Promise<ClaimResult> {
  const inspector = await requireRole(["INSPECTOR"]);

  // 1. verify the report is currently in the available pool
  const report = await prisma.citizenReport.findFirst({
    where: {
      id: reportId,
      status: "FORWARDED_TO_INSPECTOR",
      inspection: null, // not yet claimed
    },
    select: { id: true },
  });

  if (!report) {
    // either doesn't exist, isn't forwarded, or was already claimed
    return { ok: false, reason: "NOT_AVAILABLE" };
  }

  // 2. attempt to claim. `reportId @unique` guarantees exactly one winner.
  try {
    const inspection = await prisma.inspection.create({
      data: {
        reportId: report.id,
        inspectorId: inspector.id,
      },
      select: { id: true },
    });

    revalidatePath("/inspector");
    revalidatePath("/inspector/available");
    revalidatePath("/inspector/my-cases");

    return { ok: true, inspectionId: inspection.id };
  } catch (e: unknown) {
    // P2002 = unique constraint violation = already claimed by someone else
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return { ok: false, reason: "ALREADY_CLAIMED" };
    }
    throw e;
  }
}