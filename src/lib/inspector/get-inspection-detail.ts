import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type InspectionDetail = {
  inspectionId: string;
  reportId: string;
  reportCode: string;
  claimDate: string;
  completedAt: string | null;
  isCompleted: boolean;

  // Report + product context
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
  reviewerRemark: string | null;

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

  // Findings (already submitted, if completed)
  violationFound: boolean | null;
  violationType: string | null;
  observation: string | null;
  actionType: string | null;
  actionDetails: string | null;
  actionDate: string | null;
  followUpRequired: boolean | null;
  remarks: string | null;
};

export async function getInspectionDetail(
  inspectionId: string,
): Promise<InspectionDetail | null> {
  const inspector = await requireRole(["INSPECTOR", "ADMIN"]);

  const i = await prisma.inspection.findFirst({
    where: {
      id: inspectionId,
      // Security: inspector can only open their own claimed inspections
      inspectorId: inspector.id,
    },
    select: {
      id: true,
      claimedAt: true,
      completedAt: true,
      violationFound: true,
      violationType: true,
      observation: true,
      actionType: true,
      actionDetails: true,
      actionDate: true,
      followUpRequired: true,
      remarks: true,
      report: {
        select: {
          id: true,
          reportCode: true,
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
          resolutionRemarks: true,
          submittedBy: { select: { name: true, email: true } },
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
              images: {
                orderBy: { createdAt: "asc" },
                select: { id: true, secureUrl: true, imageType: true },
              },
            },
          },
        },
      },
    },
  });

  if (!i) return null;

  const r = i.report;
  const qty =
    r.product?.netQuantityValue != null
      ? `${r.product.netQuantityValue.toString()}${
          r.product.netQuantityUnit ? ` ${r.product.netQuantityUnit}` : ""
        }`
      : null;

  return {
    inspectionId: i.id,
    reportId: r.id,
    reportCode: `#${r.reportCode}`,
    claimDate: i.claimedAt.toISOString(),
    completedAt: i.completedAt?.toISOString() ?? null,
    isCompleted: i.completedAt !== null,
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
    reviewerRemark: r.resolutionRemarks,
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
    violationFound: i.violationFound,
    violationType: i.violationType,
    observation: i.observation,
    actionType: i.actionType,
    actionDetails: i.actionDetails,
    actionDate: i.actionDate?.toISOString() ?? null,
    followUpRequired: i.followUpRequired,
    remarks: i.remarks,
  };
}