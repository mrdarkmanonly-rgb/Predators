"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, FileText, MapPin, AlertCircle } from "lucide-react";
import type {
  AdminReportRow,
  ReportStatusKey,
} from "@/lib/admin/get-admin-reports";

type FilterKey = "all" | ReportStatusKey;
type SortKey = "newest" | "oldest" | "code_asc";

const FILTER_CHIPS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "All" },
  { value: "SUBMITTED", label: "Pending Review" },
  { value: "FORWARDED_TO_INSPECTOR", label: "Sent to Inspector" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "code_asc", label: "Code (A–Z)" },
];

function statusStyle(status: ReportStatusKey) {
  switch (status) {
    case "SUBMITTED":
      return "bg-[#FEF3C7] text-[#B45309]";
    case "FORWARDED_TO_INSPECTOR":
      return "bg-[#DBEAFE] text-[#1D4ED8]";
    case "REJECTED":
      return "bg-[#FEECEC] text-[#DC2626]";
    case "RESOLVED":
      return "bg-[#DCFCE7] text-[#15803D]";
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportsClient({
  rows,
  total,
  capped,
}: {
  rows: AdminReportRow[];
  total: number;
  capped: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = rows;

    if (filter !== "all") {
      result = result.filter((r) => r.status === filter);
    }

    if (q) {
      result = result.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.submitterName.toLowerCase().includes(q) ||
          r.submitterEmail.toLowerCase().includes(q) ||
          (r.issueType ?? "").toLowerCase().includes(q),
      );
    }

    const sorted = [...result];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "oldest":
        sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case "code_asc":
        sorted.sort((a, b) => a.code.localeCompare(b.code));
        break;
    }
    return sorted;
  }, [rows, query, filter, sort]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#102A43]">Reports</h2>
          <p className="mt-1 text-sm text-[#627D98]">
            All citizen reports across the system.
          </p>
        </div>
        <span className="mt-2 text-xs font-semibold text-[#627D98]">
          {filtered.length} of {rows.length}
          {capped && ` (showing latest 100 of ${total})`}
        </span>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => setFilter(chip.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-[#1769AA] bg-[#1769AA] text-white"
                  : "border-[#D9E2EC] bg-white text-[#627D98] hover:border-[#1769AA]/40 hover:text-[#1769AA]"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code, product, submitter…"
            className="w-full rounded-xl border border-[#D9E2EC] bg-white py-2.5 pl-9 pr-3 text-sm text-[#102A43] placeholder:text-[#9FB3C8] focus:border-[#1769AA] focus:outline-none focus:ring-2 focus:ring-[#1769AA]/10"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-3 py-2.5 text-sm text-[#102A43] transition hover:border-[#1769AA]/40"
          >
            <span>{activeSortLabel}</span>
            <ChevronDown
              className={`h-4 w-4 text-[#627D98] transition-transform ${
                sortOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-[#D9E2EC] bg-white shadow-lg"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setSortOpen(false);
                    }}
                    className={`block w-full px-3 py-2.5 text-left text-sm transition ${
                      sort === opt.value
                        ? "bg-[#EAF4FF] font-semibold text-[#1769AA]"
                        : "text-[#102A43] hover:bg-[#F7FAFC]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* List */}
      {rows.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">No reports yet.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No reports match your filters.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-3 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Link key={r.id} href={`/admin/reports/${r.id}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="flex items-start gap-4 rounded-xl border border-[#D9E2EC] bg-white p-4 transition hover:border-[#1769AA]/40"
              >
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
                        {r.category && (
                          <span className="ml-2 text-xs font-normal text-[#829AB1]">
                            {r.category}
                          </span>
                        )}
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
                      <span className="inline-flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
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
                    Submitted by{" "}
                    <span className="font-medium text-[#627D98]">
                      {r.submitterName}
                    </span>{" "}
                    · {formatDateTime(r.createdAt)}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}