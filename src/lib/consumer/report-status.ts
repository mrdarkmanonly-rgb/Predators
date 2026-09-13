import type { ReportStatus } from "@prisma/client";

const LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  FORWARDED_TO_INSPECTOR: "Forwarded to Inspector",
  REJECTED: "Rejected",
  RESOLVED: "Resolved",
};

export function reportStatusLabel(status: ReportStatus): string {
  return LABELS[status] ?? status;
}