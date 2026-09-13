"use client";

import { motion } from "framer-motion";

const styles: Record<string, string> = {
  // Scan statuses
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Failed: "bg-red-50 text-red-700 border-red-200",

  // Report statuses
  Submitted: "bg-slate-50 text-slate-700 border-slate-200",
  "Forwarded to Inspector": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        styles[status] ?? "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {status}
    </motion.span>
  );
}