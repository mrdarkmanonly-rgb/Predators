"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ScanLine,
  ClipboardList,
  Loader,
  CheckCircle2,
  AlertTriangle,
  Package,
  History,
  Bell,
  User,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "cn";
import { SIDEBAR_NAV } from "./data";

const ICONS = {
  dashboard: LayoutDashboard,
  scan: ScanLine,
  clipboard: ClipboardList,
  progress: Loader,
  check: CheckCircle2,
  alert: AlertTriangle,
  package: Package,
  history: History,
  bell: Bell,
  user: User,
  settings: Settings,
} as const;

export default function InspectorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#0B1F33] lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
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
            Inspector Panel
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {SIDEBAR_NAV.map((item) => {
            const Icon = ICONS[item.icon];
            const isActive =
              item.href === "/inspector"
                ? pathname === "/inspector"
                : pathname?.startsWith(item.href);

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#1769AA] text-white shadow-[0_6px_18px_rgba(23,105,170,0.35)]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#DC2626] text-white"
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer badge */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white">
              Consumer Protection
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