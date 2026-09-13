"use client";

import Link from "next/link";
import { ScanLine } from "lucide-react";

export default function MobileScanCTA() {
  return (
    <Link
      href="/scan"
      className="flex items-center justify-center gap-2 rounded-xl bg-[#1769AA] px-4 py-3.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(23,105,170,0.25)] transition-colors active:bg-[#0B1F33] lg:hidden"
    >
      <ScanLine className="h-5 w-5" />
      Scan Product
    </Link>
  );
}