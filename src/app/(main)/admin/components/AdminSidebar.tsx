"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  ClipboardCheck,
  BarChart3,
  ScrollText,
  Settings,
  ShieldCheck,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard",   href: "/admin",             icon: LayoutDashboard },
  { name: "Users",       href: "/admin/users",       icon: Users },
  { name: "Reports",     href: "/admin/reports",     icon: FileText },
  { name: "Products",    href: "/admin/products",    icon: Package },
  { name: "Inspections", href: "/admin/inspections", icon: ClipboardCheck },
  { name: "Analytics",   href: "/admin/analytics",   icon: BarChart3 },
  { name: "Audit Logs",  href: "/admin/audit-logs",  icon: ScrollText },
  { name: "Settings",    href: "/admin/settings",    icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#0B1F33] text-white">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1769AA]">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-lg font-semibold">CheckItRight</h1>
          <p className="text-xs text-slate-300">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1769AA] text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom information */}
      <div className="m-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-300" />
          <span className="text-sm font-medium">Fair Markets</span>
        </div>
        <p className="text-xs leading-5 text-slate-300">
          Stronger Consumers
          <br />
          A More Trustworthy India.
        </p>
      </div>
    </aside>
  );
}