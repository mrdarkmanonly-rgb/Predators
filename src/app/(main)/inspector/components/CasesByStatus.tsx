"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CASES_BY_STATUS } from "./data";

export default function CasesByStatus() {
  const { total, segments } = CASES_BY_STATUS;

  // Build SVG donut
  const size = 140;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const fraction = seg.value / total;
    const dash = fraction * circumference;
    const arc = { ...seg, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-[#102A43]">
          Cases by Status
        </CardTitle>
        <button
          type="button"
          className="text-xs font-semibold text-[#1769AA] hover:underline"
        >
          View all →
        </button>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
        {/* Donut */}
        <div className="relative shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#EAF4FF"
              strokeWidth={stroke}
            />
            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={stroke}
                strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
                strokeDashoffset={-arc.offset}
                strokeLinecap="butt"
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#102A43]">{total}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#627D98]">
              Total Cases
            </span>
          </div>
        </div>

        {/* Legend */}
        <ul className="flex w-full flex-col gap-2">
          {segments.map((seg) => (
            <li key={seg.label} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: seg.color }}
              />
              <span className="flex-1 text-[#102A43]">{seg.label}</span>
              <span className="font-semibold text-[#102A43]">{seg.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}