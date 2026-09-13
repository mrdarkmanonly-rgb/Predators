"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TodaysSchedule() {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-[#102A43]">
          Today&apos;s Schedule
        </CardTitle>
      </CardHeader>

      <CardContent className="flex items-center justify-center py-10">
        <p className="text-center text-xs text-[#627D98]">
          No inspections scheduled for today.
        </p>
      </CardContent>
    </Card>
  );
}