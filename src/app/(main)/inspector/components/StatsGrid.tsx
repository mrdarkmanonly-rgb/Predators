"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  Loader,
  CheckCircle2,
  AlertTriangle,
  Gavel,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Stats = {
  availableCases: number;
  myCases: number;
  completed: number;
  violations: number;
  actions: number;
};

const CARDS = [
  {
    key: "availableCases",
    label: "Available Cases",
    hint: "Forwarded & unclaimed",
    icon: ClipboardList,
    tone: "blue" as const,
  },
  {
    key: "myCases",
    label: "My Cases",
    hint: "Claimed by you",
    icon: Loader,
    tone: "amber" as const,
  },
  {
    key: "completed",
    label: "Completed",
    hint: "Inspections finished",
    icon: CheckCircle2,
    tone: "green" as const,
  },
  {
    key: "violations",
    label: "Violations Found",
    hint: "Confirmed during field visit",
    icon: AlertTriangle,
    tone: "red" as const,
  },
  {
    key: "actions",
    label: "Actions Taken",
    hint: "Enforcement actions recorded",
    icon: Gavel,
    tone: "navy" as const,
  },
];

const TONES = {
  blue: { border: "border-[#1769AA]/20", iconBg: "bg-[#EAF4FF]", iconColor: "text-[#1769AA]" },
  amber: { border: "border-[#F59E0B]/20", iconBg: "bg-[#F59E0B]/10", iconColor: "text-[#F59E0B]" },
  green: { border: "border-[#16A34A]/20", iconBg: "bg-[#16A34A]/10", iconColor: "text-[#16A34A]" },
  red: { border: "border-[#DC2626]/20", iconBg: "bg-[#DC2626]/10", iconColor: "text-[#DC2626]" },
  navy: { border: "border-[#0B1F33]/15", iconBg: "bg-[#0B1F33]/5", iconColor: "text-[#0B1F33]" },
};

export default function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        const tone = TONES[card.tone];
        const value = stats[card.key as keyof Stats];

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className={cn(
              "flex flex-col gap-2 rounded-xl border bg-white p-3 shadow-[0_1px_2px_rgba(16,42,67,0.04)] sm:p-3.5",
              tone.border,
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                tone.iconBg,
              )}
            >
              <Icon className={cn("h-4 w-4", tone.iconColor)} />
            </span>

            <span className="text-xl font-bold text-[#102A43]">{value}</span>

            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold text-[#102A43]/80">
                {card.label}
              </span>
              <span className="text-[10px] text-[#627D98]">{card.hint}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}