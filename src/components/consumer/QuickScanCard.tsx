"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Upload, Barcode, ScanLine } from "lucide-react";

export default function QuickScanCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="bg-white rounded-2xl border border-[#D9E2EC] p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#102A43]">Quick Scan</h2>
          <p className="text-sm text-[#627D98] mt-0.5">
            Scan a product barcode or label to check its compliance.
          </p>
        </div>
      </div>

      <Link href="/user/scan">
        <motion.button
          whileHover={{
            scale: 1.02,
            boxShadow: "0 12px 32px rgba(23,105,170,0.3)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-full flex items-center justify-center gap-2 bg-[#1769AA] text-white rounded-xl py-3.5 font-semibold text-sm shadow-lg shadow-[#1769AA]/20"
        >
          <ScanLine className="w-4.5 h-4.5" />
          Scan Product
        </motion.button>
      </Link>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {[
          { icon: Camera, label: "Use Camera" },
          { icon: Upload, label: "Upload Images" },
          { icon: Barcode, label: "Enter Barcode" },
        ].map((opt, i) => (
          <motion.button
            key={opt.label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-[#D9E2EC] hover:border-[#1769AA]/40 hover:bg-[#EAF4FF]/40 transition"
          >
            <opt.icon className="w-4 h-4 text-[#1769AA]" />
            <span className="text-[11px] font-medium text-[#627D98]">
              {opt.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
