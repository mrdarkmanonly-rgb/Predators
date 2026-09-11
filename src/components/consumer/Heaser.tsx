"use client";

import { motion } from "framer-motion";
import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 bg-[#F7FAFC]/80 backdrop-blur-lg border-b border-[#D9E2EC] px-4 lg:px-8 py-3 flex items-center gap-4"
    >
      <div className="flex-1 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#627D98]" />
        <input
          placeholder="Search products, scans, reports..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#D9E2EC] text-sm text-[#102A43] placeholder:text-[#627D98] focus:outline-none focus:ring-2 focus:ring-[#1769AA]/30 focus:border-[#1769AA] transition"
        />
      </div>

      <button className="relative p-2 rounded-xl hover:bg-white transition">
        <Bell className="w-5 h-5 text-[#102A43]" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full" />
      </button>

      <div className="flex items-center gap-3 pl-3 border-l border-[#D9E2EC]">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1769AA] to-[#0B1F33] flex items-center justify-center text-white text-sm font-semibold">
          HK
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-[#102A43] leading-tight">
            Harsika Kumari
          </p>
          <p className="text-xs text-[#627D98]">Consumer</p>
        </div>
      </div>
    </motion.header>
  );
}
