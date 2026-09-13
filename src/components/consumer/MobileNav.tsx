"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  ScanLine,
  FileText,
  Package,
  MoreHorizontal,
} from "lucide-react";

const items = [
  { href: "/consumer",          label: "Home",     icon: Home },
  { href: "/scan",              label: "Scan",     icon: ScanLine, highlight: true },
  { href: "/consumer/reports",  label: "Reports",  icon: FileText },
  { href: "/consumer/products", label: "Products", icon: Package },
  { href: "/consumer/settings", label: "More",     icon: MoreHorizontal },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#D9E2EC] px-2 py-2">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/consumer" &&
              item.href !== "/scan" &&
              pathname.startsWith(item.href + "/"));

          const Icon = item.icon;
          if (item.highlight) {
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 -mt-6 rounded-full bg-[#1769AA] flex items-center justify-center shadow-lg shadow-[#1769AA]/30"
                >
                  <Icon className="w-5 h-5 text-white" />
                </motion.div>
              </Link>
            );
          }
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg ${
                  isActive ? "text-[#1769AA]" : "text-[#627D98]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}