"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { claimCase } from "@/actions/inspector/claim.actions";
import type { AvailableCase } from "@/lib/inspector/get-available-cases";

type SortKey = "newest" | "oldest" | "issue_asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
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

export default function AvailableCasesClient({
  cases,
}: {
  cases: AvailableCase[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [optimisticallyRemoved, setOptimisticallyRemoved] = useState<Set<string>>(
    new Set(),
  );

  const visible = useMemo(
    () => cases.filter((c) => !optimisticallyRemoved.has(c.reportId)),
    [cases, optimisticallyRemoved],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = visible;

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
        sorted.sort((a, b) => b.forwardedAt.localeCompare(a.forwardedAt));
        break;
      case "oldest":
        sorted.sort((a, b) => a.forwardedAt.localeCompare(b.forwardedAt));
        break;
      case "issue_asc":
        sorted.sort((a, b) =>
          (a.issueType ?? "").localeCompare(b.issueType ?? ""),
        );
        break;
    }
    return sorted;
  }, [visible, query, sort]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  function takeCase(reportId: string) {
    setClaimingId(reportId);

    startTransition(async () => {
      const res = await claimCase(reportId);

      if (res.ok) {
        setOptimisticallyRemoved((prev) => new Set(prev).add(reportId));
        toast.success("Case claimed", {
          description: "Moved to My Cases.",
          action: {
            label: "Go to My Cases",
            onClick: () => router.push("/inspector/my-cases"),
          },
        });
      } else if (res.reason === "ALREADY_CLAIMED") {
        toast.error("Already claimed", {
          description:
            "Another inspector took this case just before you. Removing from list.",
        });
        setOptimisticallyRemoved((prev) => new Set(prev).add(reportId));
      } else if (res.reason === "NOT_AVAILABLE") {
        toast.error("Case no longer available", {
          description: "It may have been resolved or rejected.",
        });
        setOptimisticallyRemoved((prev) => new Set(prev).add(reportId));
      } else {
        toast.error("Could not claim case");
      }

      setClaimingId(null);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            Available Cases
          </h1>
          <p className="text-sm text-[#627D98] mt-1">
            Forwarded reports waiting to be claimed.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#627D98] mt-2">
          {filtered.length} of {visible.length}
        </span>
      </div>

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

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No available cases right now. Check back soon.
          </p>
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
          <AnimatePresence initial={false}>
            {filtered.map((c) => {
              const isClaiming = claimingId === c.reportId;
              return (
                <Link
                  key={c.reportId}
                  href={`/inspector/cases/${c.reportId}`}
                  className="block"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl border border-[#D9E2EC] p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition hover:border-[#1769AA]/40"
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
                        <span>Forwarded {relativeTime(c.forwardedAt)}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        takeCase(c.reportId);
                      }}
                      disabled={isClaiming || pending}
                      className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#1769AA] text-white hover:bg-[#135a92] transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Claiming…
                        </>
                      ) : (
                        "Take Case"
                      )}
                    </button>
                  </motion.div>
                </Link>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}