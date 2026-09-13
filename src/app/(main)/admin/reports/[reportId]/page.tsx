import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  MapPin,
  User,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { getAdminReportDetail } from "@/lib/admin/get-admin-report-detail";

const IMAGE_TYPE_LABEL: Record<string, string> = {
  FRONT: "Front",
  BACK: "Back",
  SIDE: "Side",
  ADDITIONAL: "Additional",
};

function statusStyle(status: string) {
  switch (status) {
    case "SUBMITTED":
      return "bg-[#FEF3C7] text-[#B45309]";
    case "FORWARDED_TO_INSPECTOR":
      return "bg-[#DBEAFE] text-[#1D4ED8]";
    case "REJECTED":
      return "bg-[#FEECEC] text-[#DC2626]";
    case "RESOLVED":
      return "bg-[#DCFCE7] text-[#15803D]";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = await getAdminReportDetail(reportId);
  if (!report) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1769AA] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reports
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-[#829AB1]">{report.code}</p>
            <h2 className="mt-1 text-xl font-bold text-[#102A43]">
              {report.product?.productName ??
                report.product?.brandName ??
                "Unknown product"}
            </h2>
            <p className="mt-1 text-sm text-[#627D98]">
              Submitted {fmt(report.createdAt)}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(
              report.status,
            )}`}
          >
            {report.statusLabel}
          </span>
        </div>
      </div>

      {/* Submitter / Reviewer / Inspector cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PersonCard
          title="Submitted by"
          name={report.submitter.name}
          email={report.submitter.email}
          icon="user"
        />
        <PersonCard
          title="Reviewed by"
          name={report.reviewer?.name ?? "—"}
          email={report.reviewer?.email ?? "Not yet reviewed"}
          icon="shield"
          muted={!report.reviewer}
        />
        <PersonCard
          title="Inspector"
          name={report.inspection?.inspector.name ?? "—"}
          email={
            report.inspection?.inspector.email ?? "Not yet claimed"
          }
          icon="shield"
          muted={!report.inspection}
        />
      </div>

      {/* Issue */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#102A43]">Reported issue</h3>

        {report.issueType && (
          <Field label="Type">
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-[#627D98]" />
              {report.issueType}
            </span>
          </Field>
        )}

        {report.description && (
          <Field label="Description">
            <span className="whitespace-pre-line">{report.description}</span>
          </Field>
        )}

        {report.locationText && (
          <Field label="Location">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#627D98]" />
              {report.locationText}
            </span>
          </Field>
        )}
      </div>

      {/* Inspection details (if claimed) */}
      {report.inspection && (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#102A43]">
            Field inspection
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Claimed">{fmt(report.inspection.claimedAt)}</Field>
            <Field label="Completed">
              {report.inspection.completedAt
                ? fmt(report.inspection.completedAt)
                : "In progress"}
            </Field>
          </div>

          {report.inspection.completedAt && (
            <>
              <Field label="Finding">
                {report.inspection.violationFound
                  ? `Violation found${
                      report.inspection.violationType
                        ? ` · ${report.inspection.violationType}`
                        : ""
                    }`
                  : "No violation found"}
              </Field>

              {report.inspection.observation && (
                <Field label="Observation">
                  <span className="whitespace-pre-line">
                    {report.inspection.observation}
                  </span>
                </Field>
              )}

              {report.inspection.actionType && (
                <Field label="Action taken">
                  <span className="font-semibold">
                    {report.inspection.actionType}
                  </span>
                  {report.inspection.actionDetails && (
                    <span className="block whitespace-pre-line mt-1 font-normal">
                      {report.inspection.actionDetails}
                    </span>
                  )}
                  {report.inspection.followUpRequired && (
                    <span className="block mt-1 text-[#DC2626] font-semibold">
                      Follow-up required
                    </span>
                  )}
                </Field>
              )}

              {report.inspection.remarks && (
                <Field label="Inspector remark">
                  <span className="italic">
                    &ldquo;{report.inspection.remarks}&rdquo;
                  </span>
                </Field>
              )}
            </>
          )}
        </div>
      )}

      {/* Resolution / Rejection remark (for the citizen) */}
      {report.resolutionRemarks && (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#102A43]">
            Final remark (visible to citizen)
          </h3>
          <p className="text-sm italic text-[#486581]">
            &ldquo;{report.resolutionRemarks}&rdquo;
          </p>
          {report.resolvedAt && (
            <p className="text-[11px] text-[#829AB1]">
              Resolved {fmt(report.resolvedAt)}
            </p>
          )}
        </div>
      )}

      {/* Product */}
      {report.product && (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-[#102A43]">Product</h3>
          <p className="text-sm text-[#102A43]">
            {report.product.productName ?? "Unnamed"}
          </p>
          <p className="text-xs text-[#627D98]">
            {[report.product.brandName, report.product.category]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <Link
            href={`/product/${report.product.id}`}
            className="mt-1 inline-block text-xs font-semibold text-[#1769AA] hover:underline"
          >
            View product →
          </Link>
        </div>
      )}

      {/* Evidence photos */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-[#102A43]">Evidence photos</h3>
        {report.evidence.length === 0 ? (
          <p className="text-xs text-[#829AB1]">
            No evidence photos attached to this report.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {report.evidence.map((img) => (
              <a
                key={img.id}
                href={img.secureUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden rounded-xl border border-[#D9E2EC] bg-[#F7FAFC]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.secureUrl}
                  alt={IMAGE_TYPE_LABEL[img.imageType] ?? "Evidence"}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {IMAGE_TYPE_LABEL[img.imageType] ?? img.imageType}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Scan metadata */}
      {report.scan && (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#102A43]">
            <FileText className="h-4 w-4 text-[#1769AA]" />
            Scan metadata
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {report.scan.ocrConfidence !== null && (
              <Field label="OCR confidence">
                {(report.scan.ocrConfidence * 100).toFixed(0)}%
              </Field>
            )}
            {report.scan.ocrEngine && (
              <Field label="Engine">
                {report.scan.ocrEngine}
                {report.scan.ocrVersion
                  ? ` ${report.scan.ocrVersion}`
                  : ""}
              </Field>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PersonCard({
  title,
  name,
  email,
  icon,
  muted,
}: {
  title: string;
  name: string;
  email: string;
  icon: "user" | "shield";
  muted?: boolean;
}) {
  const Icon = icon === "user" ? User : ShieldCheck;
  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#829AB1]">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <p
        className={`mt-2 text-sm font-semibold ${
          muted ? "text-[#829AB1]" : "text-[#102A43]"
        }`}
      >
        {name}
      </p>
      <p className="text-xs text-[#829AB1]">{email}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[#102A43]">{children}</p>
    </div>
  );
}