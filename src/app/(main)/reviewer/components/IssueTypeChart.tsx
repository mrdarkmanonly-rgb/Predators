"use client";

import { Scale, Tag, CalendarX, IndianRupee, HelpCircle } from "lucide-react";
import type { IssueTypeCount } from "@/lib/reviewer/get-reviewer-dashboard";

const ICONS = [Scale, Tag, CalendarX, IndianRupee, HelpCircle];

export default function IssueTypeChart({ data }: { data: IssueTypeCount[] }) {
  const max = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 1;

  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[#102A43]">
        Reports by Issue Type
      </h3>

      <div className="mt-5 space-y-3">
        {data.length === 0 ? (
          <p className="py-8 text-center text-xs text-[#829AB1]">
            No reports yet.
          </p>
        ) : (
          data.map((d, i) => {
            const Icon = ICONS[i] ?? HelpCircle;
            const pct = Math.round((d.value / max) * 100);
            return (
              <div key={d.label} className="flex items-center gap-3">
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#627D98]" />
                <span className="w-32 shrink-0 truncate text-[11px] font-medium text-[#102A43]">
                  {d.label}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#EAF4FF]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: d.color }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-[11px] font-bold text-[#102A43]">
                  {d.value}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}