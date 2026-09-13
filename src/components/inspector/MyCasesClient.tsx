"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  MapPin,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import type { MyCase } from "@/lib/inspector/get-my-cases";

type SortKey = "newest" | "oldest" | "issue_asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest claimed" },
  { value: "oldest", label: "Oldest claimed" },
  { value: "issue_asc", label: "Issue (A–Z)" },
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

export default function MyCasesClient({ cases }: { cases: MyCase[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = cases;

    if (q) {
      result = result.filter(
        (c) =>
          c.reportCode.toLowerCase().includes(q) ||
          c.productName.toLowerCase().includes(q) ||
          (c.issueType ?? "").toLowerCase().includes(q) ||
          (c.locationText ?? "").toLowerCase().includes(q),
      );
    }

    const sorted = [...result];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => b.claimedAt.localeCompare(a.claimedAt));
        break;
      case "oldest":
        sorted.sort((a, b) => a.claimedAt.localeCompare(b.claimedAt));
        break;
      case "issue_asc":
        sorted.sort((a, b) =>
          (a.issueType ?? "").localeCompare(b.issueType ?? ""),
        );
        break;
    }
    return sorted;
  }, [cases, query, sort]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">My Cases</h1>
          <p className="text-sm text-[#627D98] mt-1">
            Cases you&apos;ve claimed and are working on.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#627D98] mt-2">
          {filtered.length} of {cases.length}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#627D98]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by case code, product, issue, location…"
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
      </div>

      {/* Results */}
      {cases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            You haven&apos;t claimed any cases yet.
          </p>
          <Link
            href="/inspector/available"
            className="inline-block mt-3 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            Visit Available Cases →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No cases match your search.
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-3 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <motion.div
              key={c.inspectionId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#D9E2EC] p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:border-[#1769AA]/40 transition"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono text-[#627D98]">
                  #{c.reportCode}
                </p>
                <p className="text-sm font-semibold text-[#102A43] mt-1 truncate">
                  {c.productName}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-[#627D98]">
                  {c.issueType && (
                    <span className="inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {c.issueType}
                    </span>
                  )}
                  {c.locationText && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {c.locationText}
                    </span>
                  )}
                  <span>Claimed {relativeTime(c.claimedAt)}</span>
                </div>
              </div>

              <Link
                href={`/inspector/cases/${c.inspectionId}`}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#1769AA] text-white hover:bg-[#135a92] transition"
              >
                Open Inspection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}