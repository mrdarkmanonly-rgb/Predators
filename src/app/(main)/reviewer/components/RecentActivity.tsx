"use client";

import React from "react";
import {
  History,
  Search,
  FileText,
  UserCheck,
  ArrowRightCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { MOCK_RECENT_ACTIVITY } from "../mock-data";

export default function RecentActivity() {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "REVIEW_START":
        return <Search className="w-3.5 h-3.5 text-[#1769AA]" />;
      case "NOTE_ADDED":
        return <FileText className="w-3.5 h-3.5 text-[#D97706]" />;
      case "ASSIGNMENT":
        return <UserCheck className="w-3.5 h-3.5 text-[#627D98]" />;
      case "FORWARDED":
        return <ArrowRightCircle className="w-3.5 h-3.5 text-[#0B1F33]" />;
      case "VERIFIED":
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#627D98]" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-[#D9E2EC] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EAF4FF] text-[#1769AA]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B1F33] tracking-tight">
              Live Reviewer Activity Log
            </h3>
            <p className="text-xs text-[#627D98]">
              Audit trail of recent system events and officer actions
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-[#16A34A] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          Live Feed
        </span>
      </div>

      <div className="divide-y divide-[#D9E2EC]/60">
        {MOCK_RECENT_ACTIVITY.map((act) => (
          <div key={act.id} className="py-2.5 flex items-start gap-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#D9E2EC] flex items-center justify-center shrink-0 mt-0.5">
              {getEventIcon(act.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#102A43]">{act.title}</span>
                <span className="text-[10px] text-[#9AA5B1] font-mono">
                  {act.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-[#627D98] mt-0.5">{act.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
