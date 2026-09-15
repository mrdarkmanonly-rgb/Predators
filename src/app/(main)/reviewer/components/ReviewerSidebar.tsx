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
  ChevronLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./ReviewerShell";

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
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-[#0B1F33] text-white transition-[width] duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5">
          <Image
            src="/images/logo.png"
            alt="CheckItRight"
            fill
            sizes="36px"
            className="object-contain"
          />
        </span>
        <div
          className={cn(
            "flex flex-col leading-tight overflow-hidden transition-all duration-300",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
          )}
        >
          <span className="whitespace-nowrap text-sm font-bold text-white">
            CheckIt<span className="text-[#1769AA]">Right</span>
          </span>
          <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">
            Reviewer Panel
          </span>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto shrink-0 rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className={cn(
            "hidden shrink-0 rounded-lg p-1.5 text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white lg:flex",
            collapsed ? "ml-0 rotate-180" : "ml-auto rotate-0",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/reviewer"
                ? pathname === "/reviewer"
                : pathname?.startsWith(item.href);
            return (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#1769AA] text-white shadow-sm"
                      : "text-white/70 hover:bg-white/5 hover:text-white hover:translate-x-0.5",
                    collapsed && "justify-center px-0",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-white" />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      isActive && "scale-110",
                    )}
                  />
                  <span
                    className={cn(
                      "overflow-hidden whitespace-nowrap transition-all duration-300",
                      collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#0B1F33] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-150 group-hover:opacity-100">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl bg-white/5 p-3 transition-all duration-300",
            collapsed && "justify-center px-2",
          )}
        >
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
          <div
            className={cn(
              "flex flex-col gap-0.5 overflow-hidden transition-all duration-300",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            <span className="whitespace-nowrap text-xs font-semibold text-white">
              Every report counts
            </span>
            <span className="whitespace-nowrap text-[10px] leading-tight text-white/50">
              Fair Trade · A Stronger India
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}