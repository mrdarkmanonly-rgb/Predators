"use client";

import { Clock } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TODAY_SCHEDULE, type ScheduleStatus } from "./data";

/* Only official palette colors used.
   Assigned  → Trust Blue #1769AA on #EAF4FF
   In Progress / Pending → Amber #F59E0B (warning/pending) */
const STATUS_STYLES: Record<ScheduleStatus, string> = {
  Assigned: "bg-[#EAF4FF] text-[#1769AA] border-[#1769AA]/20",
  "In Progress": "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  Pending: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
};

export default function TodaysSchedule() {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-[#102A43]">
          Today&apos;s Schedule
        </CardTitle>
        <button
          type="button"
          className="text-xs font-semibold text-[#1769AA] hover:underline"
        >
          View all →
        </button>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {TODAY_SCHEDULE.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-[#D9E2EC] bg-[#F7FAFC] p-3 transition-colors hover:border-[#1769AA]/30 hover:bg-[#EAF4FF]/40"
          >
            <div className="flex w-16 shrink-0 flex-col items-center pt-0.5">
              <Clock className="h-3.5 w-3.5 text-[#627D98]" />
              <span className="mt-1 text-[10px] font-semibold text-[#627D98]">
                {item.time}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-xs font-bold text-[#1769AA]">{item.id}</span>
              <span className="text-sm font-semibold text-[#102A43]">
                {item.product}
              </span>
              <span className="text-[11px] text-[#627D98]">{item.shop}</span>
            </div>

            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                STATUS_STYLES[item.status]
              )}
            >
              {item.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}