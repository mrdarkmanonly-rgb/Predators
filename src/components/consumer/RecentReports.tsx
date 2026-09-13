"use client";

import { motion } from "framer-motion";
import ReportItem from "./ReportItem";
import type { DashboardReport } from "@/lib/consumer/get-user-dashboard";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RecentReports({
  reports,
}: {
  reports: DashboardReport[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="bg-white rounded-2xl border border-[#D9E2EC] p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-[#102A43]">My Reports</h2>
        <a
          href="/user/reports"
          className="text-xs font-semibold text-[#1769AA] hover:underline"
        >
          View all →
        </a>
      </div>

      {reports.length === 0 ? (
        <div className="py-8 text-center text-sm text-[#627D98]">
          You haven&apos;t submitted any reports yet.
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          {reports.map((r) => (
            <ReportItem
              key={r.id}
              id={`#${r.reportCode}`}
              product={r.productName}
              date={formatDate(r.createdAt)}
              status={r.status}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}