"use client";

import { motion, type Variants } from "framer-motion";
import {
  ScanLine,
  FileSearch,
  ListChecks,
  FileOutput,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const PIPELINE = [
  {
    icon: ScanLine,
    step: "01",
    title: "Scan",
    desc: "Capture the product label",
  },
  {
    icon: FileSearch,
    step: "02",
    title: "Extract",
    desc: "AI + OCR read key details",
  },
  {
    icon: ListChecks,
    step: "03",
    title: "Check",
    desc: "Rules engine validates them",
  },
  {
    icon: FileOutput,
    step: "04",
    title: "Report",
    desc: "Consumer gets a clear result",
  },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
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

export default function SolutionSection() {
  return (
    <section
      id="solution"
      className="relative isolate overflow-hidden bg-[#EAF4FF]/55 py-20 lg:py-28"
    >
      {/* ================= BACKGROUND ================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Blue atmosphere */}
        <div className="absolute left-1/3 top-0 h-[25rem] w-[25rem] rounded-full bg-[#1769AA]/5 blur-3xl" />

        {/* Green atmosphere */}
        <div className="absolute -bottom-40 right-0 h-[24rem] w-[24rem] rounded-full bg-[#16A34A]/5 blur-3xl" />

        {/* Technical grid */}
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
        <div className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-end">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65 }}
            className="max-w-2xl"
          >
            {/* Label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1769AA]/15 bg-white/80 px-3.5 py-1.5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#1769AA]" />

              <span className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">
                Our Solution
              </span>
            </div>

            {/* Heading */}
            <h2 className="mt-5 text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-[#0B1F33] sm:text-4xl lg:text-5xl">
              One Scan.
              <br />
              <span className="text-[#1769AA]">
                Multiple Compliance Checks.
              </span>
            </h2>

            {/* Description */}
            <p className="mt-5 max-w-xl text-base leading-7 text-[#627D98] sm:text-lg">
              CheckItRight uses AI and OCR to extract product information, and
              a rule-based Legal Metrology engine to evaluate the declarations
              that apply to that product.
            </p>
          </motion.div>

          {/* ================= AI / RULE BADGE ================= */}
          <motion.div
            initial={{ opacity: 0, x: 25, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative shrink-0 overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white/90 px-5 py-4 shadow-lg shadow-[#0B1F33]/5 backdrop-blur"
          >
            {/* Moving highlight */}
            <motion.div
              animate={{ x: ["-120%", "250%"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
              className="absolute inset-y-0 w-16 skew-x-[-20deg] bg-[#1769AA]/5"
            />

            <div className="relative flex items-center gap-3">
              <div>
                <p className="text-sm font-bold text-[#0B1F33]">
                  AI extracts.
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#627D98]">
                  Understand the label
                </p>
              </div>

              <div className="h-8 w-px bg-[#D9E2EC]" />

              <div>
                <p className="text-sm font-bold text-[#16A34A]">
                  Rules decide.
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#627D98]">
                  Validate compliance
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ================= PIPELINE ================= */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="relative mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
        >
          {/* Desktop connecting line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[10%] right-[10%] top-[3.15rem] hidden h-px bg-[#D9E2EC] lg:block"
          />

          {/* Animated connection */}
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 1.2,
              delay: 0.35,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute left-[10%] right-[10%] top-[3.15rem] hidden h-px origin-left bg-[#1769AA]/35 lg:block"
          />

          {PIPELINE.map(({ icon: Icon, step, title, desc }, index) => (
            <motion.div
              key={step}
              variants={item}
              whileHover={{
                y: -8,
                transition: { duration: 0.25 },
              }}
              className="group relative rounded-2xl border border-[#D9E2EC] bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-[#0B1F33]/8 sm:p-6"
            >
              {/* Step header */}
              <div className="relative z-10 flex items-center justify-between">
                {/* Number */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#0B1F33] text-xs font-bold text-white shadow-lg shadow-[#0B1F33]/15"
                >
                  {step}

                  {/* Active ring */}
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.35, 0, 0.35],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: index * 0.4,
                    }}
                    className="absolute inset-0 rounded-full border border-[#1769AA]"
                  />
                </motion.div>

                {/* Icon */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4FF] transition-colors duration-300 group-hover:bg-[#1769AA]/10">
                  <Icon className="h-5 w-5 text-[#1769AA] transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>

              {/* Content */}
              <h3 className="mt-6 text-base font-bold text-[#0B1F33]">
                {title}
              </h3>

              <p className="mt-1.5 text-sm leading-6 text-[#627D98]">
                {desc}
              </p>

              {/* Bottom status */}
              <div className="mt-5 flex items-center gap-2 border-t border-[#D9E2EC] pt-4">
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

                <span className="text-[10px] font-bold uppercase tracking-widest text-[#627D98]">
                  {index === 0 && "Input"}
                  {index === 1 && "Processing"}
                  {index === 2 && "Validation"}
                  {index === 3 && "Output"}
                </span>

                {/* Arrow */}
                {index < PIPELINE.length - 1 && (
                  <ArrowRight className="ml-auto hidden h-3.5 w-3.5 text-[#D9E2EC] lg:block" />
                )}
              </div>

              {/* Hover glow */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-[#1769AA]/20 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>

        {/* ================= BOTTOM STATEMENT ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-10 flex max-w-3xl items-center justify-center text-center"
        >
          <p className="text-sm leading-6 text-[#627D98]">
            <span className="font-bold text-[#0B1F33]">
              AI understands the label.
            </span>{" "}
            The{" "}
            <span className="font-bold text-[#1769AA]">
              Legal Metrology rule engine
            </span>{" "}
            determines whether the declarations meet the applicable
            requirements.
          </p>
        </motion.div>
      </div>
    </section>
  );
}