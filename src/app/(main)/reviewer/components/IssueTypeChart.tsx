"use client";

import React from "react";
import { BarChart2 } from "lucide-react";
import { MOCK_ISSUE_TYPE_DISTRIBUTION } from "../mock-data";

interface IssueTypeChartProps {
  onSelectIssue?: (issueType: string) => void;
}

export default function IssueTypeChart({ onSelectIssue }: IssueTypeChartProps) {
  const totalViolations = MOCK_ISSUE_TYPE_DISTRIBUTION.reduce(
    (acc, curr) => acc + curr.count,
    0
  );

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-[#D9E2EC] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EAF4FF] text-[#1769AA]">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B1F33] tracking-tight">
              Reports by Legal Metrology Issue Type
            </h3>
            <p className="text-xs text-[#627D98]">
              Distribution of non-compliance allegations across active reports
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#0B1F33] bg-[#F1F5F9] px-2.5 py-1 rounded-md border border-[#D9E2EC]">
          Total: {totalViolations} Cases
        </span>
      </div>

      {/* Progress Bar Breakdown */}
      <div className="space-y-3">
        {MOCK_ISSUE_TYPE_DISTRIBUTION.map((item) => (
          <div
            key={item.issueType}
            onClick={() => onSelectIssue && onSelectIssue(item.issueType)}
            className="space-y-1.5 cursor-pointer group hover:bg-[#F8FAFC] p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#102A43] group-hover:text-[#1769AA] transition-colors flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <div className="flex items-center gap-2 text-[#627D98]">
                <span className="font-bold text-[#102A43]">{item.count}</span>
                <span className="font-mono text-[11px]">({item.percentage}%)</span>
              </div>
            </div>

            {/* Visual CSS Meter Bar */}
            <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#D9E2EC]/60 text-[11px] text-[#627D98] flex items-center justify-between">
        <span>Click any category to filter the review queue</span>
        <span className="text-[#1769AA] font-medium">PCR 2011 Rules 6 & 18</span>
      </div>
    </div>
  );
}
