"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import {
  IndianRupee,
  Scale,
  Building2,
  Globe2,
  CalendarDays,
  Clock,
  Headphones,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ScanSearch,
} from "lucide-react";

const CHECKS = [
  {
    icon: IndianRupee,
    title: "MRP",
    desc: "Maximum Retail Price",
  },
  {
    icon: Scale,
    title: "Net Quantity",
    desc: "Quantity of product",
  },
  {
    icon: Building2,
    title: "Manufacturer / Packer / Importer",
    desc: "Name and address",
  },
  {
    icon: Globe2,
    title: "Country of Origin",
    desc: "Where applicable",
  },
  {
    icon: CalendarDays,
    title: "Manufacturing / Packing Date",
    desc: "Applicable date information",
  },
  {
    icon: Clock,
    title: "Best Before / Use By",
    desc: "Where applicable",
  },
  {
    icon: Headphones,
    title: "Consumer Care",
    desc: "Consumer complaint / contact details",
  },
  {
    icon: FileText,
    title: "Required Declarations",
    desc: "Other applicable mandatory declarations",
  },
];

const SAMPLE_ROWS = [
  { label: "Manufacturer", status: "pass" as const },
  { label: "Net Quantity", status: "pass" as const },
  { label: "MRP", status: "pass" as const },
  { label: "Best Before", status: "review" as const },
  { label: "Required Declaration", status: "issue" as const },
];

