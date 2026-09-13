"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Package } from "lucide-react";
import type { AdminProduct } from "@/lib/admin/get-admin-products";

type SortKey = "newest" | "oldest" | "most_scanned" | "name_asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest added" },
  { value: "oldest", label: "Oldest added" },
  { value: "most_scanned", label: "Most scanned" },
  { value: "name_asc", label: "Name (A–Z)" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ProductsClient({
  products,
  categories,
  total,
  capped,
}: {
  products: AdminProduct[];
  categories: string[];
  total: number;
  capped: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
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
          (p.brandName ?? "").toLowerCase().includes(q) ||
          (p.manufacturer ?? "").toLowerCase().includes(q),
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
      case "most_scanned":
        sorted.sort((a, b) => b.scansCount - a.scansCount);
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#102A43]">Products</h2>
          <p className="mt-1 text-sm text-[#627D98]">
            All products in the system.
          </p>
        </div>
        <span className="mt-2 text-xs font-semibold text-[#627D98]">
          {filtered.length} of {products.length}
          {capped && ` (showing latest 200 of ${total})`}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, brand, manufacturer…"
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
                className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-[#D9E2EC] bg-white shadow-lg"
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

      {/* Results */}
      {products.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">No products yet.</p>
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
            <Link key={p.id} href={`/product/${p.id}`} className="block">
              <motion.div
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
                    {[p.brandName, p.category, p.manufacturer]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#829AB1]">
                    {p.mrp && <span>MRP {p.mrp}</span>}
                    {p.netQuantity && <span>{p.netQuantity}</span>}
                    <span>
                      {p.scansCount}{" "}
                      {p.scansCount === 1 ? "scan" : "scans"}
                    </span>
                    {p.reportsCount > 0 && (
                      <span>
                        {p.reportsCount}{" "}
                        {p.reportsCount === 1 ? "report" : "reports"}
                      </span>
                    )}
                    <span>Added {formatDate(p.createdAt)}</span>
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