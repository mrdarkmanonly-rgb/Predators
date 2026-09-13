"use client";

import React, { useState } from "react";
import {
  FileText,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  Eye,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRightCircle,
} from "lucide-react";
import { CitizenReportItem, PriorityLevel, ReportStatus } from "../types";

interface ReviewQueueProps {
  reports: CitizenReportItem[];
  onOpenReport: (report: CitizenReportItem) => void;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

export default function ReviewQueue({
  reports,
  onOpenReport,
  title = "Pending Review Workload Queue",
  subtitle = "Reports requiring triage, evidence validation, and disposition decisions",
  emptyMessage = "No reports found matching your selected search or filter criteria.",
}: ReviewQueueProps) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#F87171]/40">
            HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]/50">
            MEDIUM
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#E0F2FE] text-[#075985] border border-[#7DD3FC]/50">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "PENDING_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF4FF] text-[#1769AA] border border-[#1769AA]/30">
            <Eye className="w-3 h-3" /> Under Review
          </span>
        );
      case "NEED_MORE_INFORMATION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]">
            <HelpCircle className="w-3 h-3" /> Need More Info
          </span>
        );
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#991B1B] border border-[#F87171]">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case "FORWARDED_TO_INSPECTOR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0B1F33] text-white border border-[#1E3A5F]">
            <ArrowRightCircle className="w-3 h-3" /> Forwarded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F1F5F9] text-[#627D98] border border-[#D9E2EC]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-[#D9E2EC] overflow-hidden">
      {/* Table Card Header */}
      <div className="p-4 sm:p-5 border-b border-[#D9E2EC] flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0B1F33] tracking-tight">
              {title}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#EAF4FF] text-[#1769AA] text-xs font-bold border border-[#1769AA]/20">
              {reports.length} {reports.length === 1 ? "Report" : "Reports"}
            </span>
          </div>
          <p className="text-xs text-[#627D98] mt-0.5">{subtitle}</p>
        </div>

        {/* View mode toggle for desktop */}
        <div className="hidden sm:flex items-center gap-1 bg-[#F8FAFC] border border-[#D9E2EC] rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === "table"
                ? "bg-white text-[#102A43] shadow-2xs font-semibold"
                : "text-[#627D98] hover:text-[#102A43]"
            }`}
          >
            Table View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === "cards"
                ? "bg-white text-[#102A43] shadow-2xs font-semibold"
                : "text-[#627D98] hover:text-[#102A43]"
            }`}
          >
            Card View
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="p-12 text-center">
          <FileText className="w-10 h-10 text-[#627D98] mx-auto mb-3 opacity-40" />
          <h4 className="text-sm font-semibold text-[#102A43]">
            No reports in this view
          </h4>
          <p className="text-xs text-[#627D98] mt-1 max-w-sm mx-auto">
            {emptyMessage}
          </p>
        </div>
      ) : viewMode === "table" ? (
        /* DESKTOP TABLE VIEW */
        <div className="hidden lg:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-[#627D98] font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Product & Brand</th>
                <th className="py-3 px-4">Legal Metrology Issue</th>
                <th className="py-3 px-4">Shop & Location</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Evidence</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]/70">
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-[#F8FAFC] transition-colors group"
                >
                  {/* Report ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1769AA] whitespace-nowrap">
                    {report.reportNumber}
                  </td>

                  {/* Product */}
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#102A43] max-w-[180px] truncate" title={report.productSnapshot.productName}>
                      {report.productSnapshot.productName}
                    </p>
                    <span className="text-[10px] text-[#627D98] block">
                      {report.productSnapshot.category}
                    </span>
                  </td>

                  {/* Issue */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#DC2626] block max-w-[170px] truncate" title={report.issueLabel}>
                      {report.issueLabel}
                    </span>
                  </td>

                  {/* Location & Shop */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-[#102A43] font-medium">
                      <MapPin className="w-3 h-3 text-[#627D98] shrink-0" />
                      <span>{report.shopCity}</span>
                    </div>
                    <span className="text-[10px] text-[#627D98] block truncate max-w-[140px]">
                      {report.shopName}
                    </span>
                  </td>

                  {/* Submitted Date/Time */}
                  <td className="py-3.5 px-4 text-[#627D98] whitespace-nowrap">
                    <div className="font-mono text-[11px]">
                      {new Date(report.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-[10px]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Priority Badge */}
                  <td className="py-3.5 px-4 text-center">
                    {getPriorityBadge(report.priority)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(report.status)}
                  </td>

                  {/* Evidence Thumbnails */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 bg-[#F1F5F9] px-2 py-1 rounded-md text-[11px] font-semibold text-[#334155] border border-[#D9E2EC]">
                      <Layers className="w-3 h-3 text-[#1769AA]" />
                      <span>{report.evidence.length}</span>
                    </div>
                  </td>

                  {/* Assigned Reviewer */}
                  <td className="py-3.5 px-4 text-[#627D98] whitespace-nowrap">
                    <span className="text-[11px] font-medium text-[#102A43]">
                      {report.assignedReviewerName ? (
                        report.assignedReviewerName.includes("You") ? (
                          <span className="font-bold text-[#1769AA]">Assigned to You</span>
                        ) : (
                          report.assignedReviewerName
                        )
                      ) : (
                        <span className="italic text-[#9AA5B1]">Unassigned</span>
                      )}
                    </span>
                  </td>

                  {/* Action [ Review ] */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenReport(report)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1769AA] text-white hover:bg-[#0B1F33] shadow-xs transition-colors"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* MOBILE / RESPONSIVE CARD VIEW (Shown on small screens, or when card view toggled) */}
      <div className={`p-4 space-y-3 ${viewMode === "table" ? "block lg:hidden" : "block"}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-[#D9E2EC] p-4 shadow-2xs hover:shadow-sm transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#D9E2EC]/60">
                  <span className="font-mono font-bold text-xs text-[#1769AA]">
                    {report.reportNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getPriorityBadge(report.priority)}
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <h4 className="text-xs font-bold text-[#102A43] line-clamp-1">
                    {report.productSnapshot.productName}
                  </h4>
                  <p className="text-xs font-semibold text-[#DC2626]">
                    {report.issueLabel}
                  </p>
                  <p className="text-[11px] text-[#627D98] line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#D9E2EC]/50 space-y-1.5 text-xs text-[#627D98]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[#102A43] font-medium">
                      <MapPin className="w-3 h-3 text-[#627D98]" />
                      {report.shopCity}, {report.shopState}
                    </span>
                    <span className="text-[10px] text-[#9AA5B1]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="truncate max-w-[160px]">{report.shopName}</span>
                    <span className="inline-flex items-center gap-1 bg-[#F1F5F9] px-1.5 py-0.2 rounded text-[10px] font-semibold text-[#334155]">
                      <Layers className="w-2.5 h-2.5 text-[#1769AA]" /> {report.evidence.length} Files
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D9E2EC]/60 flex items-center justify-between">
                <div>{getStatusBadge(report.status)}</div>
                <button
                  type="button"
                  onClick={() => onOpenReport(report)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1769AA] text-white hover:bg-[#0B1F33] shadow-xs transition-colors"
                >
                  <span>Review</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
