"use client";

import { FileText, Forward, CheckCircle2 } from "lucide-react";
import type { ReviewerStats } from "@/lib/reviewer/get-reviewer-dashboard";

const CARDS = [
  {
    key: "pendingReviews",
    label: "Pending Reviews",
    hint: "Awaiting your decision",
    icon: FileText,
    bg: "bg-[#FFF6DF]",
    color: "text-[#F59E0B]",
  },
  {
    key: "forwardedCases",
    label: "Forwarded Cases",
    hint: "Sent to inspector pool",
    icon: Forward,
    bg: "bg-[#E8F1FB]",
    color: "text-[#1769AA]",
  },
  {
    key: "reviewedByYou",
    label: "Reviewed by You",
    hint: "Forwarded or rejected",
    icon: CheckCircle2,
    bg: "bg-[#EAF8F0]",
    color: "text-[#16A34A]",
  },
] as const;

export default function StatsGrid({ stats }: { stats: ReviewerStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {CARDS.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.key}
            className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#627D98]">{c.label}</p>
                <h3 className="mt-2 text-3xl font-bold text-[#102A43]">
                  {stats[c.key as keyof ReviewerStats]}
                </h3>
                <p className="mt-2 text-xs text-[#829AB1]">{c.hint}</p>
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${c.bg}`}
              >
                <Icon className={`h-5 w-5 ${c.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}