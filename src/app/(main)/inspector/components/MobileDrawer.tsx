"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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

export default function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#0B1F33]/50 lg:hidden"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0B1F33] lg:hidden"
          >
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
              <div className="flex items-center gap-2.5">
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

              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
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
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[#1769AA] text-white"
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}