const STATUS_STYLES = {
  pass: {
    icon: CheckCircle2,
    className: "text-[#16A34A]",
    bg: "bg-[#16A34A]/10",
    text: "Pass",
  },
  review: {
    icon: AlertTriangle,
    className: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    text: "Needs Review",
  },
  issue: {
    icon: XCircle,
    className: "text-[#DC2626]",
    bg: "bg-[#DC2626]/10",
    text: "Potential Issue",
  },
};

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function FeaturesSection() {
  return (
    <section
      id="what-we-check"
      className="relative isolate overflow-hidden bg-[#F7FAFC] py-20 lg:py-28"
    >
      {/* ================= BACKGROUND ================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-[#1769AA]/5 blur-3xl" />

        <div className="absolute -bottom-40 right-0 h-[25rem] w-[25rem] rounded-full bg-[#16A34A]/5 blur-3xl" />

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
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65 }}
          className="mx-auto max-w-2xl text-center"
        >
          {/* Label */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1769AA]/15 bg-[#EAF4FF] px-3.5 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#1769AA]" />

            <span className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">
              What We Check
            </span>
          </div>

          {/* Heading */}
          <h2 className="mt-5 text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-[#0B1F33] sm:text-4xl lg:text-5xl">
            What CheckItRight
            <br />
            <span className="text-[#1769AA]">Checks.</span>
          </h2>

          <p className="mt-5 text-base leading-7 text-[#627D98]">
            We verify key declarations required under Legal Metrology rules.
            Not every declaration applies to every product — applicable checks
            depend on the product category and rule context.
          </p>
        </motion.div>

        {/* ================= CONTENT ================= */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          {/* ================= CHECK MATRIX ================= */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {CHECKS.map(({ icon: Icon, title, desc }, index) => (
              <motion.div
                key={title}
                variants={item}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.25 },
                }}
                className="group relative overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-[#0B1F33]/7"
              >
                {/* Top scan indicator */}
                <div className="absolute right-4 top-4 flex items-center gap-1.5">
                  <motion.span
                    animate={{
                      opacity: [0.35, 1, 0.35],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.15,
                    }}
                    className="h-1.5 w-1.5 rounded-full bg-[#16A34A]"
                  />

                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#627D98]">
                    Check
                  </span>
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 2 }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4FF] transition-colors duration-300 group-hover:bg-[#1769AA]/10"
                >
                  <Icon className="h-5 w-5 text-[#1769AA]" />
                </motion.div>

                {/* Content */}
                <h3 className="mt-4 pr-12 text-sm font-bold leading-snug text-[#0B1F33]">
                  {title}
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-[#627D98]">
                  {desc}
                </p>

                {/* Bottom progress */}
                <div className="mt-4 h-px w-full overflow-hidden bg-[#D9E2EC]">
                  <motion.div
                    initial={{ x: "-100%" }}
                    whileInView={{ x: "0%" }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.7,
                      delay: index * 0.06,
                      ease: "easeOut",
                    }}
                    className="h-full w-full bg-[#1769AA]/30"
                  />
                </div>

                {/* Hover border */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-[#1769AA]/20 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            ))}
          </motion.div>

          {/* ================= SAMPLE RESULT ================= */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="h-fit"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-xl shadow-[#0B1F33]/7">
              {/* Animated scanner glow */}
              <motion.div
                animate={{
                  y: ["-100%", "500%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute left-0 right-0 h-20 bg-[#1769AA]/5 blur-2xl"
              />

              {/* Header */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScanSearch className="h-4 w-4 text-[#1769AA]" />

                  <span className="text-xs font-bold uppercase tracking-wider text-[#627D98]">
                    Sample Result
                  </span>
                </div>

                <span className="rounded-full border border-[#1769AA]/10 bg-[#EAF4FF] px-2.5 py-1 text-[10px] font-bold text-[#1769AA]">
                  DEMO DATA
                </span>
              </div>

              {/* Product */}
              <div className="relative mt-5 flex items-center gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#D9E2EC] bg-[#F7FAFC]">
                  <Image
                    src="/images/product-sample.png"
                    alt="Sample cooking oil bottle used for the demo scan"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="text-base font-bold text-[#0B1F33]">
                    Sample Product
                  </p>

                  <p className="mt-0.5 text-sm text-[#627D98]">
                    Cooking Oil — 1 L
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="relative mt-5 border-t border-[#D9E2EC] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#627D98]">
                    Compliance Checks
                  </span>

                  <span className="text-[10px] font-semibold text-[#627D98]">
                    5 checks
                  </span>
                </div>

                {/* Rows */}
                <ul className="space-y-2">
                  {SAMPLE_ROWS.map((row, index) => {
                    const status = STATUS_STYLES[row.status];
                    const Icon = status.icon;

                    return (
                      <motion.li
                        key={row.label}
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.4,
                          delay: 0.25 + index * 0.08,
                        }}
                        className="flex items-center justify-between rounded-xl border border-transparent px-2.5 py-2 transition-colors hover:border-[#D9E2EC] hover:bg-[#F7FAFC]"
                      >
                        <span className="text-xs font-medium text-[#102A43]">
                          {row.label}
                        </span>

                        <span
                          className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${status.className} ${status.bg}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {status.text}
                        </span>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>

              {/* Overall Status */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: 0.7,
                }}
                className="relative mt-5 overflow-hidden rounded-xl border border-[#F59E0B]/15 bg-[#F59E0B]/8 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98]">
                      Overall Status
                    </span>

                    <p className="mt-0.5 text-sm font-bold text-[#0B1F33]">
                      Needs Review
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F59E0B]/10">
                    <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="relative mt-5 grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl border border-[#D9E2EC] py-2.5 text-xs font-bold text-[#0B1F33] transition-colors hover:border-[#1769AA]/40 hover:text-[#1769AA]"
                >
                  View Details
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 py-2.5 text-xs font-bold text-[#DC2626] transition-colors hover:bg-[#DC2626]/10"
                >
                  Report Issue
                </motion.button>
              </div>
            </div>

            {/* Small explanatory note */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
              className="mt-4 flex items-start gap-2.5 px-1"
            >
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1769AA]" />

              <p className="text-[11px] leading-5 text-[#627D98]">
                Applicable checks vary by product category and rule context.
                A flagged item indicates a point requiring attention, not
                necessarily a confirmed violation.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}