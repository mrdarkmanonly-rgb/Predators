import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type ReportStatusKey =
  | "SUBMITTED"
  | "FORWARDED_TO_INSPECTOR"
  | "REJECTED"
  | "RESOLVED";

export type AdminReportRow = {
  id: string;
  code: string;
  status: ReportStatusKey;
  statusLabel: string;
  productName: string;
  category: string | null;
  issueType: string | null;
  locationText: string | null;
  submitterName: string;
  submitterEmail: string;
  createdAt: string;
};

const LIMIT = 100;

export function reportStatusLabel(s: ReportStatusKey): string {
  switch (s) {
    case "SUBMITTED":
      return "Pending Review";
    case "FORWARDED_TO_INSPECTOR":
      return "Sent to Inspector";
    case "REJECTED":
      return "Rejected";
    case "RESOLVED":
      return "Resolved";
  }
}

export async function getAdminReports(): Promise<{
  rows: AdminReportRow[];
  total: number;
  capped: boolean;
}> {
  await requireRole(["ADMIN"]);

  const [total, reports] = await Promise.all([
    prisma.citizenReport.count(),
    prisma.citizenReport.findMany({
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      select: {
        id: true,
        reportCode: true,
        status: true,
        issueType: true,
        locationText: true,
        createdAt: true,
        submittedBy: { select: { name: true, email: true } },
        product: {
          select: { productName: true, brandName: true, category: true },
        },
      },
    }),
  ]);

  const rows: AdminReportRow[] = reports.map((r) => ({
    id: r.id,
    code: `#${r.reportCode}`,
    status: r.status,
    statusLabel: reportStatusLabel(r.status),
    productName:
      r.product?.productName ??
      r.product?.brandName ??
      "Unknown product",
    category: r.product?.category ?? null,
    issueType: r.issueType,
    locationText: r.locationText,
    submitterName: r.submittedBy.name ?? r.submittedBy.email.split("@")[0],
    submitterEmail: r.submittedBy.email,
    createdAt: r.createdAt.toISOString(),
  }));

  return { rows, total, capped: total > LIMIT };
}