"use client";

import { motion } from "framer-motion";
import ScanItem from "./ScanItem";
import type { DashboardScan } from "@/lib/consumer/get-user-dashboard";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const STATUS_LABEL: Record<DashboardScan["status"], string> = {
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecentScans({ scans }: { scans: DashboardScan[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="bg-white rounded-2xl border border-[#D9E2EC] p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-[#102A43]">Recent Scans</h2>
        <a
          href="/user/scans"
          className="text-xs font-semibold text-[#1769AA] hover:underline"
        >
          View all →
        </a>
      </div>

      {scans.length === 0 ? (
        <div className="py-8 text-center text-sm text-[#627D98]">
          No scans yet. Scan your first product.
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          {scans.map((s) => (
            <ScanItem
              key={s.id}
              name={s.productName}
              date={formatDate(s.createdAt)}
              status={STATUS_LABEL[s.status]}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}