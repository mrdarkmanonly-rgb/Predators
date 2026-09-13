"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import type { ReviewerNotification } from "@/lib/reviewer/get-reviewer-notifications";

type FilterKey = "all" | "FORWARDED" | "REJECTED" | "NEW_PENDING";

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "All" },
  { value: "NEW_PENDING", label: "New" },
  { value: "FORWARDED", label: "Forwarded" },
  { value: "REJECTED", label: "Rejected" },
];

const KIND_STYLE: Record<
  ReviewerNotification["kind"],
  { bg: string; icon: string; Icon: typeof Sparkles }
> = {
  FORWARDED: {
    bg: "bg-[#DBEAFE]",
    icon: "text-[#1769AA]",
    Icon: CheckCircle2,
  },
  REJECTED: {
    bg: "bg-[#FEECEC]",
    icon: "text-[#DC2626]",
    Icon: XCircle,
  },
  NEW_PENDING: {
    bg: "bg-[#FEF3C7]",
    icon: "text-[#B45309]",
    Icon: FileText,
  },
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const update = () => setLabel(relativeTime(iso));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [iso]);
  return <span suppressHydrationWarning>{label}</span>;
}

export default function NotificationsClient({
  notifications,
}: {
  notifications: ReviewerNotification[];
}) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.kind === filter);
  }, [notifications, filter]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#102A43]">Notifications</h2>
        <p className="mt-1 text-sm text-[#627D98]">
          Activity on reports and your reviews.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-[#1769AA] bg-[#1769AA] text-white"
                  : "border-[#D9E2EC] bg-white text-[#627D98] hover:border-[#1769AA]/40 hover:text-[#1769AA]"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">No notifications yet.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#D9E2EC] bg-white p-12 text-center">
          <p className="text-sm text-[#627D98]">
            No notifications match your filter.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#EAF0F6] rounded-xl border border-[#D9E2EC] bg-white shadow-sm">
          {filtered.map((n) => {
            const { bg, icon, Icon } = KIND_STYLE[n.kind];
            return (
              <Link
                key={n.id}
                href={`/reviewer/reports/${n.reportId}`}
                className="block transition hover:bg-[#F7FAFC]"
              >
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-4"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}
                  >
                    <Icon className={`h-4 w-4 ${icon}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#102A43]">
                      {n.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[#627D98]">
                      {n.detail}
                    </p>
                    <p className="mt-1 text-[11px] text-[#829AB1]">
                      <RelativeTime iso={n.occurredAt} />
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-[#829AB1]">
                    {n.reportCode}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}