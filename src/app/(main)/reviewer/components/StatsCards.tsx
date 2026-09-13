"use client";

import React from "react";
import {
  Clock,
  UserCheck,
  ClipboardList,
  Timer,
  HelpCircle,
  ArrowRightCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ReviewerStats } from "../types";

interface StatsCardsProps {
  stats: ReviewerStats;
  selectedStatusTab?: string;
  onFilterByStatus?: (status: string) => void;
}

export default function StatsCards({
  stats,
  selectedStatusTab,
  onFilterByStatus,
}: StatsCardsProps) {
  const cards = [
    {
      id: "pending",
      title: "Pending Reviews",
      value: stats.pendingReviews,
      unit: "",
      subtitle: "Awaiting triage",
      icon: Clock,
      statusKey: "PENDING_REVIEW",
      theme: "urgent", // red accent
      borderColor: "border-l-4 border-l-[#DC2626]",
      textColor: "text-[#DC2626]",
      bgColor: "bg-white",
      badge: "+4 new today",
      badgeClass: "bg-[#FEE2E2] text-[#991B1B]",
    },
    {
      id: "assigned",
      title: "Assigned to Me",
      value: stats.assignedToMe,
      unit: "",
      subtitle: "My active queue",
      icon: ClipboardList,
      statusKey: "ASSIGNED_TO_ME",
      theme: "trust", // blue accent
      borderColor: "border-l-4 border-l-[#1769AA]",
      textColor: "text-[#1769AA]",
      bgColor: "bg-white",
      badge: "High focus",
      badgeClass: "bg-[#EAF4FF] text-[#1769AA]",
    },
    {
      id: "reviewed_by_me",
      title: "Reviewed by Me",
      value: stats.reviewedByMe,
      unit: "",
      subtitle: "This calendar month",
      icon: UserCheck,
      statusKey: "ALL",
      theme: "navy",
      borderColor: "border-l-4 border-l-[#0B1F33]",
      textColor: "text-[#0B1F33]",
      bgColor: "bg-white",
      badge: "Target: 50",
      badgeClass: "bg-[#F1F5F9] text-[#334155]",
    },
    {
      id: "avg_time",
      title: "Average Review Time",
      value: stats.averageReviewTimeMinutes,
      unit: "min",
      subtitle: "Per report review",
      icon: Timer,
      statusKey: "",
      theme: "neutral",
      borderColor: "border-l-4 border-l-[#627D98]",
      textColor: "text-[#102A43]",
      bgColor: "bg-white",
      badge: "-2m vs last wk",
      badgeClass: "bg-[#F0FDF4] text-[#166534]",
    },
    {
      id: "need_info",
      title: "Need More Information",
      value: stats.needMoreInformation,
      unit: "",
      subtitle: "Clarification queried",
      icon: HelpCircle,
      statusKey: "NEED_MORE_INFORMATION",
      theme: "amber",
      borderColor: "border-l-4 border-l-[#F59E0B]",
      textColor: "text-[#D97706]",
      bgColor: "bg-white",
      badge: "Citizen reply pending",
      badgeClass: "bg-[#FEF3C7] text-[#92400E]",
    },
    {
      id: "forwarded",
      title: "Forwarded to Inspection",
      value: stats.forwardedToInspection,
      unit: "",
      subtitle: "For physical seizure",
      icon: ArrowRightCircle,
      statusKey: "FORWARDED_TO_INSPECTOR",
      theme: "navy",
      borderColor: "border-l-4 border-l-[#0B1F33]",
      textColor: "text-[#0B1F33]",
      bgColor: "bg-white",
      badge: "Field action",
      badgeClass: "bg-[#EAF4FF] text-[#075985]",
    },
    {
      id: "verified",
      title: "Verified Reports",
      value: stats.verifiedReports,
      unit: "",
      subtitle: "Violation established",
      icon: CheckCircle2,
      statusKey: "VERIFIED",
      theme: "green",
      borderColor: "border-l-4 border-l-[#16A34A]",
      textColor: "text-[#16A34A]",
      bgColor: "bg-white",
      badge: "84% success rate",
      badgeClass: "bg-[#DCFCE7] text-[#166534]",
    },
    {
      id: "rejected",
      title: "Rejected Reports",
      value: stats.rejectedReports,
      unit: "",
      subtitle: "Frivolous / blurry",
      icon: XCircle,
      statusKey: "REJECTED",
      theme: "red",
      borderColor: "border-l-4 border-l-[#9CA3AF]",
      textColor: "text-[#6B7280]",
      bgColor: "bg-white",
      badge: "With justification",
      badgeClass: "bg-[#F3F4F6] text-[#4B5563]",
    },
  ];

  return (
    <section aria-label="Reviewer Workload Statistics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedStatusTab === card.statusKey && card.statusKey !== "";
          return (
            <div
              key={card.id}
              onClick={() => {
                if (card.statusKey && onFilterByStatus) {
                  onFilterByStatus(card.statusKey);
                }
              }}
              className={`rounded-xl p-4 bg-white shadow-2xs border border-[#D9E2EC] ${card.borderColor} transition-all duration-150 ${
                card.statusKey ? "cursor-pointer hover:shadow-sm hover:-translate-y-0.5" : ""
              } ${isSelected ? "ring-2 ring-[#1769AA] ring-offset-1 bg-[#F8FAFC]" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#627D98] tracking-tight">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${card.textColor}`}>
                      {card.value}
                    </span>
                    {card.unit && (
                      <span className="text-xs font-semibold text-[#627D98]">
                        {card.unit}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#F7FAFC] border border-[#D9E2EC]/60 text-[#627D98]">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#D9E2EC]/50 text-xs">
                <span className="text-[#627D98] truncate">{card.subtitle}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${card.badgeClass}`}>
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
