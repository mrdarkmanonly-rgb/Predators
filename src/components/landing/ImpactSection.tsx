"use client";

import { motion } from "framer-motion";
import {
  Star,
  ShieldCheck,
  Crown,
  Trophy,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

const BADGES = [
  {
    icon: Star,
    title: "First Valid Report",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Reporter",
  },
  {
    icon: Crown,
    title: "Consumer Guardian",
  },
  {
    icon: Trophy,
    title: "Compliance Champion",
  },
];

const badgeVariants = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function ImpactSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B1F33] py-20 lg:py-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[-10%] top-1/2 h-96 w-96 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: "#1769AA",
            opacity: 0.12,
          }}
        />

        <div
          className="absolute bottom-[-20%] right-[5%] h-80 w-80 rounded-full blur-3xl"
          style={{
            background: "#16A34A",
            opacity: 0.08,
          }}
        />

        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(234,244,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(234,244,255,0.7) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-xl"
          >
            {/* Label */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" />

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#EAF4FF]">
                Citizen Impact
              </span>
            </div>

            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
              Turn Checking Into{" "}
              <span className="text-[#16A34A]">Social Impact.</span>
            </h2>

            <div className="mt-5 h-1 w-16 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ x: "-100%" }}
                whileInView={{ x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: 0.15,
                }}
                className="h-full w-full rounded-full bg-[#16A34A]"
              />
            </div>

            <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/65 sm:text-base">
              Genuine, verified citizen contributions are recognised —
              rewards are based on validated reports, not raw complaint
              volume.
            </p>

            {/* Trust principle */}
            <div className="mt-7 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#16A34A]/20 bg-[#16A34A]/10">
                <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              </div>

              <div>
                <p className="text-xs font-semibold text-white/90">
                  Quality over quantity
                </p>
                <p className="mt-0.5 text-[11px] text-white/45">
                  Recognition is tied to validated contribution.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Badge grid */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {BADGES.map(({ icon: Icon, title }, index) => (
              <motion.div
                key={title}
                variants={badgeVariants}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.2 },
                }}
                className="group relative w-full min-w-[145px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-5 text-center backdrop-blur-sm transition-colors duration-300 hover:border-[#16A34A]/30 hover:bg-white/[0.07] sm:w-40 sm:px-5 sm:py-6"
              >
                {/* Glow */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#16A34A] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20" />

                {/* Badge icon */}
                <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#16A34A]/20 bg-[#16A34A]/10 text-[#16A34A] transition-all duration-300 group-hover:scale-105 group-hover:border-[#16A34A]/40 group-hover:bg-[#16A34A]/15">
                  <Icon className="h-5 w-5" />

                  {/* Status dot */}
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#0B1F33] bg-[#16A34A]">
                    <span className="h-1 w-1 rounded-full bg-white" />
                  </span>
                </div>

                {/* Step */}
                <div className="mt-4 flex items-center justify-center gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/35">
                    Badge 0{index + 1}
                  </span>

                  <ArrowUpRight className="h-3 w-3 text-white/25 transition-colors group-hover:text-[#16A34A]" />
                </div>

                <p className="mt-2 text-xs font-semibold leading-snug text-white/90">
                  {title}
                </p>

                {/* Bottom progress */}
                <div className="mx-auto mt-4 h-0.5 w-10 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.7,
                      delay: 0.45 + index * 0.1,
                    }}
                    className="h-full rounded-full bg-[#16A34A]"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom statement */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.25 }}
          className="mt-12 border-t border-white/10 pt-6"
        >
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-relaxed text-white/40">
              Every verified contribution helps strengthen transparency in
              packaged commodities.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#16A34A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
              Evidence-based recognition
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}