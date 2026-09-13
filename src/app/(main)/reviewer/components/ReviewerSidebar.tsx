"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  Package,
  BarChart3,
  Bell,
  User,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/reviewer",               label: "Dashboard",     icon: LayoutDashboard },
  { href: "/reviewer/reports",       label: "Reports",       icon: FileText },
  { href: "/reviewer/my-reviews",    label: "My Reviews",    icon: CheckCircle2 },
  { href: "/reviewer/products",      label: "Products",      icon: Package },
  { href: "/reviewer/analytics",     label: "Analytics",     icon: BarChart3 },
  { href: "/reviewer/notifications", label: "Notifications", icon: Bell },
  { href: "/reviewer/profile",       label: "Profile",       icon: User },
  { href: "/reviewer/settings",      label: "Settings",      icon: Settings },
];

export default function ReviewerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#0B1F33] text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5">
          <Image
            src="/images/logo.png"
            alt="CheckItRight"
            fill
            sizes="36px"
            className="object-contain"
          />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-white">
            CheckIt<span className="text-[#1769AA]">Right</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">
            Reviewer Panel
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/reviewer"
                ? pathname === "/reviewer"
                : pathname?.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#1769AA] text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white">
              Every report counts
            </span>
            <span className="text-[10px] leading-tight text-white/50">
              Fair Trade · A Stronger India
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}