"use client";

import { useEffect, useRef, useState } from "react";
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

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}

function StatCard({
  card,
  value,
  index,
}: {
  card: (typeof CARDS)[number];
  value: number;
  index: number;
}) {
  const Icon = card.icon;
  const animatedValue = useCountUp(value);

  return (
    <div
      className="group animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      style={{ animationDelay: `${index * 100}ms`, animationDuration: "400ms", animationFillMode: "backwards" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#627D98]">{card.label}</p>
          <h3 className="mt-2 text-3xl font-bold tabular-nums text-[#102A43]">
            {animatedValue}
          </h3>
          <p className="mt-2 text-xs text-[#829AB1]">{card.hint}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${card.bg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon className={`h-5 w-5 ${card.color}`} />
        </div>
      </div>
    </div>
  );
}

export default function StatsGrid({ stats }: { stats: ReviewerStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {CARDS.map((c, i) => (
        <StatCard
          key={c.key}
          card={c}
          value={stats[c.key as keyof ReviewerStats]}
          index={i}
        />
      ))}
    </div>
  );
}