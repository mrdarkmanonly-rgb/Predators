"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  Clock,
  Loader,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "cn";
import { STATS, type StatTone } from "./data";

const ICONS = {
  assigned: ClipboardList,
  pending: Clock,
  "in-progress": Loader,
  completed: CheckCircle2,
  violations: AlertTriangle,
  actions: Gavel,
} as const;

/* -------------------------------------------------------
   Tones map to the OFFICIAL CheckItRight palette only.
   - blue  → #1769AA  (interactive / active work)
   - amber → #F59E0B  (pending / warning)
   - green → #16A34A  (success / completed)
   - red   → #DC2626  (violation / error)
   - navy  → #0B1F33  (dark primary)
   Tints use #EAF4FF (official light blue) or opacity
   variants of the base color — no new hex codes.
------------------------------------------------------- */
const TONES: Record<
  StatTone,
  { border: string; iconBg: string; iconColor: string }
> = {
  blue: {
    border: "border-[#1769AA]/20",
    iconBg: "bg-[#EAF4FF]",
    iconColor: "text-[#1769AA]",
  },
  amber: {
    border: "border-[#F59E0B]/20",
    iconBg: "bg-[#F59E0B]/10",
    iconColor: "text-[#F59E0B]",
  },
  green: {
    border: "border-[#16A34A]/20",
    iconBg: "bg-[#16A34A]/10",
    iconColor: "text-[#16A34A]",
  },
  red: {
    border: "border-[#DC2626]/20",
    iconBg: "bg-[#DC2626]/10",
    iconColor: "text-[#DC2626]",
  },
  navy: {
    border: "border-[#0B1F33]/15",
    iconBg: "bg-[#0B1F33]/5",
    iconColor: "text-[#0B1F33]",
  },
};

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {STATS.map((stat, i) => {
        const Icon = ICONS[stat.id as keyof typeof ICONS] ?? ClipboardList;
        const tone = TONES[stat.tone];
        const Trend = stat.trend === "up" ? TrendingUp : TrendingDown;
        const trendColor =
          stat.trend === "up" ? "text-[#16A34A]" : "text-[#DC2626]";

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className={cn(
              "flex flex-col gap-2 rounded-xl border bg-white p-3 shadow-[0_1px_2px_rgba(16,42,67,0.04)] sm:p-3.5",
              tone.border
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  tone.iconBg
                )}
              >
                <Icon className={cn("h-4 w-4", tone.iconColor)} />
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#102A43]">
                {stat.value}
              </span>
              <span className={cn("flex items-center gap-0.5 text-[10px] font-semibold", trendColor)}>
                <Trend className="h-3 w-3" />
              </span>
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold text-[#102A43]/80">
                {stat.label}
              </span>
              <span className="text-[10px] text-[#627D98]">{stat.delta}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}