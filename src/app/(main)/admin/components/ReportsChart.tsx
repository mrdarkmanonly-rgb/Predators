"use client";

import type { TrendPoint } from "@/lib/admin/get-admin-dashboard";

export default function ReportsChart({ data }: { data: TrendPoint[] }) {
  const chartHeight = 200;
  const chartWidth = 700;

  const maxRaw = Math.max(
    1,
    ...data.map((d) => Math.max(d.reports, d.violations)),
  );
  // round up to a nice top
  const maxValue = Math.ceil(maxRaw / 20) * 20 || 20;

  const getX = (index: number) => {
    if (data.length <= 1) return chartWidth / 2;
    return 25 + (index / (data.length - 1)) * (chartWidth - 50);
  };
  const getY = (value: number) =>
    chartHeight - (value / maxValue) * (chartHeight - 20);

  // build 5 evenly-spaced gridlines
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((f) =>
    Math.round(maxValue * f),
  );

  const first = data[0]?.label ?? "";
  const last = data[data.length - 1]?.label ?? "";
  const mid = data[Math.floor(data.length / 2)]?.label ?? "";

  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#102A43]">
            Reports Over Time
          </h2>
          <p className="mt-1 text-xs text-[#829AB1]">
            Report activity for the last 15 days
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1769AA]" />
            Reports
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
            Violations Found
          </div>
        </div>
      </div>

      <div className="h-52 w-full overflow-hidden border-b border-l border-[#D9E2EC]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          {gridValues.map((value) => (
            <line
              key={value}
              x1="0"
              x2={chartWidth}
              y1={getY(value)}
              y2={getY(value)}
              stroke="#E6EDF3"
              strokeWidth="1"
            />
          ))}

          {data.map((item, index) => (
            <circle
              key={`r-${index}`}
              cx={getX(index) - 3}
              cy={getY(item.reports)}
              r="5"
              fill="#1769AA"
            />
          ))}

          {data.map((item, index) => (
            <circle
              key={`v-${index}`}
              cx={getX(index) + 3}
              cy={getY(item.violations)}
              r="5"
              fill="#DC2626"
            />
          ))}
        </svg>
      </div>

      <div className="mt-3 flex justify-between px-1 text-[11px] text-[#829AB1]">
        <span>{first}</span>
        <span>{mid}</span>
        <span>{last}</span>
      </div>
    </div>
  );
}