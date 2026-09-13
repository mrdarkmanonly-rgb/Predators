"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine, ClipboardList, History } from "lucide-react";

const ACTIONS = [
  {
    href: "/scan",
    label: "Scan Product",
    hint: "Scan and verify product on-site",
    Icon: ScanLine,
  },
  {
    href: "/inspector/available",
    label: "Available Cases",
    hint: "View and claim forwarded cases",
    Icon: ClipboardList,
  },
  {
    href: "/inspector/history",
    label: "Inspection History",
    hint: "View completed inspections",
    Icon: History,
  },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-[#102A43]">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ACTIONS.map(({ href, label, hint, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-3 rounded-xl border border-[#D9E2EC] p-4 transition hover:border-[#1769AA]/40 hover:bg-[#EAF4FF]/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF4FF]">
              <Icon className="h-4 w-4 text-[#1769AA]" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#102A43]">{label}</p>
              <p className="mt-0.5 text-[11px] text-[#627D98]">{hint}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}