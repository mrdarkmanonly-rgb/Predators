import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type ReviewerReportDetail = {
  id: string;
  code: string;
  status: "SUBMITTED" | "FORWARDED_TO_INSPECTOR" | "REJECTED" | "RESOLVED";
  statusLabel: string;
  issueType: string | null;
  description: string | null;
  locationText: string | null;
  shopName: string | null;
  shopAddress: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  createdAt: string;
  reviewedAt: string | null;
  resolvedAt: string | null;
  resolutionRemarks: string | null;
  submitter: { name: string; email: string };
  reviewer: { name: string; email: string } | null;
  product: {
    id: string;
    productName: string | null;
    brandName: string | null;
    category: string | null;
    manufacturer: string | null;
    mrp: string | null;
    netQuantity: string | null;
  } | null;
  evidence: {
    id: string;
    secureUrl: string;
    imageType: "FRONT" | "BACK" | "SIDE" | "ADDITIONAL";
  }[];
  scan: {
    id: string;
    ocrConfidence: number | null;
    ocrEngine: string | null;
    ocrVersion: string | null;
  } | null;
};

const STATUS_LABEL: Record<ReviewerReportDetail["status"], string> = {
  SUBMITTED: "Pending Review",
  FORWARDED_TO_INSPECTOR: "Sent to Inspector",
  REJECTED: "Rejected",
  RESOLVED: "Resolved",
};

export async function getReviewerReportDetail(
  reportId: string,
): Promise<ReviewerReportDetail | null> {
  await requireRole(["REVIEWER", "ADMIN"]);

  const r = await prisma.citizenReport.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      reportCode: true,
      status: true,
      issueType: true,
      description: true,
      locationText: true,
      shopName: true,
      shopAddress: true,
      city: true,
      state: true,
      pincode: true,
      createdAt: true,
      reviewedAt: true,
      resolvedAt: true,
      resolutionRemarks: true,
      submittedBy: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true, email: true } },
      product: {
        select: {
          id: true,
          productName: true,
          brandName: true,
          category: true,
          manufacturer: true,
          mrp: true,
          netQuantityValue: true,
          netQuantityUnit: true,
        },
      },
      scan: {
        select: {
          id: true,
          ocrConfidence: true,
          ocrEngine: true,
          ocrVersion: true,
          images: {
            orderBy: { createdAt: "asc" },
            select: { id: true, secureUrl: true, imageType: true },
          },
        },
      },
    },
  });

  if (!r) return null;

  const qty =
    r.product?.netQuantityValue != null
      ? `${r.product.netQuantityValue.toString()}${
          r.product.netQuantityUnit ? ` ${r.product.netQuantityUnit}` : ""
        }`
      : null;

  return {
    id: r.id,
    code: `#${r.reportCode}`,
    status: r.status,
    statusLabel: STATUS_LABEL[r.status],
    issueType: r.issueType,
    description: r.description,
    locationText: r.locationText,
    shopName: r.shopName,
    shopAddress: r.shopAddress,
    city: r.city,
    state: r.state,
    pincode: r.pincode,
    createdAt: r.createdAt.toISOString(),
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
    resolutionRemarks: r.resolutionRemarks,
    submitter: {
      name: r.submittedBy.name ?? r.submittedBy.email.split("@")[0],
      email: r.submittedBy.email,
    },
    reviewer: r.reviewedBy
      ? {
          name: r.reviewedBy.name ?? r.reviewedBy.email.split("@")[0],
          email: r.reviewedBy.email,
        }
      : null,
    product: r.product
      ? {
          id: r.product.id,
          productName: r.product.productName,
          brandName: r.product.brandName,
          category: r.product.category,
          manufacturer: r.product.manufacturer,
          mrp: r.product.mrp != null ? `₹${r.product.mrp.toString()}` : null,
          netQuantity: qty,
        }
      : null,
    evidence: r.scan?.images ?? [],
    scan: r.scan
      ? {
          id: r.scan.id,
          ocrConfidence: r.scan.ocrConfidence,
          ocrEngine: r.scan.ocrEngine,
          ocrVersion: r.scan.ocrVersion,
        }
      : null,
  };
}