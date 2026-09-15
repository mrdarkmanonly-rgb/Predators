"use client";

import { useEffect, useState } from "react";
import {
  Scale,
  Tag,
  CalendarX,
  IndianRupee,
  HelpCircle,
} from "lucide-react";

import type { IssueTypeCount } from "@/lib/reviewer/get-reviewer-dashboard";

const ICONS = [Scale, Tag, CalendarX, IndianRupee, HelpCircle];

export default function IssueTypeChart({
  data,
}: {
  data: IssueTypeCount[];
}) {
  const max =
    data.length > 0 ? Math.max(...data.map((d) => d.value)) : 1;

  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));

    return () => cancelAnimationFrame(id);
  }, [data]);

  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      
      <h3 className="text-sm font-bold text-[#102A43]">
        Reports by Issue Type
      </h3>

      <div className="mt-5 space-y-1">
        {data.length === 0 ? (
          <p className="py-8 text-center text-xs text-[#829AB1]">
            No reports yet.
          </p>
        ) : (
          data.map((d, i) => {
            const Icon = ICONS[i] ?? HelpCircle;
            const pct = Math.round((d.value / max) * 100);

            const isHovered = hovered === d.label;
            const isDimmed =
              hovered !== null && !isHovered;

            return (
              <div
                key={d.label}
                onMouseEnter={() => setHovered(d.label)}
                onMouseLeave={() => setHovered(null)}
                className={`group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-all duration-300 ${
                  isHovered ? "bg-[#F0F7FF]" : ""
                } ${
                  isDimmed ? "opacity-50" : "opacity-100"
                }`}
                style={{
                  transitionDelay: mounted
                    ? "0ms"
                    : `${i * 60}ms`,
                }}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 transition-all duration-300 ${
                    isHovered
                      ? "scale-110 text-[#102A43]"
                      : "text-[#627D98]"
                  }`}
                />

                <span className="w-32 shrink-0 truncate text-[11px] font-medium text-[#102A43]">
                  {d.label}
                </span>

                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#EAF4FF]">
                  <div
                    className="h-full rounded-full transition-[width] ease-out"
                    style={{
                      width: `${mounted ? pct : 0}%`,
                      background: d.color,
                      transitionDuration: "800ms",
                      transitionDelay: `${i * 80}ms`,
                      boxShadow: isHovered
                        ? `0 0 8px ${d.color}80`
                        : "none",
                    }}
                  />
                </div>

                <span className="w-6 shrink-0 text-right text-[11px] font-bold tabular-nums text-[#102A43]">
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