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
} from "lucide-react";

const WORKFLOW = [
  { icon: User, title: "Citizen", desc: "Scans a product and notices an issue" },
  { icon: FileWarning, title: "Report", desc: "Submits a report with evidence" },
  { icon: UserCheck, title: "Reviewer", desc: "Screens the report for validity" },
  { icon: BadgeCheck, title: "Verify", desc: "Confirms it warrants inspection" },
  { icon: Building, title: "Inspector", desc: "Assigned for on-ground follow-up" },
  { icon: ClipboardCheck, title: "Inspect", desc: "Conducts a formal inspection" },
  { icon: Archive, title: "Official Record", desc: "Outcome is recorded" },
  { icon: History, title: "Compliance History", desc: "Added to the product's history" },
];

export default function LegalMetrologySection() {
  return (
    <section id="legal-metrology" className="bg-trust-light/50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-trust">Legal Metrology</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            From Citizen Report to Verified Inspection.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Citizen reports are reviewed for validity before being forwarded
            for official inspection. CheckItRight does not impose penalties —
            it connects citizens, reviewers, and inspectors under the Legal
            Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {WORKFLOW.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="relative flex flex-col items-center rounded-xl border border-line bg-surface p-4 text-center sm:p-5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-navy">{title}</h3>
              <p className="mt-1 text-xs leading-snug text-muted">{desc}</p>
              {i < WORKFLOW.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-trust sm:block"
                >
                  →
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}