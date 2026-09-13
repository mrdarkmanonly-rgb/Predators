"use client";

const issues = [
  {
    name: "Incorrect Weight",
    percentage: 35,
    color: "#1769AA",
  },
  {
    name: "Misleading Label",
    percentage: 22,
    color: "#16A34A",
  },
  {
    name: "Expired Product",
    percentage: 18,
    color: "#F59E0B",
  },
  {
    name: "Price Mismatch",
    percentage: 15,
    color: "#DC2626",
  },
  {
    name: "Other",
    percentage: 10,
    color: "#94A3B8",
  },
];

export default function IssueTypeChart() {
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

      <div className="mt-5 flex items-center justify-center gap-8">
        <div
          className="relative flex h-40 w-40 items-center justify-center rounded-full"
          style={{
            background:
              "conic-gradient(#1769AA 0% 35%, #16A34A 35% 57%, #F59E0B 57% 75%, #DC2626 75% 90%, #94A3B8 90% 100%)",
          }}
        >
          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
            <span className="text-xl font-bold text-[#102A43]">
              3,821
            </span>
            <span className="text-xs text-[#627D98]">
              Reports
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.name}
              className="flex items-center justify-between gap-5 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: issue.color }}
                />

                <span className="text-[#486581]">
                  {issue.name}
                </span>
              </div>

              <span className="font-semibold text-[#102A43]">
                {issue.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
