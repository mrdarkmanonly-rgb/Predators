"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ScanLine,
  FileSearch,
  FileText,
  Package,
  Bell,
  User,
  Settings,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { href: "/user", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/scan", label: "Scan Product", icon: ScanLine },
  { href: "/user/scans", label: "My Scans", icon: FileSearch },
  { href: "/user/reports", label: "My Reports", icon: FileText },
  { href: "/user/products", label: "Products", icon: Package },
  { href: "/user/notifications", label: "Notifications", icon: Bell },
  { href: "/user/profile", label: "Profile", icon: User },
  { href: "/user/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-[#0B1F33] text-white px-4 py-6">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-9 h-9 rounded-xl bg-[#1769AA] flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">CheckItRight</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-[#1769AA] rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <motion.div
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative z-10 flex items-center gap-3"
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-6 px-3 pt-4 border-t border-white/10 text-xs text-white/60 space-y-1">
        <p>Consumer Protection</p>
        <p>Fair Trade</p>
        <p>A Stronger India</p>
      </div>
    </aside>
  );
}
