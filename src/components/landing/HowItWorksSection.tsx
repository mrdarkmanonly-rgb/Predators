"use client";

import { motion } from "framer-motion";
import { ScanLine, FileSearch, ListChecks, Send } from "lucide-react";

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

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-bg py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-trust">How It Works</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            From Product to Result, in Four Steps
          </h2>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="relative mt-16 hidden lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-6 h-px bg-line" />
          {STEPS.map(({ icon: Icon, step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="relative flex flex-col items-center text-center"
            >
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white">
                <Icon className="h-[22px] w-[22px]" />
              </span>
              <span className="mt-4 text-xs font-bold tracking-wide text-trust">
                {step}
              </span>
              <h3 className="mt-1 text-lg font-semibold text-navy">{title}</h3>
              <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-muted">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mobile vertical timeline */}
        <div className="relative mt-12 space-y-8 lg:hidden">
          <div className="absolute left-6 top-2 bottom-2 w-px bg-line" />
          {STEPS.map(({ icon: Icon, step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative flex gap-5 pl-0"
            >
              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                <Icon className="h-5 w-5" />
              </span>
              <div className="pt-1">
                <span className="text-xs font-bold tracking-wide text-trust">
                  {step}
                </span>
                <h3 className="mt-0.5 text-base font-semibold text-navy">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}