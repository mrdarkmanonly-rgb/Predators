import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type MyReviewRow = {
  id: string;
  code: string;
  status: "FORWARDED_TO_INSPECTOR" | "REJECTED" | "RESOLVED";
  statusLabel: string;
  productName: string;
  brandName: string | null;
  issueType: string | null;
  locationText: string | null;
  submitterName: string;
  reviewedAt: string;
  resolutionRemarks: string | null;
};

const STATUS_LABEL: Record<MyReviewRow["status"], string> = {
  FORWARDED_TO_INSPECTOR: "Sent to Inspector",
  REJECTED: "Rejected",
  RESOLVED: "Resolved",
};

export async function getMyReviews(): Promise<MyReviewRow[]> {
  const reviewer = await requireRole(["REVIEWER", "ADMIN"]);

  const reports = await prisma.citizenReport.findMany({
    where: {
      reviewedById: reviewer.id,
      status: { not: "SUBMITTED" },
    },
    orderBy: { reviewedAt: "desc" },
    take: 200,
    select: {
      id: true,
      reportCode: true,
      status: true,
      issueType: true,
      locationText: true,
      reviewedAt: true,
      resolutionRemarks: true,
      submittedBy: { select: { name: true, email: true } },
      product: {
        select: { productName: true, brandName: true },
      },
    },
  });

  return reports.map((r) => ({
    id: r.id,
    code: `#${r.reportCode}`,
    status: r.status as MyReviewRow["status"],
    statusLabel: STATUS_LABEL[r.status as MyReviewRow["status"]],
    productName:
      r.product?.productName ?? r.product?.brandName ?? "Unknown product",
    brandName: r.product?.brandName ?? null,
    issueType: r.issueType,
    locationText: r.locationText,
    submitterName: r.submittedBy.name ?? r.submittedBy.email.split("@")[0],
    reviewedAt: r.reviewedAt?.toISOString() ?? r.reviewedAt!.toISOString(),
    resolutionRemarks: r.resolutionRemarks,
  }));
}
