"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EAF4FF] to-white border border-[#D9E2EC] p-6 md:p-8"
    >
      <div className="relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#102A43]">
          Welcome back, Harsika! 👋
        </h1>
        <p className="text-sm md:text-base text-[#627D98] mt-1.5">
          Scan. Check. Report. Be the Change.
        </p>
      </div>

      {/* Decorative blobs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#1769AA]/10 blur-2xl"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-12 right-20 w-32 h-32 rounded-full bg-green-400/10 blur-2xl"
      />
    </motion.div>
  );
}
