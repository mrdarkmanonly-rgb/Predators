"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRightCircle,
  ChevronRight,
} from "lucide-react";
import { MOCK_RECENT_REVIEWS } from "../mock-data";

interface RecentReviewsProps {
  onOpenReportById?: (reportId: string) => void;
}

export default function RecentReviews({ onOpenReportById }: RecentReviewsProps) {
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#F87171]">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case "FORWARDED_TO_INSPECTOR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B1F33] text-white border border-[#1E3A5F]">
            <ArrowRightCircle className="w-3 h-3" /> Forwarded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-[#D9E2EC] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
        <div>
          <h3 className="text-sm font-bold text-[#0B1F33] tracking-tight">
            Recent Review Determinations
          </h3>
          <p className="text-xs text-[#627D98]">
            Recently closed or forwarded reports from your workstation
          </p>
        </div>
        <span className="text-xs font-semibold text-[#1769AA] hover:underline cursor-pointer">
          View Complete History
        </span>
      </div>

      <div className="divide-y divide-[#D9E2EC]/70">
        {MOCK_RECENT_REVIEWS.map((rev) => (
          <div
            key={rev.id}
            onClick={() => onOpenReportById && onOpenReportById(rev.id)}
            className="py-3 group hover:bg-[#F8FAFC] px-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between flex-wrap gap-2"
          >
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-xs text-[#1769AA]">
                  {rev.reportNumber}
                </span>
                <span className="text-xs font-semibold text-[#102A43]">
                  {rev.productName}
                </span>
                {getOutcomeBadge(rev.outcome)}
              </div>
              <p className="text-[11px] text-[#627D98] line-clamp-1">
                {rev.reasonSnippet}
              </p>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div className="text-[11px] text-[#627D98]">
                <span className="block font-medium text-[#102A43]">
                  {rev.reviewerName}
                </span>
                <span className="text-[10px] text-[#9AA5B1]">{rev.reviewedAt}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#D9E2EC] group-hover:text-[#1769AA] group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
