"use client";

import { motion } from "framer-motion";
import { ScanLine, FileSearch, ListChecks, FileOutput } from "lucide-react";

const PIPELINE = [
  { icon: ScanLine, step: "01", title: "Scan", desc: "Capture the product label" },
  { icon: FileSearch, step: "02", title: "Extract", desc: "AI + OCR read key details" },
  { icon: ListChecks, step: "03", title: "Check", desc: "Rules engine validates them" },
  { icon: FileOutput, step: "04", title: "Report", desc: "Consumer gets a clear result" },
];

export default function SolutionSection() {
  return (
    <section className="bg-trust-light/50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold text-trust">Our Solution</span>
            <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
              One Scan. Multiple Compliance Checks.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              CheckItRight uses AI and OCR to extract product information, and
              a rule-based Legal Metrology engine to evaluate the declarations
              that apply to that product.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-line bg-surface px-5 py-4">
            <span className="text-sm font-semibold text-navy">AI extracts.</span>
            <span className="h-4 w-px bg-line" />
            <span className="text-sm font-semibold text-trust">Rules decide.</span>
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
          className="relative mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* connecting line, desktop only */}
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-line lg:block" />

          {PIPELINE.map(({ icon: Icon, step, title, desc }) => (
            <motion.div
              key={step}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
              }}
              className="relative flex flex-col items-start rounded-xl border border-line bg-surface p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                  {step}
                </span>
                <Icon className="h-6 w-6 text-trust" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-navy">{title}</h3>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}