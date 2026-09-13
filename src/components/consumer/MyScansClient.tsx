"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, List, LayoutGrid, ChevronDown } from "lucide-react";
import ScanItem from "./ScanItem";
import StatusBadge from "./StatusBadge";
import type { UserScan } from "@/lib/consumer/get-user-scans";

const STATUS_LABEL: Record<UserScan["status"], string> = {
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

type SortKey =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "status_completed"
  | "status_processing"
  | "status_failed";

type StatusFilter = "all" | "COMPLETED" | "PROCESSING" | "FAILED";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "name_desc", label: "Name (Z–A)" },
  { value: "status_completed", label: "Status: Completed first" },
  { value: "status_processing", label: "Status: Processing first" },
  { value: "status_failed", label: "Status: Failed first" },
];

const STATUS_CHIPS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "FAILED", label: "Failed" },
];

// Higher number = sorts earlier when "X first" is selected
const STATUS_PRIORITY: Record<SortKey, Record<UserScan["status"], number>> = {
  newest: { COMPLETED: 0, PROCESSING: 0, FAILED: 0 },
  oldest: { COMPLETED: 0, PROCESSING: 0, FAILED: 0 },
  name_asc: { COMPLETED: 0, PROCESSING: 0, FAILED: 0 },
  name_desc: { COMPLETED: 0, PROCESSING: 0, FAILED: 0 },
  status_completed: { COMPLETED: 2, PROCESSING: 1, FAILED: 0 },
  status_processing: { COMPLETED: 1, PROCESSING: 2, FAILED: 0 },
  status_failed: { COMPLETED: 1, PROCESSING: 0, FAILED: 2 },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyScansClient({ scans }: { scans: UserScan[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let result = scans;

    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (q) {
      result = result.filter(
        (s) =>
          s.productName.toLowerCase().includes(q) ||
          (s.brandName ?? "").toLowerCase().includes(q),
      );
    }

    const sorted = [...result];
    const isStatusSort = sort.startsWith("status_");

    if (isStatusSort) {
      const priority = STATUS_PRIORITY[sort];
      sorted.sort((a, b) => {
        const diff = priority[b.status] - priority[a.status];
        if (diff !== 0) return diff;
        // tie-break: newest first
        return b.createdAt.localeCompare(a.createdAt);
      });
    } else {
      switch (sort) {
        case "newest":
          sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          break;
        case "oldest":
          sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          break;
        case "name_asc":
          sorted.sort((a, b) => a.productName.localeCompare(b.productName));
          break;
        case "name_desc":
          sorted.sort((a, b) => b.productName.localeCompare(a.productName));
          break;
      }
    }

    return sorted;
  }, [scans, query, sort, statusFilter]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">My Scans</h1>
          <p className="text-sm text-[#627D98] mt-1">
            Every product you&apos;ve scanned.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#627D98] mt-2">
          {filtered.length} of {scans.length}
        </span>
      </div>

      {/* Status filter chips */}
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
            placeholder="Search by product or brand…"
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
                className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-[#D9E2EC] bg-white shadow-lg overflow-hidden"
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
      {scans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No scans yet. Scan your first product.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No scans match your filters.
          </p>
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
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-4">
          {filtered.map((s) => (
            <ScanItem
              key={s.id}
              name={s.productName}
              date={formatDate(s.createdAt)}
              status={STATUS_LABEL[s.status] ?? s.status}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border border-[#D9E2EC] p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] flex items-center justify-center text-sm font-bold text-[#1769AA]">
                  {s.productName.charAt(0)}
                </div>
                <StatusBadge status={STATUS_LABEL[s.status] ?? s.status} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#102A43] line-clamp-2">
                  {s.productName}
                </p>
                {s.brandName && (
                  <p className="text-xs text-[#627D98] mt-0.5">
                    {s.brandName}
                  </p>
                )}
                <p className="text-[11px] text-[#9FB3C8] mt-2">
                  {formatDate(s.createdAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}