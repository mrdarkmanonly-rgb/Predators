"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, List, LayoutGrid, ChevronDown } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { UserReport } from "@/lib/consumer/get-user-reports";

type SortKey = "newest" | "oldest" | "code_asc" | "status_rejected";
type StatusFilter = "all" | "SUBMITTED" | "FORWARDED_TO_INSPECTOR" | "REJECTED" | "RESOLVED";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "code_asc", label: "Code (A–Z)" },
  { value: "status_rejected", label: "Rejected first" },
];

const STATUS_CHIPS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "FORWARDED_TO_INSPECTOR", label: "Forwarded" },
  { value: "REJECTED", label: "Rejected" },
  { value: "RESOLVED", label: "Resolved" },
];

const STATUS_PRIORITY_REJECTED: Record<UserReport["statusRaw"], number> = {
  REJECTED: 3,
  FORWARDED_TO_INSPECTOR: 2,
  SUBMITTED: 1,
  RESOLVED: 0,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function remarkColor(statusRaw: UserReport["statusRaw"]) {
  if (statusRaw === "REJECTED") return "text-red-600";
  if (statusRaw === "RESOLVED") return "text-emerald-700";
  return "text-[#627D98]";
}

export default function MyReportsClient({ reports }: { reports: UserReport[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = reports;

    if (statusFilter !== "all") {
      result = result.filter((r) => r.statusRaw === statusFilter);
    }

    if (q) {
      result = result.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          r.reportCode.toLowerCase().includes(q) ||
          (r.brandName ?? "").toLowerCase().includes(q),
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
        sorted.sort((a, b) => a.reportCode.localeCompare(b.reportCode));
        break;
      case "status_rejected":
        sorted.sort((a, b) => {
          const diff =
            STATUS_PRIORITY_REJECTED[b.statusRaw] -
            STATUS_PRIORITY_REJECTED[a.statusRaw];
          return diff !== 0 ? diff : b.createdAt.localeCompare(a.createdAt);
        });
        break;
    }
    return sorted;
  }, [reports, query, sort, statusFilter]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">My Reports</h1>
          <p className="text-sm text-[#627D98] mt-1">
            Reports you&apos;ve submitted.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#627D98] mt-2">
          {filtered.length} of {reports.length}
        </span>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_CHIPS.map((chip) => {
          const active = statusFilter === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => setStatusFilter(chip.value)}
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
            placeholder="Search by report code or product…"
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
                className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-[#D9E2EC] bg-white shadow-lg overflow-hidden"
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

        <div className="flex rounded-xl border border-[#D9E2EC] bg-white p-1">
          <button
            onClick={() => setView("list")}
            aria-label="List view"
            className={`p-2 rounded-lg transition ${
              view === "list"
                ? "bg-[#1769AA] text-white"
                : "text-[#627D98] hover:text-[#1769AA]"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className={`p-2 rounded-lg transition ${
              view === "grid"
                ? "bg-[#1769AA] text-white"
                : "text-[#627D98] hover:text-[#1769AA]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            You haven&apos;t submitted any reports yet.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">No reports match your filters.</p>
          <button
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
            }}
            className="mt-3 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : view === "list" ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] divide-y divide-[#EAF0F6]">
          {filtered.map((r) => (
            <Link key={r.id} href={`/consumer/reports/${r.id}`} className="block">
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 hover:bg-[#F7FAFC] transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-[#627D98]">
                      #{r.reportCode}
                    </p>
                    <p className="text-sm font-semibold text-[#102A43] mt-1 truncate">
                      {r.productName}
                    </p>
                    <p className="text-xs text-[#627D98] mt-0.5">
                      {formatDate(r.createdAt)}
                      {r.issueType ? ` · ${r.issueType}` : ""}
                    </p>
                    {r.resolutionRemarks && (
                      <p
                        className={`text-xs mt-2 line-clamp-1 ${remarkColor(
                          r.statusRaw,
                        )}`}
                      >
                        <span className="font-semibold">
                          {r.statusRaw === "REJECTED" ? "Rejected" : "Update"}:
                        </span>{" "}
                        {r.resolutionRemarks}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r) => (
            <Link key={r.id} href={`/consumer/reports/${r.id}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl border border-[#D9E2EC] p-4 flex flex-col gap-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-mono text-[#627D98] truncate">
                    #{r.reportCode}
                  </p>
                  <StatusBadge status={r.status} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#102A43] line-clamp-2">
                    {r.productName}
                  </p>
                  {r.brandName && (
                    <p className="text-xs text-[#627D98] mt-0.5">
                      {r.brandName}
                    </p>
                  )}
                  <p className="text-[11px] text-[#9FB3C8] mt-2">
                    {formatDate(r.createdAt)}
                  </p>
                  {r.resolutionRemarks && (
                    <p
                      className={`text-[11px] mt-2 line-clamp-2 ${remarkColor(
                        r.statusRaw,
                      )}`}
                    >
                      {r.resolutionRemarks}
                    </p>
                  )}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}