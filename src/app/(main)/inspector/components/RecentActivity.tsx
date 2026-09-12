"use client";

import { CheckCircle2, Upload, FilePlus2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RECENT_ACTIVITY, type ActivityTone } from "./data";

const TONE_STYLES: Record<ActivityTone, { bg: string; icon: string; Icon: typeof CheckCircle2 }> = {
  green: { bg: "bg-[#DCFCE7]", icon: "text-[#16A34A]", Icon: CheckCircle2 },
  blue: { bg: "bg-[#EAF4FF]", icon: "text-[#1769AA]", Icon: Upload },
  amber: { bg: "bg-[#FEF3C7]", icon: "text-[#B45309]", Icon: FilePlus2 },
};

export default function RecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-[#102A43]">
          Recent Activity
        </CardTitle>
        <button
          type="button"
          className="text-xs font-semibold text-[#1769AA] hover:underline"
        >
          View all →
        </button>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {RECENT_ACTIVITY.map((item) => {
          const { bg, icon, Icon } = TONE_STYLES[item.tone];
          return (
            <div key={item.id} className="flex items-start gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}
              >
                <Icon className={`h-3.5 w-3.5 ${icon}`} />
              </span>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-xs font-semibold text-[#102A43]">
                  {item.title}
                </span>
                <span className="text-[11px] text-[#627D98]">{item.detail}</span>
              </div>
              <span className="shrink-0 text-[10px] text-[#627D98]">
                {item.time}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}