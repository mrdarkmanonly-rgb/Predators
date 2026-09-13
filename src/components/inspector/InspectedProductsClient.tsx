"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import type { InspectedProduct } from "@/lib/inspector/get-inspected-products";

type SortKey = "recent" | "most" | "name_asc";
type FilterKey = "all" | "violations" | "no_violation";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recently inspected" },
  { value: "most", label: "Most inspected" },
  { value: "name_asc", label: "Name (A–Z)" },
];

const FILTER_CHIPS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "All" },
  { value: "violations", label: "Violations" },
  { value: "no_violation", label: "No violation" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InspectedProductsClient({
  products,
}: {
  products: InspectedProduct[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = products;

    if (filter === "violations") {
      result = result.filter((p) => p.hasAnyViolation);
    } else if (filter === "no_violation") {
      result = result.filter((p) => !p.hasAnyViolation);
    }

    if (q) {
      result = result.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          (p.brandName ?? "").toLowerCase().includes(q),
      );
    }

    const sorted = [...result];
    switch (sort) {
      case "recent":
        sorted.sort((a, b) =>
          b.lastInspectedAt.localeCompare(a.lastInspectedAt),
        );
        break;
      case "most":
        sorted.sort((a, b) => b.inspectionCount - a.inspectionCount);
        break;
      case "name_asc":
        sorted.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
    }
    return sorted;
  }, [products, query, sort, filter]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">Products</h1>
          <p className="text-sm text-[#627D98] mt-1">
            Products you&apos;ve inspected.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#627D98] mt-2">
          {filtered.length} of {products.length}
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
                className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#D9E2EC] bg-white shadow-lg overflow-hidden"
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
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            You haven&apos;t inspected any products yet.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No products match your filters.
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
          {filtered.map((p) => {
            const isResolved = p.latestStatus === "RESOLVED";
            return (
              <motion.div
                key={p.productId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-[#D9E2EC] p-4 flex items-start gap-3"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#EAF4FF] flex items-center justify-center text-sm font-bold text-[#1769AA]">
                  {p.productName.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#102A43] truncate">
                        {p.productName}
                      </p>
                      <p className="text-xs text-[#627D98] mt-0.5">
                        {p.brandName ? `${p.brandName} · ` : ""}
                        Last: {formatDate(p.lastInspectedAt)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-[#627D98]">
                      {p.inspectionCount}{" "}
                      {p.inspectionCount === 1 ? "inspection" : "inspections"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        isResolved
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Resolved
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Rejected
                        </>
                      )}
                    </span>

                    {p.hasAnyViolation && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Violation found
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}