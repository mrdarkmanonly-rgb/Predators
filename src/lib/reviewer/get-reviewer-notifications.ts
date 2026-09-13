import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type ReviewerNotification = {
  id: string;
  kind: "FORWARDED" | "REJECTED" | "NEW_PENDING";
  title: string;
  detail: string;
  reportCode: string;
  reportId: string;
  occurredAt: string;
};

export async function getReviewerNotifications(): Promise<
  ReviewerNotification[]
> {
  const reviewer = await requireRole(["REVIEWER", "ADMIN"]);

  const [myReviews, pendingReports] = await Promise.all([
    // Reports I have already acted on
    prisma.citizenReport.findMany({
      where: {
        reviewedById: reviewer.id,
        status: { not: "SUBMITTED" },
      },
      orderBy: { reviewedAt: "desc" },
      take: 20,
      select: {
        id: true,
        reportCode: true,
        status: true,
        reviewedAt: true,
        product: { select: { productName: true, brandName: true } },
      },
    }),

    // Reports currently pending (waiting for anyone to review)
    prisma.citizenReport.findMany({
      where: { status: "SUBMITTED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        reportCode: true,
        createdAt: true,
        product: { select: { productName: true, brandName: true } },
      },
    }),
  ]);

  const items: ReviewerNotification[] = [];

  for (const r of myReviews) {
    if (!r.reviewedAt) continue;
    const product =
      r.product?.productName ??
      r.product?.brandName ??
      "Unknown product";

    if (r.status === "FORWARDED_TO_INSPECTOR") {
      items.push({
        id: `fwd-${r.id}`,
        kind: "FORWARDED",
        title: "You forwarded a report",
        detail: `${r.reportCode} · ${product}`,
        reportCode: `#${r.reportCode}`,
        reportId: r.id,
        occurredAt: r.reviewedAt.toISOString(),
      });
    } else if (r.status === "REJECTED") {
      items.push({
        id: `rej-${r.id}`,
        kind: "REJECTED",
        title: "You rejected a report",
        detail: `${r.reportCode} · ${product}`,
        reportCode: `#${r.reportCode}`,
        reportId: r.id,
        occurredAt: r.reviewedAt.toISOString(),
      });
    } else if (r.status === "RESOLVED") {
      items.push({
        id: `res-${r.id}`,
        kind: "FORWARDED",
        title: "Report was resolved by inspector",
        detail: `${r.reportCode} · ${product}`,
        reportCode: `#${r.reportCode}`,
        reportId: r.id,
        occurredAt: r.reviewedAt.toISOString(),
      });
    }
  }

  for (const r of pendingReports) {
    const product =
      r.product?.productName ??
      r.product?.brandName ??
      "Unknown product";
    items.push({
      id: `pending-${r.id}`,
      kind: "NEW_PENDING",
      title: "New report awaiting review",
      detail: `${r.reportCode} · ${product}`,
      reportCode: `#${r.reportCode}`,
      reportId: r.id,
      occurredAt: r.createdAt.toISOString(),
    });
  }

  items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  return items.slice(0, 40);
}