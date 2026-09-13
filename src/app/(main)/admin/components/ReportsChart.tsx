"use client";

const data = [
  { day: "1 Sep", reports: 95, violations: 18 },
  { day: "2", reports: 88, violations: 14 },
  { day: "3", reports: 105, violations: 24 },
  { day: "4", reports: 91, violations: 19 },
  { day: "5", reports: 112, violations: 28 },
  { day: "6", reports: 68, violations: 16 },
  { day: "7", reports: 98, violations: 25 },
  { day: "8", reports: 155, violations: 42 },
  { day: "9", reports: 132, violations: 36 },
  { day: "10", reports: 82, violations: 22 },
  { day: "11", reports: 101, violations: 29 },
  { day: "12", reports: 151, violations: 38 },
  { day: "13", reports: 91, violations: 27 },
  { day: "14", reports: 108, violations: 35 },
  { day: "15", reports: 143, violations: 58 },
];

export default function ReportsChart() {
  const chartHeight = 200;
  const chartWidth = 700;
  const maxValue = 200;

  const getX = (index: number) => {
    return 25 + (index / (data.length - 1)) * (chartWidth - 50);
  };

  const getY = (value: number) => {
    return chartHeight - (value / maxValue) * (chartHeight - 20);
  };

  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
      
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#102A43]">
            Reports Over Time
          </h2>

          <p className="mt-1 text-xs text-[#829AB1]">
            Report activity for the last 15 days
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1769AA]" />
            Reports
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
            Verified Violations
          </div>
        </div>
      </div>

      {/* Scatter Plot */}
      <div className="h-52 w-full overflow-hidden border-b border-l border-[#D9E2EC]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          {/* Horizontal grid lines */}
          {[0, 50, 100, 150, 200].map((value) => (
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

          {/* Reports - blue dots */}
          {data.map((item, index) => (
            <circle
              key={`report-${index}`}
              cx={getX(index) - 3}
              cy={getY(item.reports)}
              r="5"
              fill="#1769AA"
            />
          ))}

          {/* Verified Violations - red dots */}
          {data.map((item, index) => (
            <circle
              key={`violation-${index}`}
              cx={getX(index) + 3}
              cy={getY(item.violations)}
              r="5"
              fill="#DC2626"
            />
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="mt-3 flex justify-between px-1 text-[11px] text-[#829AB1]">
        <span>1 Sep</span>
        <span>5 Sep</span>
        <span>10 Sep</span>
        <span>15 Sep</span>
      </div>
    </div>
  );
}

// "use client";

// const data = [
//   { day: "1 Sep", reports: 95, violations: 18 },
//   { day: "2", reports: 88, violations: 14 },
//   { day: "3", reports: 105, violations: 24 },
//   { day: "4", reports: 91, violations: 19 },
//   { day: "5", reports: 112, violations: 28 },
//   { day: "6", reports: 68, violations: 16 },
//   { day: "7", reports: 98, violations: 25 },
//   { day: "8", reports: 155, violations: 42 },
//   { day: "9", reports: 132, violations: 36 },
//   { day: "10", reports: 82, violations: 22 },
//   { day: "11", reports: 101, violations: 29 },
//   { day: "12", reports: 151, violations: 38 },
//   { day: "13", reports: 91, violations: 27 },
//   { day: "14", reports: 108, violations: 35 },
//   { day: "15", reports: 143, violations: 58 },
// ];

// export default function ReportsChart() {
//   return (
//     <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
//       <div className="mb-5 flex items-center justify-between">
//         <div>
//           <h2 className="text-base font-bold text-[#102A43]">
//             Reports Over Time
//           </h2>
//           <p className="mt-1 text-xs text-[#829AB1]">
//             Report activity for the last 15 days
//           </p>
//         </div>

//         <div className="flex items-center gap-4 text-xs">
//           <div className="flex items-center gap-1.5">
//             <span className="h-2.5 w-2.5 rounded-full bg-[#1769AA]" />
//             Reports
//           </div>

//           <div className="flex items-center gap-1.5">
//             <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
//             Verified Violations
//           </div>
//         </div>
//       </div>

//       <div className="flex h-52 items-end gap-2 border-b border-l border-[#D9E2EC] px-3 pb-0 pt-4">
//         {data.map((item, index) => (
//           <div
//             key={index}
//             className="flex h-full flex-1 items-end justify-center gap-1"
//           >
//             <div
//               className="w-2 rounded-t bg-[#1769AA]"
//               style={{
//                 height: `${(item.reports / 200) * 100}%`,
//               }}
//             />

//             <div
//               className="w-2 rounded-t bg-[#DC2626]"
//               style={{
//                 height: `${(item.violations / 200) * 100}%`,
//               }}
//             />
//           </div>
//         ))}
//       </div>

//       <div className="mt-3 flex justify-between px-1 text-[11px] text-[#829AB1]">
//         <span>1 Sep</span>
//         <span>5 Sep</span>
//         <span>10 Sep</span>
//         <span>15 Sep</span>
//       </div>
//     </div>
//   );
// }