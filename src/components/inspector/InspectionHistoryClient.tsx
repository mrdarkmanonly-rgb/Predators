"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { HistoryItem } from "@/lib/inspector/get-inspection-history";

type SortKey = "newest" | "oldest" | "code_asc";
type FilterKey = "all" | "RESOLVED" | "REJECTED" | "VIOLATION" | "NO_VIOLATION";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "code_asc", label: "Code (A–Z)" },
];

const FILTER_CHIPS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "All" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "VIOLATION", label: "Violation found" },
  { value: "NO_VIOLATION", label: "No violation" },
];

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InspectionHistoryClient({
  items,
}: {
  items: HistoryItem[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = items;

    if (filter === "RESOLVED" || filter === "REJECTED") {
      result = result.filter((i) => i.reportStatus === filter);
    } else if (filter === "VIOLATION") {
      result = result.filter((i) => i.violationFound);
    } else if (filter === "NO_VIOLATION") {
      result = result.filter((i) => !i.violationFound);
    }

    if (q) {
      result = result.filter(
        (i) =>
          i.reportCode.toLowerCase().includes(q) ||
          i.productName.toLowerCase().includes(q) ||
          (i.remarks ?? "").toLowerCase().includes(q) ||
          (i.issueType ?? "").toLowerCase().includes(q),
      );
    }

    const sorted = [...result];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
        break;
      case "oldest":
        sorted.sort((a, b) => a.completedAt.localeCompare(b.completedAt));
        break;
      case "code_asc":
        sorted.sort((a, b) => a.reportCode.localeCompare(b.reportCode));
        break;
    }
    return sorted;
  }, [items, query, sort, filter]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            Inspection History
          </h1>
          <p className="text-sm text-[#627D98] mt-1">
            Cases you&apos;ve completed in the field.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#627D98] mt-2">
          {filtered.length} of {items.length}
        </span>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => setFilter(chip.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition ${
                active
                  ? "bg-[#1769AA] text-white border-[#1769AA]"
                  : "bg-white text-[#627D98] border-[#D9E2EC] hover:border-[#1769AA]/40 hover:text-[#1769AA]"
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#627D98]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code, product, or remark…"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#D9E2EC] bg-white text-[#102A43] placeholder:text-[#9FB3C8] focus:outline-none focus:border-[#1769AA] focus:ring-2 focus:ring-[#1769AA]/10"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl border border-[#D9E2EC] bg-white text-[#102A43] hover:border-[#1769AA]/40 transition"
          >
            <span>{activeSortLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-[#627D98] transition-transform ${
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
                className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-[#D9E2EC] bg-white shadow-lg overflow-hidden"
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
                        ? "bg-[#EAF4FF] text-[#1769AA] font-semibold"
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

      {/* Results */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            You haven&apos;t completed any inspections yet.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No inspections match your filters.
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
        <div className="space-y-3">
          {filtered.map((item) => {
            const isResolved = item.reportStatus === "RESOLVED";
            return (
              <motion.div
                key={item.inspectionId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-[#D9E2EC] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-[#627D98]">
                      #{item.reportCode}
                    </p>
                    <p className="text-sm font-semibold text-[#102A43] mt-1 truncate">
                      {item.productName}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-[#627D98]">
                      {item.issueType && (
                        <span className="inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {item.issueType}
                        </span>
                      )}
                      {item.locationText && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.locationText}
                        </span>
                      )}
                      <span>Completed {relativeTime(item.completedAt)}</span>
                      <span>
                        {item.violationFound
                          ? "· Violation found"
                          : "· No violation"}
                      </span>
                    </div>

                    {item.remarks && (
                      <p className="text-xs italic text-[#627D98] mt-2 line-clamp-2">
                        &ldquo;{item.remarks}&rdquo;
                      </p>
                    )}

                    {item.actionType && (
                      <p className="text-[11px] text-[#627D98] mt-1.5">
                        Action: <span className="font-semibold">{item.actionType}</span>
                        {item.followUpRequired ? " · Follow-up required" : ""}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                      isResolved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {isResolved ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Resolved
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </>
                    )}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}