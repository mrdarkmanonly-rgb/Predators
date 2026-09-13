import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, AlertCircle, FileText } from "lucide-react";
import { getReportDetail } from "@/lib/consumer/get-report-detail";
import StatusBadge from "@/components/consumer/StatusBadge";

const IMAGE_TYPE_LABEL: Record<string, string> = {
  FRONT: "Front",
  BACK: "Back",
  SIDE: "Side",
  ADDITIONAL: "Additional",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TONE_DOT: Record<string, string> = {
  info: "bg-[#1769AA]",
  success: "bg-emerald-600",
  danger: "bg-red-600",
  neutral: "bg-[#9FB3C8]",
};

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = await getReportDetail(reportId);

  // Distinguish "not logged in" from "not found"
  if (report === null) {
    // getCurrentUser returned null OR report not found OR not owned
    // For simplicity both go to 404; if you want distinct handling, expose getCurrentUser separately.
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        href="/consumer/reports"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1769AA] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to reports
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#D9E2EC] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-[#627D98]">
              #{report.reportCode}
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-[#102A43] mt-1">
              {report.product?.productName ??
                report.product?.brandName ??
                "Unknown product"}
            </h1>
            <p className="text-sm text-[#627D98] mt-1">
              Submitted {fmtDateTime(report.createdAt)}
            </p>
          </div>
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Issue + timeline side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Issue */}
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#1769AA]" /> Reported issue
          </h2>

          {report.issueType && (
            <Field label="Type">{report.issueType}</Field>
          )}

          {report.description && (
            <Field label="Description">
              <span className="whitespace-pre-line">
                {report.description}
              </span>
            </Field>
          )}

          {report.locationText && (
            <Field label="Location">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#627D98]" />
                {report.locationText}
              </span>
            </Field>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#102A43]">
            Status timeline
          </h2>
          <ol className="space-y-3">
            {report.timeline.map((ev, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${TONE_DOT[ev.tone]}`}
                  />
                  {i < report.timeline.length - 1 && (
                    <span className="w-px flex-1 bg-[#D9E2EC] mt-1" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-sm font-semibold text-[#102A43]">
                    {ev.label}
                  </p>
                  <p className="text-xs text-[#627D98] mt-0.5">
                    {fmtDateTime(ev.occurredAt)}
                  </p>
                  {ev.remark && (
                    <p className="text-xs italic text-[#627D98] mt-1 border-l-2 border-[#D9E2EC] pl-2">
                      “{ev.remark}”
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Product */}
      {report.product && (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-5 space-y-2">
          <h2 className="text-sm font-bold text-[#102A43]">Product</h2>
          <p className="text-sm text-[#102A43]">
            {report.product.productName ?? "Unnamed"}
          </p>
          <p className="text-xs text-[#627D98]">
            {[
              report.product.brandName,
              report.product.category,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <Link
            href={`/product/${report.product.id}`}
            className="inline-block mt-1 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            View product →
          </Link>
        </div>
      )}

      {/* Evidence */}
      <div className="bg-white rounded-2xl border border-[#D9E2EC] p-5 space-y-3">
        <h2 className="text-sm font-bold text-[#102A43]">
          Evidence photos
        </h2>
        {report.evidence.length === 0 ? (
          <p className="text-xs text-[#627D98]">
            No evidence photos attached to this report.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {report.evidence.map((img) => (
              <a
                key={img.id}
                href={img.secureUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative rounded-xl overflow-hidden border border-[#D9E2EC] aspect-square bg-[#F7FAFC]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.secureUrl}
                  alt={IMAGE_TYPE_LABEL[img.imageType] ?? "Evidence"}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold">
                  {IMAGE_TYPE_LABEL[img.imageType] ?? img.imageType}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Scan metadata */}
      {report.scan && (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-5 space-y-3">
          <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1769AA]" /> Scan analysis
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {report.scan.ocrConfidence !== null && (
              <div>
                <p className="text-[#627D98]">OCR confidence</p>
                <p className="font-semibold text-[#102A43] mt-0.5">
                  {(report.scan.ocrConfidence * 100).toFixed(0)}%
                </p>
              </div>
            )}
            {report.scan.ocrEngine && (
              <div>
                <p className="text-[#627D98]">Engine</p>
                <p className="font-semibold text-[#102A43] mt-0.5">
                  {report.scan.ocrEngine}
                  {report.scan.ocrVersion
                    ? ` ${report.scan.ocrVersion}`
                    : ""}
                </p>
              </div>
            )}
          </div>

          {report.scan.rawOcrText && (
            <details className="pt-1">
              <summary className="cursor-pointer text-xs font-semibold text-[#1769AA]">
                View raw OCR text
              </summary>
              <pre className="mt-2 text-[11px] whitespace-pre-wrap break-words bg-[#F7FAFC] border border-[#D9E2EC] rounded-xl p-3 text-[#102A43] max-h-64 overflow-auto">
                {report.scan.rawOcrText}
              </pre>
            </details>
          )}
        </div>
      )}
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
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#627D98]">
        {label}
      </p>
      <p className="text-sm text-[#102A43] mt-1">{children}</p>
    </div>
  );
}