"use client";

import { motion } from "framer-motion";
import {
  User,
  FileWarning,
  UserCheck,
  BadgeCheck,
  Building,
  ClipboardCheck,
  Archive,
  History,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const WORKFLOW = [
  {
    icon: User,
    title: "Citizen",
    desc: "Scans a product and notices an issue",
  },
  {
    icon: FileWarning,
    title: "Report",
    desc: "Submits a report with evidence",
  },
  {
    icon: UserCheck,
    title: "Reviewer",
    desc: "Screens the report for validity",
  },
  {
    icon: BadgeCheck,
    title: "Verify",
    desc: "Confirms it warrants inspection",
  },
  {
    icon: Building,
    title: "Inspector",
    desc: "Assigned for on-ground follow-up",
  },
  {
    icon: ClipboardCheck,
    title: "Inspect",
    desc: "Conducts a formal inspection",
  },
  {
    icon: Archive,
    title: "Official Record",
    desc: "Outcome is recorded",
  },
  {
    icon: History,
    title: "Compliance History",
    desc: "Added to the product's history",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function LegalMetrologySection() {
  return (
    <section
      id="legal-metrology"
      className="relative overflow-hidden bg-[#EAF4FF] py-20 lg:py-28"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "#1769AA", opacity: 0.07 }}
        />

        <div
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "#16A34A", opacity: 0.05 }}
        />

        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(#1769AA 1px, transparent 1px), linear-gradient(90deg, #1769AA 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Section label */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D9E2EC] bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]" />
            </span>

            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#1769AA]">
              Legal Metrology
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl lg:text-5xl">
            From Citizen Report to{" "}
            <span className="text-[#1769AA]">Verified Inspection.</span>
          </h2>

          <div className="mx-auto mt-5 h-1 w-16 overflow-hidden rounded-full bg-[#D9E2EC]">
            <motion.div
              initial={{ x: "-100%" }}
              whileInView={{ x: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full w-full rounded-full bg-[#16A34A]"
            />
          </div>

          <p className="mt-6 text-base leading-relaxed text-[#627D98] sm:text-lg">
            Citizen reports are reviewed for validity before being forwarded
            for official inspection. CheckItRight does not impose penalties —
            it connects citizens, reviewers, and inspectors under the Legal
            Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </motion.div>

        {/* Workflow */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          className="relative mt-16"
        >
          {/* Desktop connecting line */}
          <div className="pointer-events-none absolute left-[6%] right-[6%] top-[54px] hidden h-px bg-[#B8CCE0] lg:block">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 1.5,
                delay: 0.35,
                ease: "easeInOut",
              }}
              className="h-full origin-left bg-[#1769AA]"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white p-5 shadow-[0_8px_30px_rgba(16,42,67,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1769AA]/30 hover:shadow-[0_18px_40px_rgba(23,105,170,0.12)]">
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#1769AA] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10" />

                  {/* Step number */}
                  <div className="absolute right-4 top-4 text-[11px] font-bold tracking-wider text-[#627D98]/50">
                    0{i + 1}
                  </div>

                  {/* Icon */}
                  <div className="relative flex items-center gap-3">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B1F33] text-white shadow-md">
                      <Icon className="h-5 w-5" />

                      {/* Status pulse */}
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#16A34A]">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    </div>

                    {/* Arrow on desktop */}
                    {i < WORKFLOW.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: 0.5 + i * 0.08,
                          duration: 0.3,
                        }}
                        className="absolute -right-7 top-5 z-10 hidden lg:block"
                      >
                        <ArrowRight className="h-4 w-4 text-[#1769AA]" />
                      </motion.div>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="mt-5 text-sm font-bold text-[#102A43]">
                    {title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-[#627D98]">
                    {desc}
                  </p>

                  {/* Bottom indicator */}
                  <div className="mt-5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#EAF4FF]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.7,
                          delay: 0.35 + i * 0.08,
                        }}
                        className="h-full rounded-full bg-[#1769AA]"
                      />
                    </div>

                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#16A34A]">
                      Active
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom trust statement */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-12 max-w-3xl"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#D9E2EC] bg-white/80 px-6 py-5 text-center shadow-sm backdrop-blur sm:flex-row sm:text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#1769AA]">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#102A43]">
                Review first. Verify carefully. Inspect officially.
              </p>

              <p className="mt-1 text-xs leading-relaxed text-[#627D98]">
                CheckItRight supports the workflow with evidence and
                compliance intelligence while official decisions remain with
                the responsible authorities.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}