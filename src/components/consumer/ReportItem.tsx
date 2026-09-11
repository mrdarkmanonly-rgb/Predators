"use client";

import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";

type Props = {
  id: string;
  product: string;
  date: string;
  status: string;
};

export default function ReportItem({ id, product, date, status }: Props) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: 12 },
        show: { opacity: 1, x: 0 },
      }}
      whileHover={{ x: 4 }}
      className="py-3 px-2 rounded-xl hover:bg-[#F7FAFC] transition cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-[#627D98]">{id}</p>
        <StatusBadge status={status} />
      </div>
      <p className="text-sm font-semibold text-[#102A43] mt-1">{product}</p>
      <p className="text-xs text-[#627D98] mt-0.5">{date}</p>
    </motion.div>
  );
}
