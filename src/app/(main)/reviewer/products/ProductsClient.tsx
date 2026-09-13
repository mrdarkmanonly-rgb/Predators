"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Package } from "lucide-react";
import { fmtDate } from "@/lib/format";
import type { ReviewedProduct } from "@/lib/reviewer/get-reviewed-products";

type SortKey = "recent" | "most" | "name_asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recently reviewed" },
  { value: "most", label: "Most reported" },
  { value: "name_asc", label: "Name (A–Z)" },
];

export default function ProductsClient({
  products,
  categories,
}: {
  products: ReviewedProduct[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = products;

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
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
          b.lastReviewedAt.localeCompare(a.lastReviewedAt),
        );
        break;
      case "most":
        sorted.sort((a, b) => b.reportCount - a.reportCount);
        break;
      case "name_asc":
        sorted.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
    }
    return sorted;
  }, [products, query, category, sort]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#102A43]">Products</h2>
          <p className="mt-1 text-sm text-[#627D98]">
            Products from reports you&apos;ve reviewed.
          </p>
        </div>
        <span className="mt-2 text-xs font-semibold text-[#627D98]">
          {filtered.length} of {products.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product or brand…"
            className="w-full rounded-xl border border-[#D9E2EC] bg-white py-2.5 pl-9 pr-3 text-sm text-[#102A43] placeholder:text-[#9FB3C8] focus:border-[#1769AA] focus:outline-none focus:ring-2 focus:ring-[#1769AA]/10"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-[#D9E2EC] bg-white px-3 py-2.5 text-sm text-[#102A43] focus:border-[#1769AA] focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

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
                className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-[#D9E2EC] bg-white shadow-lg"
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

      {products.length === 0 ? (
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
          <p className="text-sm text-[#627D98]">
            No products match your filters.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
            className="mt-3 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <motion.div
              key={p.productId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="flex items-start gap-4 rounded-xl border border-[#D9E2EC] bg-white p-4 transition hover:border-[#1769AA]/40"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EAF4FF]">
                <Package className="h-5 w-5 text-[#1769AA]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#102A43]">
                  {p.productName}
                </p>

                <p className="mt-0.5 truncate text-xs text-[#627D98]">
                  {[p.brandName, p.category].filter(Boolean).join(" · ") || "—"}
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#829AB1]">
                  <span>
                    {p.reportCount}{" "}
                    {p.reportCount === 1 ? "report" : "reports"} reviewed
                  </span>
                  <span>Last: {fmtDate(p.lastReviewedAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}