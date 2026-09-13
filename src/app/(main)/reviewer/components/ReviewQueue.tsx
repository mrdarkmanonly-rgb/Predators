"use client";

import Link from "next/link";
import { FileText, MapPin } from "lucide-react";
import { fmtDateTime } from "@/lib/format";
import type { QueueRow } from "@/lib/reviewer/get-reviewer-dashboard";

export default function ReviewQueue({ rows }: { rows: QueueRow[] }) {
  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#D9E2EC] px-5 py-4">
        <h3 className="text-sm font-bold text-[#102A43]">
          Pending Review
          <span className="ml-2 rounded-full bg-[#FFF6DF] px-2 py-0.5 text-[10px] font-semibold text-[#B45309]">
            {rows.length}
          </span>
        </h3>
        <Link
          href="/reviewer/reports"
          className="text-xs font-semibold text-[#1769AA] hover:underline"
        >
          View all →
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-12 text-center text-xs text-[#829AB1]">
          No reports pending review.
        </p>
      ) : (
        <div className="divide-y divide-[#EAF0F6]">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/reviewer/reports/${r.id}`}
              className="block px-5 py-4 transition hover:bg-[#F7FAFC]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                    <FileText className="h-4 w-4 text-[#1769AA]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-mono text-[#829AB1]">
                      {r.code}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-[#102A43]">
                      {r.productName}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#627D98]">
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
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#829AB1]">
                      {fmtDateTime(r.createdAt)}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-semibold text-[#B45309]">
                  Pending
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}