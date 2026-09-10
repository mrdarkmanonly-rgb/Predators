"use client";

import Image from "next/image";
import { motion } from "framer-motion";
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
} from "lucide-react";

const CHECKS = [
  { icon: IndianRupee, title: "MRP", desc: "Maximum Retail Price" },
  { icon: Scale, title: "Net Quantity", desc: "Quantity of product" },
  {
    icon: Building2,
    title: "Manufacturer / Packer / Importer",
    desc: "Name and address",
  },
  { icon: Globe2, title: "Country of Origin", desc: "Where applicable" },
  {
    icon: CalendarDays,
    title: "Manufacturing / Packing Date",
    desc: "Applicable date information",
  },
  { icon: Clock, title: "Best Before / Use By", desc: "Where applicable" },
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
  pass: { icon: CheckCircle2, className: "text-success", text: "Pass" },
  review: { icon: AlertTriangle, className: "text-warning", text: "Needs Review" },
  issue: { icon: XCircle, className: "text-danger", text: "Potential Issue" },
};

export default function FeaturesSection() {
  return (
    <section id="what-we-check" className="bg-bg py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-trust">What We Check</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            What CheckItRight Checks
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            We verify key declarations required under Legal Metrology rules.
            Not every declaration applies to every product — applicable
            checks depend on the product category and rule context.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          {/* Grid of checks */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {CHECKS.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                }}
                className="rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-md"
              >
                <Icon className="h-5 w-5 text-trust" />
                <h3 className="mt-3 text-sm font-semibold text-navy">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Sample result demo card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="h-fit rounded-2xl border border-line bg-surface p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Sample Result
              </span>
              <span className="rounded-full bg-trust-light px-2.5 py-1 text-[11px] font-semibold text-trust">
                Demo Data
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-bg">
                <Image
                  src="/images/product-sample.png"
                  alt="Sample cooking oil bottle used for the demo scan"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-base font-semibold text-navy">Sample Product</p>
                <p className="text-sm text-muted">Cooking Oil — 1 L</p>
              </div>
            </div>

            <ul className="mt-4 space-y-3 border-t border-line pt-4">
              {SAMPLE_ROWS.map((row) => {
                const s = STATUS_STYLES[row.status];
                const Icon = s.icon;
                return (
                  <li
                    key={row.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink/80">{row.label}</span>
                    <span className={`flex items-center gap-1.5 font-medium ${s.className}`}>
                      <Icon className="h-4 w-4" />
                      {s.text}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-warning/10 px-4 py-3">
              <span className="text-xs font-medium text-navy">Overall Status</span>
              <span className="text-xs font-bold uppercase tracking-wide text-warning">
                Needs Review
              </span>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-lg border border-line py-2.5 text-sm font-medium text-navy hover:border-trust hover:text-trust"
              >
                View Details
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-danger/30 bg-danger/5 py-2.5 text-sm font-medium text-danger hover:bg-danger/10"
              >
                Report Issue
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}