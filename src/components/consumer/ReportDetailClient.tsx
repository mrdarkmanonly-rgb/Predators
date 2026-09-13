"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertCircle,
  FileText,
  MapPin,
  Store,
  Navigation,
  ShieldCheck,
  Clock3,
  Package,
  CheckCircle2,
} from "lucide-react";
import type { ReportDetail } from "@/lib/consumer/get-report-detail";
import StatusBadge from "@/components/consumer/StatusBadge";

const IMAGE_TYPE_LABEL: Record<string, string> = {
  FRONT: "Front",
  BACK: "Back",
  SIDE: "Side",
  ADDITIONAL: "Additional",
};

const TONE_DOT: Record<string, string> = {
  info: "bg-sky-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
  neutral: "bg-slate-400",
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function InfoCard({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-slate-700">
        {value !== null && value !== undefined && String(value).trim() !== ""
          ? value
          : "Not provided"}
      </p>
    </div>
  );
}
function parseIssues(
  issueType: string | null,
  description: string | null,
) {
  if (!issueType && !description) {
    return [];
  }

  const blocks = description
    ? description
        .split(/\n\n(?=Issue\s+\d+:)/)
        .map((block) => block.trim())
        .filter(Boolean)
    : [];

  const structuredIssues = blocks
    .map((block) => {
      const match = block.match(/^Issue\s+\d+:\s*(.+)$/m);

      if (!match) {
        return null;
      }

      const type = match[1].trim();
      const lines = block.split("\n");
      lines.shift();

      return {
        issueType: type,
        description: lines.join("\n").trim(),
      };
    })
    .filter(
      (
        issue,
      ): issue is {
        issueType: string;
        description: string;
      } => issue !== null,
    );

  if (structuredIssues.length > 0) {
    return structuredIssues;
  }

  const types = issueType
    ? issueType
        .split(",")
        .map((type) => type.trim())
        .filter(Boolean)
    : [];

  if (types.length > 1 && description) {
    const descriptions = description
      .split(/\n\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    return types.map((type, index) => ({
      issueType: type,
      description: descriptions[index] ?? "",
    }));
  }

  return [
    {
      issueType: issueType ?? "Other",
      description: description ?? "",
    },
  ];
}

export default function ReportDetailClient({
  report,
}: {
  report: ReportDetail;
}) {
  const issues = parseIssues(
    report.issueType,
    report.description,
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F5F9FC] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full bg-emerald-200/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Link
            href="/consumer/reports"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Reports
          </Link>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.07)] backdrop-blur-sm sm:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400 to-transparent" />

          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Compliance Report
              </div>

              <p className="font-mono text-xs text-slate-400">
                #{report.reportCode}
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {report.product?.productName ??
                  report.product?.brandName ??
                  "Unknown Product"}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Clock3 className="h-4 w-4" />
                Submitted {fmtDateTime(report.createdAt)}
              </p>
            </div>

            <StatusBadge status={report.status} />
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-5">
          <motion.section
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="lg:col-span-3 rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500"
                >
                  <AlertCircle className="h-5 w-5" />
                </motion.div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Reported Issues
                  </h2>

                  <p className="text-xs text-slate-500">
                    Concerns reported for this product
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">
                {issues.length}{" "}
                {issues.length === 1 ? "Issue" : "Issues"}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {issues.map((issue, index) => (
                <motion.div
                  key={`${issue.issueType}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.07,
                  }}
                  whileHover={{ y: -2 }}
                  className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-red-50/30 p-5 shadow-sm"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-400 to-orange-300" />

                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-sm font-black text-red-600">
                      {index + 1}
                    </span>

                    <p className="text-sm font-black text-slate-900">
                      {issue.issueType}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Description
                    </p>

                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {issue.description ||
                        "No description provided."}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="lg:col-span-2 rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-7"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Status Timeline
                </h2>

                <p className="text-xs text-slate-500">
                  Report processing journey
                </p>
              </div>
            </div>

            <ol className="mt-6 space-y-5">
              {report.timeline.map((event, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.12 + index * 0.08,
                  }}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <motion.span
                      animate={{
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2,
                      }}
                      className={`mt-1 h-3 w-3 rounded-full ${
                        TONE_DOT[event.tone] ??
                        TONE_DOT.neutral
                      }`}
                    />

                    {index < report.timeline.length - 1 && (
                      <span className="mt-2 w-px flex-1 bg-slate-200" />
                    )}
                  </div>

                  <div className="pb-2">
                    <p className="text-sm font-bold text-slate-900">
                      {event.label}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {fmtDateTime(event.occurredAt)}
                    </p>

                    {event.remark && (
                      <p className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs italic leading-5 text-slate-500">
                        “{event.remark}”
                      </p>
                    )}
                  </div>
                </motion.li>
              ))}
            </ol>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-7"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"
            >
              <Store className="h-5 w-5" />
            </motion.div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Shop & Inspection Location
              </h2>

              <p className="text-xs text-slate-500">
                Physical location linked to this report
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              label="Shop Name"
              value={report.shopName}
            />

            <InfoCard
              label="City"
              value={report.city}
            />

            <InfoCard
              label="State"
              value={report.state}
            />

            <InfoCard
              label="Pincode"
              value={report.pincode}
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:col-span-2 lg:col-span-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Shop Address
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {report.shopAddress || "Not provided"}
              </p>
            </div>
          </div>

          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 rgba(14,165,233,0)",
                "0 0 18px rgba(14,165,233,0.06)",
                "0 0 0 rgba(14,165,233,0)",
              ],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mt-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5"
          >
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-sky-600" />

              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
                GPS Coordinates
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <InfoCard
                label="Latitude"
                value={
                  report.latitude !== null
                    ? report.latitude.toFixed(6)
                    : null
                }
              />

              <InfoCard
                label="Longitude"
                value={
                  report.longitude !== null
                    ? report.longitude.toFixed(6)
                    : null
                }
              />

              <InfoCard
                label="Recorded Location"
                value={report.locationText}
              />
            </div>
          </motion.div>
        </motion.section>

        {report.product && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            whileHover={{ y: -2 }}
            className="rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-7"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Package className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Product Information
                </h2>

                <p className="text-xs text-slate-500">
                  Product connected to this report
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-emerald-50/40 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-bold text-slate-900">
                  {report.product.productName ??
                    "Unnamed Product"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {[
                    report.product.brandName,
                    report.product.category,
                  ]
                    .filter(Boolean)
                    .join(" · ") ||
                    "Product details unavailable"}
                </p>
              </div>

              <Link
                href={`/product/${report.product.id}`}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                View Product →
              </Link>
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-7"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Evidence Photos
              </h2>

              <p className="text-xs text-slate-500">
                Images attached from the original scan
              </p>
            </div>
          </div>

          {report.evidence.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">
                No evidence photos attached to this report.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {report.evidence.map((image, index) => (
                <motion.a
                  key={image.id}
                  href={image.secureUrl}
                  target="_blank"
                  rel="noreferrer"
                  initial={{
                    opacity: 0,
                    scale: 0.97,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.05,
                  }}
                  whileHover={{
                    y: -3,
                  }}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
                >
                  <img
                    src={image.secureUrl}
                    alt={
                      IMAGE_TYPE_LABEL[image.imageType] ??
                      "Evidence"
                    }
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pb-3 pt-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                      {IMAGE_TYPE_LABEL[image.imageType] ??
                        image.imageType}
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </motion.section>

        {report.scan && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-7"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Scan Analysis
                </h2>

                <p className="text-xs text-slate-500">
                  OCR information from the submitted scan
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <InfoCard
                label="OCR Confidence"
                value={
                  report.scan.ocrConfidence !== null
                    ? `${(
                        report.scan.ocrConfidence * 100
                      ).toFixed(0)}%`
                    : null
                }
              />

              <InfoCard
                label="OCR Engine"
                value={report.scan.ocrEngine}
              />

              <InfoCard
                label="OCR Version"
                value={report.scan.ocrVersion}
              />
            </div>

            {report.scan.rawOcrText && (
              <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer text-xs font-bold text-sky-700">
                  View raw OCR text
                </summary>

                <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-5 text-slate-600">
                  {report.scan.rawOcrText}
                </pre>
              </details>
            )}
          </motion.section>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-center gap-2 pb-8 pt-2 text-xs font-semibold text-slate-400"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Report securely linked with scan evidence
        </motion.div>
      </div>
    </main>
  );
}