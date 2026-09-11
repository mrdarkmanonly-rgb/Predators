"use client";

import { motion } from "framer-motion";
import { ScanLine, FileText, Clock, CheckCircle2, Package } from "lucide-react";
import StatCard from "./StatCard";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const stats = [
  {
    label: "Total Scans",
    value: 24,
    delta: "↑ 12%",
    icon: ScanLine,
    color: "bg-[#1769AA]",
  },
  {
    label: "Reports Submitted",
    value: 5,
    delta: "↑ 25%",
    icon: FileText,
    color: "bg-[#0B1F33]",
  },
  { label: "Under Review", value: 2, icon: Clock, color: "bg-amber-500" },
  {
    label: "Resolved Reports",
    value: 3,
    icon: CheckCircle2,
    color: "bg-green-600",
  },
  {
    label: "Products Checked",
    value: 18,
    delta: "↑ 20%",
    icon: Package,
    color: "bg-[#1769AA]",
  },
];

export default function StatsGrid() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
    >
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </motion.div>
  );
}
