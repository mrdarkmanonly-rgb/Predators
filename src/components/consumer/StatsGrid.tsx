"use client";

import { motion } from "framer-motion";
import { ScanLine, FileText, Clock, CheckCircle2, Package } from "lucide-react";
import StatCard from "./StatCard";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

type Stats = {
  totalScans: number;
  reportsSubmitted: number;
  pendingReports: number;
  resolvedReports: number;
  productsChecked: number;
};

export default function StatsGrid({ stats }: { stats: Stats }) {
  const items = [
    {
      label: "Total Scans",
      value: stats.totalScans,
      icon: ScanLine,
      color: "bg-[#1769AA]",
    },
    {
      label: "Reports Submitted",
      value: stats.reportsSubmitted,
      icon: FileText,
      color: "bg-[#0B1F33]",
    },
    {
      label: "Pending Reports",
      value: stats.pendingReports,
      icon: Clock,
      color: "bg-amber-500",
    },
    {
      label: "Resolved Reports",
      value: stats.resolvedReports,
      icon: CheckCircle2,
      color: "bg-green-600",
    },
    {
      label: "Products Checked",
      value: stats.productsChecked,
      icon: Package,
      color: "bg-[#1769AA]",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
    >
      {items.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </motion.div>
  );
}