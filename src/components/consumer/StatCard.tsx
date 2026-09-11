"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: number;
  delta?: string;
  icon: LucideIcon;
  color: string;
};

export default function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  color,
}: Props) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(11,31,51,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="bg-white rounded-2xl border border-[#D9E2EC] p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {delta && (
          <span className="text-xs font-semibold text-green-600">{delta}</span>
        )}
      </div>
      <div>
        <motion.p className="text-2xl font-bold text-[#102A43]">
          {rounded}
        </motion.p>
        <p className="text-xs text-[#627D98] mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}
