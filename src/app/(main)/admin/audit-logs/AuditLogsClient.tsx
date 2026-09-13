"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ShieldCheck } from "lucide-react";
import type { AuditLogEntry } from "@/lib/admin/get-audit-logs";

type SortKey = "newest" | "oldest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

const ROLE_LABEL: Record<string, string> = {
  CONSUMER: "Consumer",
  REVIEWER: "Reviewer",
  INSPECTOR: "Inspector",
  ADMIN: "Admin",
};

function roleLabel(r: string) {
  return ROLE_LABEL[r] ?? r;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogsClient({
  logs,
}: {
  logs: AuditLogEntry[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = logs;

    if (q) {
      result = result.filter(
        (l) =>
          l.targetName.toLowerCase().includes(q) ||
          l.targetEmail.toLowerCase().includes(q) ||
          l.changedByName.toLowerCase().includes(q) ||
          l.changedByEmail.toLowerCase().includes(q),
      );
    }

    const sorted = [...result];
    sorted.sort((a, b) =>
      sort === "newest"
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt),
    );
    return sorted;
  }, [logs, query, sort]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#102A43]">Audit Logs</h2>
          <p className="mt-1 text-sm text-[#627D98]">
            System-wide role change history.
          </p>
        </div>
        <span className="mt-2 text-xs font-semibold text-[#627D98]">
          {filtered.length} of {logs.length}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by user or changer…"
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
      {logs.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">No audit logs yet.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No entries match your search.
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-3 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#D9E2EC] bg-white shadow-sm divide-y divide-[#EAF0F6]">
          {filtered.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 px-5 py-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF4FF]">
                <ShieldCheck className="h-4 w-4 text-[#1769AA]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#102A43]">
                  Role changed
                </p>

                <p className="mt-1 text-xs text-[#627D98]">
                  <span className="font-semibold text-[#486581]">
                    {log.targetName}
                  </span>
                  {" · "}
                  <span className="text-[#829AB1]">{log.targetEmail}</span>
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#F7FAFC] px-2 py-0.5 text-[10px] font-semibold text-[#627D98]">
                    {roleLabel(log.oldRole)}
                  </span>
                  <span className="text-[#829AB1]">→</span>
                  <span className="rounded-full bg-[#EAF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#1769AA]">
                    {roleLabel(log.newRole)}
                  </span>
                </div>

                <p className="mt-2 text-[11px] text-[#829AB1]">
                  by {log.changedByName} · {formatDateTime(log.createdAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}