"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCircle2,
  XCircle,
  Forward,
  ChevronDown,
} from "lucide-react";
import type { UserNotification } from "@/lib/consumer/get-user-notifications";

type FilterKey = "all" | "unread" | "FORWARDED_TO_INSPECTOR" | "REJECTED" | "RESOLVED";

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "FORWARDED_TO_INSPECTOR", label: "Forwarded" },
  { value: "REJECTED", label: "Rejected" },
  { value: "RESOLVED", label: "Resolved" },
];

const STORAGE_KEY = "cir_seen_notifications";

const KIND_LABEL: Record<UserNotification["kind"], string> = {
  FORWARDED_TO_INSPECTOR: "Your report was forwarded to an inspector.",
  REJECTED: "Your report was rejected.",
  RESOLVED: "Your report was resolved.",
};

const KIND_COLOR: Record<UserNotification["kind"], string> = {
  FORWARDED_TO_INSPECTOR: "bg-indigo-50 text-indigo-700 border-indigo-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
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

function groupLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  return "Older";
}

function KindIcon({ kind }: { kind: UserNotification["kind"] }) {
  if (kind === "RESOLVED") return <CheckCircle2 className="w-4 h-4" />;
  if (kind === "REJECTED") return <XCircle className="w-4 h-4" />;
  return <Forward className="w-4 h-4" />;
}

export default function MyNotificationsClient({
  notifications,
}: {
  notifications: UserNotification[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // load "seen" set from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSeen(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // mark all visible notifications as seen after a short delay
  useEffect(() => {
    if (!hydrated) return;
    if (notifications.length === 0) return;
    const t = setTimeout(() => {
      const next = new Set(seen);
      notifications.forEach((n) => next.add(n.id));
      setSeen(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [hydrated, notifications, seen]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !seen.has(n.id)).length,
    [notifications, seen],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = notifications;

    if (filter === "unread") {
      result = result.filter((n) => !seen.has(n.id));
    } else if (filter !== "all") {
      result = result.filter((n) => n.kind === filter);
    }

    if (q) {
      result = result.filter(
        (n) =>
          n.reportCode.toLowerCase().includes(q) ||
          n.productName.toLowerCase().includes(q),
      );
    }

    return result;
  }, [notifications, query, filter, seen]);

  // group by Today / Yesterday / Older
  const grouped = useMemo(() => {
    const order = ["Today", "Yesterday", "Older"] as const;
    const buckets: Record<string, UserNotification[]> = {
      Today: [],
      Yesterday: [],
      Older: [],
    };
    filtered.forEach((n) => buckets[groupLabel(n.occurredAt)].push(n));
    return order
      .map((label) => ({ label, items: buckets[label] }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  const activeFilterLabel =
    FILTERS.find((f) => f.value === filter)?.label ?? "All";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">Notifications</h1>
          <p className="text-sm text-[#627D98] mt-1">
            Activity on your reports.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1769AA] text-white">
              {unreadCount} new
            </span>
          )}
          <span className="text-xs font-semibold text-[#627D98]">
            {filtered.length} of {notifications.length}
          </span>
        </div>
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
            onClick={() => setFilterOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl border border-[#D9E2EC] bg-white text-[#102A43] hover:border-[#1769AA]/40 transition"
          >
            <span>{activeFilterLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-[#627D98] transition-transform ${
                filterOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-[#D9E2EC] bg-white shadow-lg overflow-hidden"
              >
                {FILTERS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilter(opt.value);
                      setFilterOpen(false);
                    }}
                    className={`block w-full px-3 py-2.5 text-left text-sm transition ${
                      filter === opt.value
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
      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No notifications yet. Status updates on your reports will appear here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No notifications match your filters.
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
        grouped.map((group) => (
          <section key={group.label} className="space-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#627D98] px-1">
              {group.label}
            </h2>
            <div className="bg-white rounded-2xl border border-[#D9E2EC] divide-y divide-[#EAF0F6] overflow-hidden">
              {group.items.map((n) => {
                const unread = !seen.has(n.id);
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative p-4 flex gap-3"
                  >
                    {unread && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#1769AA]" />
                    )}
                    <div
                      className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border ${KIND_COLOR[n.kind]}`}
                    >
                      <KindIcon kind={n.kind} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#102A43] truncate">
                        #{n.reportCode} · {n.productName}
                      </p>
                      <p className="text-xs text-[#627D98] mt-0.5">
                        {KIND_LABEL[n.kind]}
                      </p>
                      {n.remark && (
                        <p className="text-xs italic text-[#627D98] mt-1 line-clamp-2">
                          “{n.remark}”
                        </p>
                      )}
                      <p className="text-[11px] text-[#9FB3C8] mt-1">
                        {formatRelative(n.occurredAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}