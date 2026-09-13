"use client";

import type { IssueType } from "@/lib/admin/get-admin-dashboard";

export default function IssueTypeChart({
  data,
  total,
}: {
  data: IssueType[];
  total: number;
}) {
  // build conic-gradient stops from real percentages
  let cursor = 0;
  const stops: string[] = [];
  for (const item of data) {
    const start = cursor;
    const end = cursor + item.percentage;
    stops.push(`${item.color} ${start}% ${end}%`);
    cursor = end;
  }
  // if percentages don't sum to 100, pad with a neutral gray
  if (cursor < 100) {
    stops.push(`#E6EDF3 ${cursor}% 100%`);
  }

  const background =
    stops.length > 0
      ? `conic-gradient(${stops.join(", ")})`
      : "conic-gradient(#E6EDF3 0% 100%)";

  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-[#102A43]">
          Reports by Issue Type
        </h2>
        <p className="mt-1 text-xs text-[#829AB1]">
          Distribution of citizen reports
        </p>
      </div>

      {data.length === 0 ? (
        <div className="mt-5 flex h-40 items-center justify-center">
          <p className="text-xs text-[#829AB1]">No reports yet.</p>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-center gap-8">
          <div
            className="relative flex h-40 w-40 items-center justify-center rounded-full"
            style={{ background }}
          >
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
              <span className="text-xl font-bold text-[#102A43]">
                {total.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-[#627D98]">Reports</span>
            </div>
          </div>

          <div className="space-y-3">
            {data.slice(0, 5).map((issue) => (
              <div
                key={issue.name}
                className="flex items-center justify-between gap-5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: issue.color }}
                  />
                  <span className="text-[#486581]">{issue.name}</span>
                </div>
                <span className="font-semibold text-[#102A43]">
                  {issue.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}