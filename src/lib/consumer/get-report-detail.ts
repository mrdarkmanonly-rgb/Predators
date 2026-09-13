import "server-only";

import prisma from "@/utils/prisma.client";
import { getCurrentUser } from "@/lib/auth-guard";
import { reportStatusLabel } from "./report-status";

export type ReportEvidence = {
  id: string;
  secureUrl: string;
  imageType: "FRONT" | "BACK" | "SIDE" | "ADDITIONAL";
  width: number | null;
  height: number | null;
};

export type ReportTimelineEvent = {
  label: string;
  occurredAt: string;
  remark: string | null;
  tone: "info" | "success" | "danger" | "neutral";
};

export type ReportDetail = {
  id: string;
  reportCode: string;
  status: string;
  statusRaw:
    | "SUBMITTED"
    | "FORWARDED_TO_INSPECTOR"
    | "REJECTED"
    | "RESOLVED";
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

  resolutionRemarks: string | null;
  createdAt: string;
  reviewedAt: string | null;
  resolvedAt: string | null;

  product: {
    id: string;
    productName: string | null;
    brandName: string | null;
    category: string | null;
  } | null;

  scan: {
    id: string;
    ocrConfidence: number | null;
    ocrEngine: string | null;
    ocrVersion: string | null;
    rawOcrText: string | null;
  } | null;

  evidence: ReportEvidence[];
  timeline: ReportTimelineEvent[];
};

export async function getReportDetail(
  reportId: string,
): Promise<ReportDetail | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const report = await prisma.citizenReport.findFirst({
    where: {
      id: reportId,
      submittedById: user.id,
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

      resolutionRemarks: true,
      createdAt: true,
      updatedAt: true,
      reviewedAt: true,
      resolvedAt: true,

      product: {
        select: {
          id: true,
          productName: true,
          brandName: true,
          category: true,
        },
      },

      scan: {
        select: {
          id: true,
          ocrConfidence: true,
          ocrEngine: true,
          ocrVersion: true,
          rawOcrText: true,

          images: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              secureUrl: true,
              imageType: true,
              width: true,
              height: true,
            },
          },
        },
      },
    },
  });

  if (!report) {
    return null;
  }

  const timeline: ReportTimelineEvent[] = [
    {
      label: "Submitted",
      occurredAt: report.createdAt.toISOString(),
      remark: null,
      tone: "info",
    },
  ];

  if (
    report.status !== "SUBMITTED" &&
    report.reviewedAt
  ) {
    timeline.push({
      label: "Under review",
      occurredAt: report.reviewedAt.toISOString(),
      remark: null,
      tone: "neutral",
    });
  }

  const terminalAt =
    report.resolvedAt ??
    report.reviewedAt ??
    report.updatedAt;

  if (report.status === "FORWARDED_TO_INSPECTOR") {
    timeline.push({
      label: "Forwarded to Inspector",
      occurredAt: terminalAt.toISOString(),
      remark: report.resolutionRemarks,
      tone: "info",
    });
  } else if (report.status === "REJECTED") {
    timeline.push({
      label: "Rejected",
      occurredAt: terminalAt.toISOString(),
      remark: report.resolutionRemarks,
      tone: "danger",
    });
  } else if (report.status === "RESOLVED") {
    timeline.push({
      label: "Resolved",
      occurredAt: terminalAt.toISOString(),
      remark: report.resolutionRemarks,
      tone: "success",
    });
  }

  return {
    id: report.id,
    reportCode: report.reportCode,

    status: reportStatusLabel(report.status),
    statusRaw: report.status,

    issueType: report.issueType,
    description: report.description,

    locationText: report.locationText,
    shopName: report.shopName,
    shopAddress: report.shopAddress,
    city: report.city,
    state: report.state,
    pincode: report.pincode,
    latitude: report.latitude,
    longitude: report.longitude,

    resolutionRemarks: report.resolutionRemarks,

    createdAt: report.createdAt.toISOString(),

    reviewedAt:
      report.reviewedAt?.toISOString() ?? null,

    resolvedAt:
      report.resolvedAt?.toISOString() ?? null,

    product: report.product,

    scan: report.scan
      ? {
          id: report.scan.id,
          ocrConfidence:
            report.scan.ocrConfidence,
          ocrEngine: report.scan.ocrEngine,
          ocrVersion: report.scan.ocrVersion,
          rawOcrText: report.scan.rawOcrText,
        }
      : null,

    evidence: report.scan?.images ?? [],

    timeline,
  };
}