import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  MapPin,
  Store,
  User,
  FileText,
} from "lucide-react";
import { fmtDateTime } from "@/lib/format";
import { getReviewerReportDetail } from "@/lib/reviewer/get-reviewer-report-detail";
import ReviewActions from "./ReviewActions";

const IMAGE_TYPE_LABEL: Record<string, string> = {
  FRONT: "Front",
  BACK: "Back",
  SIDE: "Side",
  ADDITIONAL: "Additional",
};

function statusStyle(s: string) {
  switch (s) {
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

export default async function ReviewerReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = await getReviewerReportDetail(reportId);
  if (!report) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/reviewer/reports"
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
              Submitted {fmtDateTime(report.createdAt)}
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

      {/* People */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PersonCard
          title="Submitted by"
          name={report.submitter.name}
          email={report.submitter.email}
          icon={<User className="h-3.5 w-3.5" />}
        />
        <PersonCard
          title="Reviewed by"
          name={report.reviewer?.name ?? "—"}
          email={report.reviewer?.email ?? "Not yet reviewed"}
          icon={<User className="h-3.5 w-3.5" />}
          muted={!report.reviewer}
        />
      </div>

      {/* Issue */}
      <div className="space-y-4 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
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

        {report.shopName && (
          <Field label="Shop / Seller">
            <span className="inline-flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-[#627D98]" />
              {report.shopName}
            </span>
          </Field>
        )}

        {(report.locationText || report.city || report.state || report.pincode) && (
          <Field label="Location">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#627D98]" />
              {[
                report.locationText,
                report.shopAddress,
                report.city,
                report.state,
                report.pincode,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </Field>
        )}
      </div>

      {/* Product snapshot */}
      {report.product && (
        <div className="space-y-2 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#102A43]">Product</h3>
          <p className="text-sm text-[#102A43]">
            {report.product.productName ?? "Unnamed"}
          </p>
          <p className="text-xs text-[#627D98]">
            {[report.product.brandName, report.product.category]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-[#829AB1]">
            {report.product.manufacturer && (
              <span>Mfr: {report.product.manufacturer}</span>
            )}
            {report.product.mrp && <span>MRP {report.product.mrp}</span>}
            {report.product.netQuantity && (
              <span>{report.product.netQuantity}</span>
            )}
          </div>
        </div>
      )}

      {/* Evidence photos */}
      <div className="space-y-3 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#102A43]">Evidence photos</h3>
        {report.evidence.length === 0 ? (
          <p className="text-xs text-[#829AB1]">
            No evidence photos attached.
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
        <div className="space-y-3 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
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
                {report.scan.ocrVersion ? ` ${report.scan.ocrVersion}` : ""}
              </Field>
            )}
          </div>
        </div>
      )}

      {/* Reviewer remark (if already reviewed) */}
      {report.resolutionRemarks && report.status !== "SUBMITTED" && (
        <div className="space-y-2 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#102A43]">
            Reviewer remark
          </h3>
          <p className="text-sm italic text-[#486581]">
            &ldquo;{report.resolutionRemarks}&rdquo;
          </p>
          {report.reviewedAt && (
            <p className="text-[11px] text-[#829AB1]">
              Reviewed {fmtDateTime(report.reviewedAt)}
            </p>
          )}
        </div>
      )}

      {/* Actions — only when SUBMITTED */}
      {report.status === "SUBMITTED" && (
        <ReviewActions reportId={report.id} reportCode={report.code} />
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
  icon: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#829AB1]">
        {icon}
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