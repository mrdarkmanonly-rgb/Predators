"use client";

import { motion } from "framer-motion";
import { ScanLine, PlayCircle, ShieldCheck, ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[#F7FAFC] py-20 lg:py-28">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: "#1769AA",
            opacity: 0.06,
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#1769AA 1px, transparent 1px), linear-gradient(90deg, #1769AA 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative overflow-hidden rounded-[28px] border border-[#1769AA]/20 bg-[#0B1F33] px-6 py-14 text-center shadow-[0_25px_80px_rgba(11,31,51,0.16)] sm:px-12 sm:py-16 lg:px-16 lg:py-20"
        >
          {/* Internal glow */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute left-1/2 top-[-180px] h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
              style={{
                background: "#1769AA",
                opacity: 0.18,
              }}
            />

            <div
              className="absolute bottom-[-180px] right-[-80px] h-80 w-80 rounded-full blur-3xl"
              style={{
                background: "#16A34A",
                opacity: 0.08,
              }}
            />

            {/* Technical grid */}
            <div
              className="absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(234,244,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(234,244,255,0.7) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />
          </div>

          {/* Scanning beam */}
          <motion.div
            initial={{ top: "-10%" }}
            animate={{ top: ["-10%", "110%"] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "linear",
            }}
            className="pointer-events-none absolute left-0 right-0 z-10 h-px bg-[#16A34A] opacity-20 shadow-[0_0_18px_rgba(22,163,74,0.5)]"
          />

          <div className="relative z-20">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 backdrop-blur"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]" />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#EAF4FF]">
                Start Checking
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Think Something Isn&apos;t{" "}
              <span className="text-[#16A34A]">Right?</span>
            </motion.h2>

            {/* Accent */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 64 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mx-auto mt-5 h-1 rounded-full bg-[#16A34A]"
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base"
            >
              Check it. Report it. Help build a safer and more transparent
              marketplace.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                type="button"
                className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#1769AA] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(23,105,170,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1769AA]/90 hover:shadow-[0_14px_35px_rgba(23,105,170,0.35)] active:translate-y-0 sm:w-auto"
              >
                <ScanLine className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-6" />

                Scan a Product

                <ArrowRight className="h-4 w-4 opacity-60 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <a
                href="#how-it-works"
                className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] sm:w-auto"
              >
                <PlayCircle className="h-[18px] w-[18px] text-[#EAF4FF] transition-transform duration-300 group-hover:scale-105" />

                Learn How It Works
              </a>
            </motion.div>

            {/* Trust line */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mt-8 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />

              <span className="text-[11px] text-white/40">
                AI-assisted checks • Evidence-based reporting • Official
                inspection support
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}