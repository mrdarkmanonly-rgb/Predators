import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type AvailableCaseDetail = {
  reportId: string;
  code: string;
  status: "FORWARDED_TO_INSPECTOR";
  statusLabel: string;
  issueType: string | null;
  description: string | null;
  locationText: string | null;
  shopName: string | null;
  shopAddress: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  forwardedAt: string;
  reviewerRemark: string | null;
  reviewerName: string | null;

  submitter: { name: string; email: string };

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

export async function getAvailableCaseDetail(
  reportId: string,
): Promise<AvailableCaseDetail | null> {
  await requireRole(["INSPECTOR", "ADMIN"]);

  const r = await prisma.citizenReport.findFirst({
    where: {
      id: reportId,
      status: "FORWARDED_TO_INSPECTOR",
      inspection: null, // still unclaimed
    },
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
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
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
    reportId: r.id,
    code: `#${r.reportCode}`,
    status: "FORWARDED_TO_INSPECTOR",
    statusLabel: "Sent to Inspector",
    issueType: r.issueType,
    description: r.description,
    locationText: r.locationText,
    shopName: r.shopName,
    shopAddress: r.shopAddress,
    city: r.city,
    state: r.state,
    pincode: r.pincode,
    latitude: r.latitude,
    longitude: r.longitude,
    createdAt: r.createdAt.toISOString(),
    forwardedAt: r.updatedAt.toISOString(),
    reviewerRemark: r.resolutionRemarks,
    reviewerName: r.reviewedBy
      ? r.reviewedBy.name ?? r.reviewedBy.email.split("@")[0]
      : null,
    submitter: {
      name: r.submittedBy.name ?? r.submittedBy.email.split("@")[0],
      email: r.submittedBy.email,
    },
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