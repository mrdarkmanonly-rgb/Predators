"use client";

import { useEffect, useRef, useState } from "react";
import type { StatusSegment } from "@/lib/reviewer/get-reviewer-dashboard";

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}

export default function StatusDonut({
  segments,
  total,
}: {
  segments: StatusSegment[];
  total: number;
}) {
  const size = 160;
  const stroke = 18;
  const hoverStroke = 22;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const animatedTotal = useCountUp(total);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [segments]);

  const safeTotal = total > 0 ? total : 1;
  let offset = 0;
  const arcs = segments.map((s) => {
    const dash = (s.value / safeTotal) * circ;
    const arc = { ...s, dash, offset };
    offset += dash;
    return arc;
  });

  const hoveredSegment = segments.find((s) => s.key === hovered);

  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <h3 className="text-sm font-bold text-[#102A43]">Reports by Status</h3>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative shrink-0">
          <svg width={size} height={size} className="-rotate-90 overflow-visible">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#EAF4FF"
              strokeWidth={stroke}
            />
            {total > 0 &&
              arcs.map((arc, i) => {
                const isHovered = hovered === arc.key;
                const isDimmed = hovered !== null && !isHovered;
                return (
                  <circle
                    key={arc.key}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={isHovered ? hoverStroke : stroke}
                    strokeLinecap="butt"
                    strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
                    strokeDashoffset={mounted ? -arc.offset : circ}
                    opacity={isDimmed ? 0.35 : 1}
                    onMouseEnter={() => setHovered(arc.key)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer transition-[stroke-dashoffset,stroke-width,opacity] ease-out"
                    style={{
                      transitionDuration: "800ms, 200ms, 200ms",
                      transitionDelay: `${i * 120}ms, 0ms, 0ms`,
                      transformOrigin: "center",
                    }}
                  />
                );
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {hoveredSegment ? (
              <>
                <span
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: hoveredSegment.color }}
                >
                  {hoveredSegment.value}
                </span>
                <span className="max-w-[90px] truncate text-[10px] font-medium uppercase tracking-wider text-[#627D98]">
                  {hoveredSegment.label}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold tabular-nums text-[#102A43]">
                  {animatedTotal}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#627D98]">
                  Reports
                </span>
              </>
            )}
          </div>
        </div>

        <ul className="flex w-full flex-col gap-1">
          {segments.map((s) => {
            const isHovered = hovered === s.key;
            const isDimmed = hovered !== null && !isHovered;
            const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
            return (
              <li
                key={s.key}
                onMouseEnter={() => setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 -mx-2 text-xs transition-all duration-200 ${
                  isHovered ? "bg-[#F7FAFC]" : ""
                } ${isDimmed ? "opacity-40" : "opacity-100"}`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-200"
                  style={{
                    background: s.color,
                    transform: isHovered ? "scale(1.3)" : "scale(1)",
                  }}
                />
                <span className="flex-1 text-[#102A43]">{s.label}</span>
                <span className="text-[10px] text-[#829AB1]">{pct}%</span>
                <span className="font-semibold text-[#102A43]">{s.value}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}