"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRightCircle,
  HelpCircle,
  FileCheck,
  User,
} from "lucide-react";
import { TimelineEvent } from "../types";

interface ReviewTimelineProps {
  timeline: TimelineEvent[];
}

export default function ReviewTimeline({ timeline }: ReviewTimelineProps) {
  const getActionIcon = (action: string) => {
    if (action.includes("Submitted")) {
      return <FileCheck className="w-3.5 h-3.5 text-[#1769AA]" />;
    }
    if (action.includes("Assigned")) {
      return <User className="w-3.5 h-3.5 text-[#627D98]" />;
    }
    if (action.includes("Verified")) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />;
    }
    if (action.includes("Rejected")) {
      return <AlertCircle className="w-3.5 h-3.5 text-[#DC2626]" />;
    }
    if (action.includes("Forwarded")) {
      return <ArrowRightCircle className="w-3.5 h-3.5 text-[#0B1F33]" />;
    }
    if (action.includes("Information")) {
      return <HelpCircle className="w-3.5 h-3.5 text-[#F59E0B]" />;
    }
    return <Clock className="w-3.5 h-3.5 text-[#627D98]" />;
  };

  return (
    <div className="bg-white rounded-xl border border-[#D9E2EC] p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-2.5">
        <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#1769AA]" />
          Review & Audit History Timeline
        </h4>
        <span className="text-[10px] text-[#627D98] font-mono">
          Immutable Log
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D9E2EC]">
        {timeline.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-[#1769AA] flex items-center justify-center shadow-xs">
              {getActionIcon(event.action)}
            </div>

            <div className="bg-[#F8FAFC] rounded-lg p-2.5 border border-[#D9E2EC]/70 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="font-semibold text-[#102A43]">
                  {event.action}
                </span>
                <span className="text-[10px] font-mono text-[#627D98]">
                  {new Date(event.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" • "}
                  {new Date(event.timestamp).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#627D98] mt-1">
                <span className="font-medium text-[#0B1F33]">
                  By: {event.actor} ({event.actorRole})
                </span>
                {event.previousStatus && event.newStatus && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-white border border-[#D9E2EC] text-[10px] font-mono">
                    <span>{event.previousStatus}</span>
                    <span>→</span>
                    <span className="font-bold text-[#1769AA]">{event.newStatus}</span>
                  </span>
                )}
              </div>

              {event.details && (
                <p className="text-[11px] text-[#486581] mt-1.5 bg-white p-1.5 rounded border border-[#E2E8F0]">
                  {event.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
