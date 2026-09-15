"use client";

import Link from "next/link";
import { FileText, MapPin, ArrowRight, AlertCircle } from "lucide-react";
import { fmtDateTime } from "@/lib/format";
import type { QueueRow } from "@/lib/reviewer/get-reviewer-dashboard";

function hoursSince(date: string | Date) {
  const ms = Date.now() - new Date(date).getTime();
  return ms / (1000 * 60 * 60);
}

export default function ReviewQueue({ rows }: { rows: QueueRow[] }) {
  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="flex items-center justify-between border-b border-[#D9E2EC] px-5 py-4">
        <h3 className="text-sm font-bold text-[#102A43]">
          Pending Review
          <span className="ml-2 inline-block rounded-full bg-[#FFF6DF] px-2 py-0.5 text-[10px] font-semibold text-[#B45309] transition-transform duration-200">
            {rows.length}
          </span>
        </h3>
        <Link
          href="/reviewer/reports"
          className="group flex items-center gap-1 text-xs font-semibold text-[#1769AA] transition-colors hover:text-[#0F4C7A]"
        >
          View all
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-12 text-center text-xs text-[#829AB1]">
          No reports pending review.
        </p>
      ) : (
        <div className="divide-y divide-[#EAF0F6]">
          {rows.map((r, i) => {
            const age = hoursSince(r.createdAt);
            const isUrgent = age >= 24;

            return (
              <Link
                key={r.id}
                href={`/reviewer/reports/${r.id}`}
                className="group block animate-in fade-in slide-in-from-bottom-1 px-5 py-4 transition-colors duration-200 hover:bg-[#F7FAFC]"
                style={{ animationDelay: `${i * 40}ms`, animationDuration: "300ms", animationFillMode: "backwards" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] transition-transform duration-200 group-hover:scale-105">
                      <FileText className="h-4 w-4 text-[#1769AA]" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-mono text-[#829AB1]">
                        {r.code}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-[#102A43] transition-colors group-hover:text-[#1769AA]">
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
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#829AB1]">
                        {fmtDateTime(r.createdAt)}
                        {isUrgent && (
                          <span className="ml-1 inline-flex items-center gap-1 font-semibold text-[#DC2626]">
                            <AlertCircle className="h-3 w-3" />
                            Awaiting {Math.floor(age / 24)}d+
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-transform duration-200 group-hover:scale-105 ${
                      isUrgent
                        ? "bg-[#FEECEC] text-[#DC2626]"
                        : "bg-[#FEF3C7] text-[#B45309]"
                    }`}
                  >
                    {isUrgent && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626] animate-pulse" />
                    )}
                    {isUrgent ? "Urgent" : "Pending"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}