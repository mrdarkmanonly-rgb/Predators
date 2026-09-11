"use client";

import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";

type Props = {
  name: string;
  date: string;
  status: string;
  image?: string;
};

export default function ScanItem({ name, date, status }: Props) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -12 },
        show: { opacity: 1, x: 0 },
      }}
      whileHover={{ x: 4 }}
      className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-[#F7FAFC] transition cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#EAF4FF] flex items-center justify-center text-xs font-bold text-[#1769AA]">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#102A43]">{name}</p>
          <p className="text-xs text-[#627D98]">{date}</p>
        </div>
      </div>
      <StatusBadge status={status} />
    </motion.div>
  );
}
