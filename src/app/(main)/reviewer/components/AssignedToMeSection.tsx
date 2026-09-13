"use client";

import React from "react";
import {
  ClipboardList,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { CitizenReportItem } from "../types";

interface AssignedToMeSectionProps {
  reports: CitizenReportItem[];
  onOpenReport: (report: CitizenReportItem) => void;
}

export default function AssignedToMeSection({
  reports,
  onOpenReport,
}: AssignedToMeSectionProps) {
  const assignedReports = reports.filter(
    (r) => r.assignedReviewerId === "rev-current"
  );

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-[#D9E2EC] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EAF4FF] text-[#1769AA]">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B1F33] tracking-tight">
              Reports Assigned to Me
            </h3>
            <p className="text-xs text-[#627D98]">
              Your dedicated active triage caseload awaiting your decision
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#1769AA] text-white">
          {assignedReports.length} Assigned
        </span>
      </div>

      {assignedReports.length === 0 ? (
        <div className="p-6 text-center text-xs text-[#627D98]">
          No reports currently assigned to you. Select a report from the Pending Queue to self-assign.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {assignedReports.map((report) => (
            <div
              key={report.id}
              className="bg-[#F8FAFC] rounded-xl border border-[#D9E2EC] p-3.5 hover:border-[#1769AA] hover:bg-white transition-all space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#1769AA]">
                    {report.reportNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      report.priority === "HIGH"
                        ? "bg-[#FEE2E2] text-[#991B1B]"
                        : "bg-[#FEF3C7] text-[#92400E]"
                    }`}
                  >
                    {report.priority}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#102A43] mt-1 line-clamp-1">
                  {report.productSnapshot.productName}
                </h4>
                <p className="text-xs font-semibold text-[#DC2626]">
                  {report.issueLabel}
                </p>
                <p className="text-[11px] text-[#627D98] line-clamp-2 mt-0.5">
                  {report.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#D9E2EC]/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#627D98] flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {report.shopCity}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenReport(report)}
                  className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#1769AA] text-white hover:bg-[#0B1F33] transition-colors flex items-center gap-1"
                >
                  <span>Review</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
