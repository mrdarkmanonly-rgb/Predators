"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import {
  ScanLine,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Users,
  Sparkles,
} from "lucide-react";

const RESULT_ROWS = [
  { label: "MRP", ok: true },
  { label: "Net Quantity", ok: true },
  { label: "Manufacturer", ok: true },
  { label: "Country of Origin", ok: true },
  { label: "Best Before", ok: false },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Safer Products" },
  { icon: Users, label: "Stronger Consumer Rights" },
  { icon: Sparkles, label: "Transparent Marketplace" },
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
    y: 16,
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

export default function Hero() {
  return (
    <section id="home" className="bg-bg">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
        {/* Left: copy */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-xl"
        >
          <motion.span
            variants={item}
            className="inline-block rounded-full bg-trust-light px-3 py-1 text-xs font-semibold text-trust"
          >
            For a Safer, Fairer Marketplace
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-navy sm:text-5xl"
          >
            Know What You Buy.
            <br />
            <span className="text-success">Check It Right.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 text-lg leading-relaxed text-muted"
          >
            Scan packaged products and instantly check their mandatory
            declarations against Legal Metrology requirements.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg bg-trust px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              <ScanLine className="h-[18px] w-[18px]" />
              Scan a Product
            </button>

            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 rounded-lg border border-line bg-surface px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:border-trust hover:text-trust"
            >
              <PlayCircle className="h-[18px] w-[18px]" />
              Learn How It Works
            </a>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            variants={item}
            className="mt-10 grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-3"
          >
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="h-5 w-5 shrink-0 text-success" />
                <span className="text-sm font-medium text-ink">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: scan visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            delay: 0.2,
          }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          {/* Flow label */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium text-muted">
            <span>Product</span>
            <span className="text-trust">→</span>
            <span>Scan</span>
            <span className="text-trust">→</span>
            <span>AI + OCR</span>
            <span className="text-trust">→</span>
            <span>Check</span>
            <span className="text-trust">→</span>
            <span className="text-navy">Result</span>
          </div>

          {/* Photo composition: product + phone scanning it */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-line bg-trust-light shadow-xl shadow-navy/5">
            {/* Base photo: the packaged product being scanned */}
            <Image
              src="/images/hero-product.png"
              alt="Packaged product being scanned for compliance"
              fill
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="object-cover"
              priority
            />

            {/* Foreground photo: phone/camera scanning the label */}
            <div className="absolute bottom-4 right-4 h-32 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-lg sm:h-40 sm:w-28">
              <Image
                src="/images/scan-phone.png"
                alt="Phone camera scanning the product label"
                fill
                sizes="10rem"
                className="object-cover"
              />
            </div>

            {/* Result card overlay */}
            <div className="absolute bottom-4 left-4 w-[13.5rem] rounded-xl border border-line bg-surface/95 p-4 shadow-lg backdrop-blur sm:w-64">
              <p className="mb-3 text-sm font-semibold text-navy">
                Product Compliance
              </p>

              <ul className="space-y-2">
                {RESULT_ROWS.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink/80">{row.label}</span>

                    {row.ok ? (
                      <CheckCircle2 className="h-[18px] w-[18px] text-success" />
                    ) : (
                      <AlertTriangle className="h-[18px] w-[18px] text-warning" />
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-warning/10 px-3 py-2">
                <span className="text-xs font-medium text-navy">
                  Overall Status
                </span>

                <span className="text-xs font-bold uppercase tracking-wide text-warning">
                  Needs Review
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}