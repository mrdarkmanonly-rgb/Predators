"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, List, LayoutGrid, ChevronDown } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { UserProduct } from "@/lib/consumer/get-user-products";

const STATUS_LABEL: Record<UserProduct["latestStatus"], string> = {
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

type SortKey = "recent" | "most_scanned" | "least_scanned" | "name_asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recently scanned" },
  { value: "most_scanned", label: "Most scanned" },
  { value: "least_scanned", label: "Least scanned" },
  { value: "name_asc", label: "Name (A–Z)" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MyProductsClient({
  products,
}: {
  products: UserProduct[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = products;

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
        sorted.sort((a, b) => b.lastScannedAt.localeCompare(a.lastScannedAt));
        break;
      case "most_scanned":
        sorted.sort((a, b) => b.scanCount - a.scanCount);
        break;
      case "least_scanned":
        sorted.sort((a, b) => a.scanCount - b.scanCount);
        break;
      case "name_asc":
        sorted.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
    }
    return sorted;
  }, [products, query, sort]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">Products</h1>
          <p className="text-sm text-[#627D98] mt-1">
            Products you&apos;ve scanned.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#627D98] mt-2">
          {filtered.length} of {products.length}
        </span>
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
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No products scanned yet. Scan your first product.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No products match your search.
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-3 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : view === "list" ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] divide-y divide-[#EAF0F6]">
          {filtered.map((p) => (
            <motion.div
              key={p.productId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 hover:bg-[#F7FAFC] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] flex items-center justify-center text-sm font-bold text-[#1769AA] shrink-0">
                  {p.productName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#102A43] truncate">
                    {p.productName}
                  </p>
                  <p className="text-xs text-[#627D98] mt-0.5">
                    {p.brandName ? `${p.brandName} · ` : ""}
                    Last: {formatDate(p.lastScannedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-[#627D98]">
                    {p.scanCount} {p.scanCount === 1 ? "scan" : "scans"}
                  </span>
                  <StatusBadge status={STATUS_LABEL[p.latestStatus]} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <motion.div
              key={p.productId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border border-[#D9E2EC] p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] flex items-center justify-center text-sm font-bold text-[#1769AA]">
                  {p.productName.charAt(0)}
                </div>
                <StatusBadge status={STATUS_LABEL[p.latestStatus]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#102A43] line-clamp-2">
                  {p.productName}
                </p>
                {p.brandName && (
                  <p className="text-xs text-[#627D98] mt-0.5">
                    {p.brandName}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-[#9FB3C8]">
                    {formatDate(p.lastScannedAt)}
                  </span>
                  <span className="text-[11px] font-semibold text-[#627D98]">
                    {p.scanCount} {p.scanCount === 1 ? "scan" : "scans"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}