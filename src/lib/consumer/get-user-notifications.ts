import "server-only";

import prisma from "@/utils/prisma.client";
import { getCurrentUser } from "@/lib/auth-guard";

export type NotificationKind =
  | "FORWARDED_TO_INSPECTOR"
  | "REJECTED"
  | "RESOLVED";

export type UserNotification = {
  id: string;              // report id
  reportCode: string;
  productName: string;
  kind: NotificationKind;
  remark: string | null;
  occurredAt: string;      // ISO
};

export async function getUserNotifications(): Promise<
  UserNotification[] | null
> {
  const user = await getCurrentUser();
  if (!user) return null;

  const reports = await prisma.citizenReport.findMany({
    where: {
      submittedById: user.id,
      status: { in: ["FORWARDED_TO_INSPECTOR", "REJECTED", "RESOLVED"] },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      reportCode: true,
      status: true,
      resolutionRemarks: true,
      updatedAt: true,
      reviewedAt: true,
      resolvedAt: true,
      product: { select: { productName: true, brandName: true } },
    },
  });

  return reports.map((r) => {
    // choose the most relevant timestamp
    const occurredAt =
      r.resolvedAt ?? r.reviewedAt ?? r.updatedAt;

    return {
      id: r.id,
      reportCode: r.reportCode,
      productName:
        r.product?.productName ?? r.product?.brandName ?? "Unknown product",
      kind: r.status as NotificationKind,
      remark: r.resolutionRemarks,
      occurredAt: occurredAt.toISOString(),
    };
  });
}