"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ScanLine,
  ClipboardList,
  Bell,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home",          href: "/inspector",           Icon: Home },
  { label: "Scan",          href: "/scan",                Icon: ScanLine },
  { label: "Available",     href: "/inspector/available", Icon: ClipboardList },
  { label: "Notifications", href: "/inspector/notifications", Icon: Bell },
  { label: "More",          href: "/inspector/settings",  Icon: MoreHorizontal },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#D9E2EC] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="grid grid-cols-5">
        {TABS.map(({ label, href, Icon }) => {
          const isActive =
            href === "/inspector"
              ? pathname === "/inspector"
              : pathname?.startsWith(href);

          return (
            <li key={label}>
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-[#1769AA]" : "text-[#627D98]",
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" />
                </span>
                <span>{label}</span>
                {isActive ? (
                  <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-[#1769AA]" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}