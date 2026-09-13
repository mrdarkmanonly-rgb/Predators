"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, FileText, MapPin } from "lucide-react";
import { fmtDateTime } from "@/lib/format";
import type { MyReviewRow } from "@/lib/reviewer/get-my-reviews";

function statusStyle(s: MyReviewRow["status"]) {
  switch (s) {
    case "FORWARDED_TO_INSPECTOR":
      return "bg-[#DBEAFE] text-[#1D4ED8]";
    case "REJECTED":
      return "bg-[#FEECEC] text-[#DC2626]";
    case "RESOLVED":
      return "bg-[#DCFCE7] text-[#15803D]";
  }
}

export default function MyReviewsClient({ rows }: { rows: MyReviewRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.submitterName.toLowerCase().includes(q) ||
        (r.resolutionRemarks ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#102A43]">My Reviews</h2>
          <p className="mt-1 text-sm text-[#627D98]">
            Reports you&apos;ve reviewed.
          </p>
        </div>
        <span className="mt-2 text-xs font-semibold text-[#627D98]">
          {filtered.length} of {rows.length}
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by code, product, submitter, remark…"
          className="w-full rounded-xl border border-[#D9E2EC] bg-white py-2.5 pl-9 pr-3 text-sm text-[#102A43] placeholder:text-[#9FB3C8] focus:border-[#1769AA] focus:outline-none focus:ring-2 focus:ring-[#1769AA]/10"
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">
            You haven&apos;t reviewed any reports yet.
          </p>
          <Link
            href="/reviewer/reports"
            className="mt-3 inline-block text-xs font-semibold text-[#1769AA] hover:underline"
          >
            Go to Reports →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">No matches.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Link key={r.id} href={`/reviewer/reports/${r.id}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-[#D9E2EC] bg-white p-4 transition hover:border-[#1769AA]/40"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                    <FileText className="h-5 w-5 text-[#1769AA]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-[#829AB1]">
                          {r.code}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-[#102A43]">
                          {r.productName}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle(
                          r.status,
                        )}`}
                      >
                        {r.statusLabel}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#627D98]">
                      {r.issueType && (
                        <span className="rounded bg-[#FEECEC] px-1.5 py-0.5 text-[10px] font-semibold text-[#DC2626]">
                          {r.issueType}
                        </span>
                      )}
                      {r.locationText && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {r.locationText}
                        </span>
                      )}
                      <span>Reviewed {fmtDateTime(r.reviewedAt)}</span>
                    </div>

                    {r.resolutionRemarks && (
                      <p className="mt-2 line-clamp-2 text-xs italic text-[#627D98]">
                        &ldquo;{r.resolutionRemarks}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}