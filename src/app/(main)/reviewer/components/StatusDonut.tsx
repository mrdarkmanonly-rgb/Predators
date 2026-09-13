"use client";

import type { StatusSegment } from "@/lib/reviewer/get-reviewer-dashboard";

export default function StatusDonut({
  segments,
  total,
}: {
  segments: StatusSegment[];
  total: number;
}) {
  const size = 160;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  const safeTotal = total > 0 ? total : 1;
  let offset = 0;
  const arcs = segments.map((s) => {
    const dash = (s.value / safeTotal) * circ;
    const arc = { ...s, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[#102A43]">Reports by Status</h3>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#EAF4FF"
              strokeWidth={stroke}
            />
            {total > 0 &&
              arcs.map((arc, i) => (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
                  strokeDashoffset={-arc.offset}
                />
              ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#102A43]">{total}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#627D98]">
              Reports
            </span>
          </div>
        </div>

        <ul className="flex w-full flex-col gap-2.5">
          {segments.map((s) => (
            <li key={s.key} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span className="flex-1 text-[#102A43]">{s.label}</span>
              <span className="font-semibold text-[#102A43]">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}