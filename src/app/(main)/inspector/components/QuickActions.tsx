"use client";

import Link from "next/link";
import { ScanLine, ClipboardList, History, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ACTIONS = [
  { id: "scan", label: "Scan Product", hint: "Scan and verify product on-site", href: "/inspector/scan", Icon: ScanLine },
  { id: "cases", label: "My Assigned Cases", hint: "View and manage your cases", href: "/inspector/cases/assigned", Icon: ClipboardList },
  { id: "history", label: "Inspection History", hint: "View completed inspections", href: "/inspector/history", Icon: History },
  { id: "nearby", label: "Nearby Cases", hint: "Find cases in your area", href: "/inspector/cases/assigned", Icon: MapPin },
];

export default function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-0">
        <CardTitle className="text-sm font-semibold text-[#102A43]">
          Quick Actions
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-2.5">
        {ACTIONS.map(({ id, label, hint, href, Icon }) => (
          <Link
            key={id}
            href={href}
            className="group flex flex-col gap-1.5 rounded-xl border border-[#D9E2EC] bg-[#F7FAFC] p-3 transition-all hover:-translate-y-0.5 hover:border-[#1769AA]/30 hover:bg-[#EAF4FF] hover:shadow-[0_6px_18px_rgba(23,105,170,0.08)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#1769AA] shadow-sm transition-colors group-hover:bg-[#1769AA] group-hover:text-white">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold text-[#102A43]">{label}</span>
            <span className="text-[10px] leading-tight text-[#627D98]">
              {hint}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}