"use client";

import { motion, type Variants } from "framer-motion";
import {
  ScanLine,
  FileSearch,
  ListChecks,
  Send,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const STEPS = [
  {
    icon: ScanLine,
    step: "01",
    title: "Scan",
    desc: "Capture or upload the product label.",
  },
  {
    icon: FileSearch,
    step: "02",
    title: "Extract",
    desc: "AI + OCR extracts relevant product information.",
  },
  {
    icon: ListChecks,
    step: "03",
    title: "Check",
    desc: "The system validates information against applicable Legal Metrology rules.",
  },
  {
    icon: Send,
    step: "04",
    title: "Report",
    desc: "The consumer gets an understandable result and can report suspected issues.",
  },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative isolate overflow-hidden bg-[#F7FAFC] py-20 lg:py-28"
    >
      {/* ================= BACKGROUND ================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/4 top-0 h-[25rem] w-[25rem] rounded-full bg-[#1769AA]/5 blur-3xl" />

        <div className="absolute -bottom-40 right-1/4 h-[22rem] w-[22rem] rounded-full bg-[#16A34A]/5 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#0B1F33 1px, transparent 1px), linear-gradient(90deg, #0B1F33 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65 }}
          className="mx-auto max-w-2xl text-center"
        >
          {/* Label */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1769AA]/15 bg-[#EAF4FF] px-3.5 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#1769AA]" />

            <span className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">
              How It Works
            </span>
          </div>

          {/* Heading */}
          <h2 className="mt-5 text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-[#0B1F33] sm:text-4xl lg:text-5xl">
            From Product to Result,
            <br />
            <span className="text-[#1769AA]">in Four Steps.</span>
          </h2>

          <p className="mt-5 text-sm leading-6 text-[#627D98] sm:text-base">
            A simple workflow that turns a product label into an
            understandable compliance result.
          </p>
        </motion.div>

        {/* ================= DESKTOP TIMELINE ================= */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="relative mt-16 hidden lg:grid lg:grid-cols-4 lg:gap-8"
        >
          {/* Base timeline */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[2.25rem] h-px bg-[#D9E2EC]"
          />

          {/* Animated timeline */}
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 1.4,
              delay: 0.3,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[2.25rem] h-px origin-left bg-[#1769AA]/40"
          />

          {STEPS.map(({ icon: Icon, step, title, desc }, index) => (
            <motion.div
              key={step}
              variants={item}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Step node */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.25 }}
                className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-[#F7FAFC] bg-[#0B1F33] shadow-lg shadow-[#0B1F33]/15"
              >
                <Icon className="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" />

                {/* Pulse ring */}
                <motion.span
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.35, 0, 0.35],
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    delay: index * 0.45,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full border border-[#1769AA]"
                />
              </motion.div>

              {/* Step number */}
              <span className="mt-5 text-[11px] font-bold tracking-[0.18em] text-[#1769AA]">
                STEP {step}
              </span>

              {/* Title */}
              <h3 className="mt-1.5 text-lg font-bold text-[#0B1F33]">
                {title}
              </h3>

              {/* Description */}
              <p className="mt-2 max-w-[15rem] text-sm leading-6 text-[#627D98]">
                {desc}
              </p>

              {/* Status */}
              <div className="mt-5 flex items-center gap-2">
                <motion.span
                  animate={{
                    opacity: [0.45, 1, 0.45],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-[#16A34A]"
                />

                <span className="text-[9px] font-bold uppercase tracking-widest text-[#627D98]">
                  {index === 0 && "Capture"}
                  {index === 1 && "Understand"}
                  {index === 2 && "Validate"}
                  {index === 3 && "Respond"}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ================= MOBILE TIMELINE ================= */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="relative mt-12 space-y-8 lg:hidden"
        >
          {/* Vertical base line */}
          <div
            aria-hidden="true"
            className="absolute bottom-6 left-[1.65rem] top-6 w-px bg-[#D9E2EC]"
          />

          {/* Animated vertical line */}
          <motion.div
            aria-hidden="true"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
            }}
            className="absolute bottom-6 left-[1.65rem] top-6 w-px origin-top bg-[#1769AA]/40"
          />

          {STEPS.map(({ icon: Icon, step, title, desc }, index) => (
            <motion.div
              key={step}
              variants={item}
              className="group relative flex gap-5"
            >
              {/* Node */}
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="relative z-10 flex h-[3.3rem] w-[3.3rem] shrink-0 items-center justify-center rounded-full border-4 border-[#F7FAFC] bg-[#0B1F33] shadow-md"
              >
                <Icon className="h-5 w-5 text-white" />

                <motion.span
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: index * 0.4,
                  }}
                  className="absolute inset-0 rounded-full border border-[#1769AA]"
                />
              </motion.div>

              {/* Content */}
              <div className="min-w-0 flex-1 rounded-2xl border border-[#D9E2EC] bg-white p-4 shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-[#1769AA]">
                    STEP {step}
                  </span>

                  {index < STEPS.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-[#D9E2EC]" />
                  )}
                </div>

                <h3 className="mt-1 text-base font-bold text-[#0B1F33]">
                  {title}
                </h3>

                <p className="mt-1.5 text-sm leading-6 text-[#627D98]">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ================= BOTTOM FLOW ================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-12 flex max-w-3xl items-center justify-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#D9E2EC] bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <span className="text-xs font-bold text-[#0B1F33]">Scan</span>
            <ArrowRight className="h-3 w-3 text-[#1769AA]" />

            <span className="text-xs font-bold text-[#0B1F33]">Extract</span>
            <ArrowRight className="h-3 w-3 text-[#1769AA]" />

            <span className="text-xs font-bold text-[#0B1F33]">Check</span>
            <ArrowRight className="h-3 w-3 text-[#1769AA]" />

            <span className="text-xs font-bold text-[#16A34A]">Report</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}