"use client";

import { motion } from "framer-motion";
import { ScanLine, PlayCircle } from "lucide-react";

export default function CTASection() {
  return (
    <section className="bg-bg py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-navy px-6 py-14 text-center sm:px-12 sm:py-16"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Think Something Isn&apos;t Right?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/70">
            Check it. Report it. Help build a safer and more transparent
            marketplace.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg bg-trust px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              <ScanLine className="h-[18px] w-[18px]" />
              Scan a Product
            </button>
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <PlayCircle className="h-[18px] w-[18px]" />
              Learn How It Works
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}