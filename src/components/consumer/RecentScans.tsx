"use client";

import { motion } from "framer-motion";
import ScanItem from "./ScanItem";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const scans = [
  {
    name: "Parle-G Biscuits",
    date: "15 Sep 2026, 10:24 AM",
    status: "Compliant",
  },
  {
    name: "Coca-Cola (500ml)",
    date: "14 Sep 2026, 06:18 PM",
    status: "Needs Review",
  },
  {
    name: "Maggi Noodles (70g)",
    date: "13 Sep 2026, 02:41 PM",
    status: "Possible Issue",
  },
  {
    name: "Dove Shampoo (180ml)",
    date: "12 Sep 2026, 11:03 AM",
    status: "Compliant",
  },
];

export default function RecentScans() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="bg-white rounded-2xl border border-[#D9E2EC] p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-[#102A43]">Recent Scans</h2>
        <button className="text-xs font-semibold text-[#1769AA] hover:underline">
          View all →
        </button>
      </div>

      <motion.div variants={container} initial="hidden" animate="show">
        {scans.map((s) => (
          <ScanItem key={s.name} {...s} />
        ))}
      </motion.div>
    </motion.div>
  );
}
