"use client";

import { motion } from "framer-motion";
import ReportItem from "./ReportItem";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const reports = [
  {
    id: "#CR-2026-00842",
    product: "Parle-G Biscuits (100g)",
    date: "15 Sep 2026",
    status: "Under Review",
  },
  {
    id: "#CR-2026-00841",
    product: "Coca-Cola (500ml)",
    date: "12 Sep 2026",
    status: "Verification",
  },
  {
    id: "#CR-2026-00839",
    product: "Maggi Noodles (70g)",
    date: "10 Sep 2026",
    status: "Resolved",
  },
  {
    id: "#CR-2026-00835",
    product: "Surf Excel (1kg)",
    date: "5 Sep 2026",
    status: "Closed",
  },
];

export default function RecentReports() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="bg-white rounded-2xl border border-[#D9E2EC] p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-[#102A43]">My Reports</h2>
        <button className="text-xs font-semibold text-[#1769AA] hover:underline">
          View all →
        </button>
      </div>

      <motion.div variants={container} initial="hidden" animate="show">
        {reports.map((r) => (
          <ReportItem key={r.id} {...r} />
        ))}
      </motion.div>
    </motion.div>
  );
}
