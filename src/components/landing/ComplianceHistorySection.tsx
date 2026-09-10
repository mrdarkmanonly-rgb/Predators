"use client";

import { motion } from "framer-motion";
import {
  ScanLine,
  MessageSquareWarning,
  ShieldAlert,
  CheckCircle2,
  History,
  ArrowUpRight,
} from "lucide-react";

const STATS = [
  {
    icon: ScanLine,
    label: "Total Scans",
    value: "1,285",
  },
  {
    icon: MessageSquareWarning,
    label: "Citizen Reports",
    value: "38",
  },
  {
    icon: ShieldAlert,
    label: "Verified Violations",
    value: "12",
  },
  {
    icon: CheckCircle2,
    label: "Resolved Cases",
    value: "9",
  },
];

const statVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function ComplianceHistorySection() {
  return (
    <section className="relative overflow-hidden bg-[#F7FAFC] py-20 lg:py-28">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[-10%] top-1/4 h-80 w-80 rounded-full blur-3xl"
          style={{
            background: "#1769AA",
            opacity: 0.045,
          }}
        />

        <div
          className="absolute bottom-[-10%] right-[-5%] h-96 w-96 rounded-full blur-3xl"
          style={{
            background: "#16A34A",
            opacity: 0.035,
          }}
        />

        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#1769AA 1px, transparent 1px), linear-gradient(90deg, #1769AA 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Label */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D9E2EC] bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
              <History className="h-3.5 w-3.5 text-[#1769AA]" />

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#1769AA]">
                Compliance History
              </span>
            </div>

            <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#102A43] sm:text-4xl lg:text-5xl">
              Every Product Builds a{" "}
              <span className="text-[#1769AA]">Compliance Record.</span>
            </h2>

            {/* Accent line */}
            <div className="mt-6 h-1 w-20 overflow-hidden rounded-full bg-[#D9E2EC]">
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

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#627D98] sm:text-lg">
              Each product develops a persistent compliance profile over
              time. Scans, citizen reports, verified violations, and resolved
              cases are tracked separately — a report is never treated as a
              confirmed violation until it&apos;s verified.
            </p>

            {/* Small credibility points */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "Persistent product profile",
                "Verified records",
                "Separate report tracking",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-full border border-[#D9E2EC] bg-white px-3 py-2"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />

                  <span className="text-xs font-medium text-[#627D98]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Compliance Passport */}
          <motion.div
            initial={{ opacity: 0, x: 24, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative"
          >
            {/* Outer glow */}
            <div className="absolute -inset-4 rounded-[28px] bg-[#1769AA] opacity-[0.035] blur-2xl" />

            <div className="relative overflow-hidden rounded-[24px] border border-[#D9E2EC] bg-white p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)] sm:p-7">
              {/* Top accent */}
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#0B1F33] via-[#1769AA] to-[#16A34A]" />

              {/* Scan animation */}
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="pointer-events-none absolute left-0 right-0 z-10 h-px bg-[#1769AA] opacity-20"
              />

              {/* Product header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#1769AA]">
                    <ScanLine className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-base font-bold text-[#102A43]">
                      ABC Cooking Oil — 1 L
                    </p>

                    <span className="text-xs font-medium text-[#627D98]">
                      Compliance Passport
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#16A34A]/20 bg-[#16A34A]/10 px-3 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]" />
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">
                    Compliant
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-[#D9E2EC]" />

              {/* Stats */}
              <motion.div
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.08,
                    },
                  },
                }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="grid grid-cols-2 gap-3 sm:gap-4"
              >
                {STATS.map(({ icon: Icon, label, value }) => (
                  <motion.div
                    key={label}
                    variants={statVariants}
                    className="group relative overflow-hidden rounded-xl border border-[#D9E2EC] bg-[#F7FAFC] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#1769AA]/25 hover:bg-white hover:shadow-[0_10px_25px_rgba(23,105,170,0.08)]"
                  >
                    {/* Hover glow */}
                    <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[#1769AA] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10" />

                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF4FF] text-[#1769AA]">
                          <Icon className="h-4 w-4" />
                        </div>

                        <ArrowUpRight className="h-3.5 w-3.5 text-[#627D98]/40 transition-colors group-hover:text-[#1769AA]" />
                      </div>

                      <p className="mt-4 text-2xl font-bold tracking-tight text-[#102A43]">
                        {value}
                      </p>

                      <p className="mt-0.5 text-xs font-medium text-[#627D98]">
                        {label}
                      </p>

                      {/* Tiny progress indicator */}
                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#D9E2EC]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "72%" }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.8,
                            delay: 0.35,
                          }}
                          className="h-full rounded-full bg-[#1769AA]"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Bottom information */}
              <div className="mt-5 rounded-xl border border-[#D9E2EC] bg-[#EAF4FF]/50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#1769AA]">
                    <History className="h-3.5 w-3.5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#102A43]">
                      Evidence-based history
                    </p>

                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#627D98]">
                      Reports and verified violations remain separate so that
                      product history reflects verified outcomes.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-[10px] text-[#627D98]">
                Illustrative sample data for demonstration purposes.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}