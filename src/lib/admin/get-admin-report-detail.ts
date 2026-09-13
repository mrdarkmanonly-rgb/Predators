import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";
import {
  reportStatusLabel,
  type ReportStatusKey,
} from "./get-admin-reports";

export type AdminReportDetail = {
  id: string;
  code: string;
  status: ReportStatusKey;
  statusLabel: string;
  issueType: string | null;
  description: string | null;
  locationText: string | null;
  createdAt: string;
  resolutionRemarks: string | null;
  resolvedAt: string | null;
  reviewedAt: string | null;

  product: {
    id: string;
    productName: string | null;
    brandName: string | null;
    category: string | null;
  } | null;

  submitter: {
    id: string;
    name: string;
    email: string;
  };

  reviewer: {
    id: string;
    name: string;
    email: string;
  } | null;

  inspection: {
    id: string;
    claimedAt: string;
    completedAt: string | null;
    violationFound: boolean | null;
    violationType: string | null;
    observation: string | null;
    actionType: string | null;
    actionDetails: string | null;
    actionDate: string | null;
    followUpRequired: boolean | null;
    remarks: string | null;
    inspector: { id: string; name: string; email: string };
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

export async function getAdminReportDetail(
  reportId: string,
): Promise<AdminReportDetail | null> {
  await requireRole(["ADMIN"]);

  const report = await prisma.citizenReport.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      reportCode: true,
      status: true,
      issueType: true,
      description: true,
      locationText: true,
      createdAt: true,
      reviewedAt: true,
      resolutionRemarks: true,
      resolvedAt: true,
      product: {
        select: {
          id: true,
          productName: true,
          brandName: true,
          category: true,
        },
      },
      submittedBy: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
      inspection: {
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
          inspector: { select: { id: true, name: true, email: true } },
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

  if (!report) return null;

  return {
    id: report.id,
    code: `#${report.reportCode}`,
    status: report.status,
    statusLabel: reportStatusLabel(report.status),
    issueType: report.issueType,
    description: report.description,
    locationText: report.locationText,
    createdAt: report.createdAt.toISOString(),
    reviewedAt: report.reviewedAt?.toISOString() ?? null,
    resolutionRemarks: report.resolutionRemarks,
    resolvedAt: report.resolvedAt?.toISOString() ?? null,
    product: report.product,
    submitter: {
      id: report.submittedBy.id,
      name:
        report.submittedBy.name ??
        report.submittedBy.email.split("@")[0],
      email: report.submittedBy.email,
    },
    reviewer: report.reviewedBy
      ? {
          id: report.reviewedBy.id,
          name:
            report.reviewedBy.name ??
            report.reviewedBy.email.split("@")[0],
          email: report.reviewedBy.email,
        }
      : null,
    inspection: report.inspection
      ? {
          id: report.inspection.id,
          claimedAt: report.inspection.claimedAt.toISOString(),
          completedAt:
            report.inspection.completedAt?.toISOString() ?? null,
          violationFound: report.inspection.violationFound,
          violationType: report.inspection.violationType,
          observation: report.inspection.observation,
          actionType: report.inspection.actionType,
          actionDetails: report.inspection.actionDetails,
          actionDate:
            report.inspection.actionDate?.toISOString() ?? null,
          followUpRequired: report.inspection.followUpRequired,
          remarks: report.inspection.remarks,
          inspector: {
            id: report.inspection.inspector.id,
            name:
              report.inspection.inspector.name ??
              report.inspection.inspector.email.split("@")[0],
            email: report.inspection.inspector.email,
          },
        }
      : null,
    evidence: report.scan?.images ?? [],
    scan: report.scan
      ? {
          id: report.scan.id,
          ocrConfidence: report.scan.ocrConfidence,
          ocrEngine: report.scan.ocrEngine,
          ocrVersion: report.scan.ocrVersion,
        }
      : null,
  };
}