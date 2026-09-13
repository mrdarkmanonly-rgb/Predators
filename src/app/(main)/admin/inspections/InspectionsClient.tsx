"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, MapPin, UserRound, AlertCircle } from "lucide-react";
import type { AdminInspection } from "@/lib/admin/get-admin-inspections";

type Tab = "active" | "completed";
type SortKey = "newest" | "oldest" | "report_asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "report_asc", label: "Report code (A–Z)" },
];

// ── relative time (client-only) ──
function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState<string>("");
  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(iso).getTime();
      const s = Math.floor(diff / 1000);
      if (s < 60) setLabel("just now");
      else if (s < 3600) setLabel(`${Math.floor(s / 60)} min ago`);
      else if (s < 86_400) {
        const h = Math.floor(s / 3600);
        setLabel(`${h} hour${h === 1 ? "" : "s"} ago`);
      } else {
        const d = Math.floor(s / 86_400);
        setLabel(`${d} day${d === 1 ? "" : "s"} ago`);
      }
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [iso]);
  return <span suppressHydrationWarning>{label}</span>;
}

export default function InspectionsClient({
  active,
  completed,
  total,
}: {
  active: AdminInspection[];
  completed: AdminInspection[];
  total: number;
}) {
  const [tab, setTab] = useState<Tab>("active");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const source = tab === "active" ? active : completed;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = source;

    if (q) {
      result = result.filter(
        (i) =>
          i.reportCode.toLowerCase().includes(q) ||
          i.productName.toLowerCase().includes(q) ||
          i.inspectorName.toLowerCase().includes(q) ||
          i.inspectorEmail.toLowerCase().includes(q) ||
          (i.locationText ?? "").toLowerCase().includes(q),
      );
    }

    const sorted = [...result];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => {
          const aT = a.completedAt ?? a.claimedAt;
          const bT = b.completedAt ?? b.claimedAt;
          return bT.localeCompare(aT);
        });
        break;
      case "oldest":
        sorted.sort((a, b) => {
          const aT = a.completedAt ?? a.claimedAt;
          const bT = b.completedAt ?? b.claimedAt;
          return aT.localeCompare(bT);
        });
        break;
      case "report_asc":
        sorted.sort((a, b) => a.reportCode.localeCompare(b.reportCode));
        break;
    }
    return sorted;
  }, [source, query, sort]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#102A43]">Inspections</h2>
          <p className="mt-1 text-sm text-[#627D98]">
            All field inspections across the system.
          </p>
        </div>
        <span className="mt-2 text-xs font-semibold text-[#627D98]">
          {filtered.length} of {source.length} · {total} total
        </span>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-[#D9E2EC] bg-white p-1">
        <button
          onClick={() => setTab("active")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            tab === "active"
              ? "bg-[#1769AA] text-white"
              : "text-[#627D98] hover:text-[#1769AA]"
          }`}
        >
          Active
          <span
            className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
              tab === "active"
                ? "bg-white/25 text-white"
                : "bg-[#EAF4FF] text-[#1769AA]"
            }`}
          >
            {active.length}
          </span>
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            tab === "completed"
              ? "bg-[#1769AA] text-white"
              : "text-[#627D98] hover:text-[#1769AA]"
          }`}
        >
          Completed
          <span
            className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
              tab === "completed"
                ? "bg-white/25 text-white"
                : "bg-[#EAF4FF] text-[#1769AA]"
            }`}
          >
            {completed.length}
          </span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by report code, product, inspector…"
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

      {/* Results */}
      {source.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">
            {tab === "active"
              ? "No active inspections right now."
              : "No completed inspections yet."}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No inspections match your search.
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-3 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((insp) => (
            <Link
              key={insp.id}
              href={`/admin/reports/${insp.reportId}`}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-[#D9E2EC] bg-white p-4 transition hover:border-[#1769AA]/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-mono text-[#829AB1]">
                        {insp.reportCode}
                      </p>
                      <span className="text-[#D9E2EC]">·</span>
                      <p className="text-sm font-semibold text-[#102A43]">
                        {insp.productName}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#627D98]">
                      <span className="inline-flex items-center gap-1">
                        <UserRound className="h-3 w-3" />
                        {insp.inspectorName}
                      </span>
                      {insp.locationText && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {insp.locationText}
                        </span>
                      )}
                      {insp.isActive ? (
                        <span>
                          Claimed <RelativeTime iso={insp.claimedAt} />
                        </span>
                      ) : (
                        insp.completedAt && (
                          <span>
                            Completed{" "}
                            <RelativeTime iso={insp.completedAt} />
                          </span>
                        )
                      )}
                    </div>

                    {!insp.isActive && insp.violationFound && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FEECEC] px-2 py-0.5 text-[10px] font-semibold text-[#DC2626]">
                        <AlertCircle className="h-3 w-3" />
                        Violation found
                      </div>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      insp.isActive
                        ? "bg-[#DBEAFE] text-[#1D4ED8]"
                        : insp.violationFound
                        ? "bg-[#FEF3C7] text-[#B45309]"
                        : "bg-[#DCFCE7] text-[#15803D]"
                    }`}
                  >
                    {insp.isActive
                      ? "In Progress"
                      : insp.violationFound
                      ? "Completed · Violation"
                      : "Completed"}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}