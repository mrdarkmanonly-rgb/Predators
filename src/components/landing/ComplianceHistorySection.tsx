"use client";

import { motion } from "framer-motion";
import { ScanLine, MessageSquareWarning, ShieldAlert, CheckCircle2 } from "lucide-react";

const STATS = [
  { icon: ScanLine, label: "Total Scans", value: "1,285" },
  { icon: MessageSquareWarning, label: "Citizen Reports", value: "38" },
  { icon: ShieldAlert, label: "Verified Violations", value: "12" },
  { icon: CheckCircle2, label: "Resolved Cases", value: "9" },
];

export default function ComplianceHistorySection() {
  return (
    <section className="bg-bg py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-sm font-semibold text-trust">
              Compliance History
            </span>
            <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
              Every Product Builds a Compliance Record.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Each product develops a persistent compliance profile over
              time. Scans, citizen reports, verified violations, and
              resolved cases are tracked separately — a report is never
              treated as a confirmed violation until it's verified.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-navy">
                  ABC Cooking Oil — 1 L
                </p>
                <span className="text-xs font-medium text-muted">
                  Compliance Passport
                </span>
              </div>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-success">
                Compliant
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {STATS.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-line bg-bg p-4"
                >
                  <Icon className="h-[18px] w-[18px] text-trust" />
                  <p className="mt-2 text-xl font-bold text-navy">{value}</p>
                  <p className="text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-muted">
              Illustrative sample data for demonstration purposes.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}