"use client";

import {
  Scale,
  Tag,
  CalendarX,
  IndianRupee,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ViolationTypeCount } from "@/lib/inspector/get-inspector-dashboard";

const ICONS = [Scale, Tag, CalendarX, IndianRupee, HelpCircle];

export default function InspectionsByIssueType({
  data,
}: {
  data: ViolationTypeCount[];
}) {
  const max = data.length > 0 ? Math.max(...data.map((i) => i.value)) : 1;

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-[#102A43]">
          Inspections by Issue Type
        </CardTitle>
        <button
          type="button"
          className="text-xs font-semibold text-[#1769AA] hover:underline"
        >
          View all →
        </button>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {data.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#627D98]">
            No violations recorded yet.
          </p>
        ) : (
          data.map((item, i) => {
            const Icon = ICONS[i] ?? HelpCircle;
            const pct = Math.round((item.value / max) * 100);
            return (
              <div key={item.label} className="flex items-center gap-3">
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#627D98]" />
                <span className="w-32 shrink-0 text-[11px] font-medium text-[#102A43]">
                  {item.label}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#EAF4FF]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: item.color }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-[11px] font-bold text-[#102A43]">
                  {item.value}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}