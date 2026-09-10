"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  ScanLine,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  ScanSearch,
  Cpu,
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
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut",
    },
  },
};

export default function Hero() {
  const router = useRouter(); 
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-[#F7FAFC]"
    >
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#1769AA]/5 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-[#16A34A]/5 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#0B1F33 1px, transparent 1px), linear-gradient(90deg, #0B1F33 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl grid-cols-1 items-center gap-12 px-5 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
        {/* ================= LEFT ================= */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-2xl"
        >
          {/* Eyebrow */}
          <motion.div variants={item}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1769AA]/15 bg-[#EAF4FF] px-3.5 py-1.5">
              <motion.span
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-1.5 w-1.5 rounded-full bg-[#16A34A]"
              />

              <span className="text-xs font-semibold tracking-wide text-[#1769AA]">
                LEGAL METROLOGY • AI COMPLIANCE
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={item}
            className="mt-6 text-4xl font-bold leading-[1.06] tracking-[-0.035em] text-[#0B1F33] sm:text-5xl lg:text-[4.25rem]"
          >
            Know What
            <br />
            You Buy.
            <br />
            <span className="relative inline-block text-[#16A34A]">
              Check It Right.
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  delay: 1,
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="absolute -bottom-1 left-0 h-1 rounded-full bg-[#16A34A]/20"
              />
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base leading-7 text-[#627D98] sm:text-lg"
          >
            Scan packaged products and instantly verify mandatory declarations
            against Legal Metrology requirements — powered by AI and OCR.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <motion.button
              type="button"
              onClick={() => router.push("/scan")} 
              whileHover={{
                y: -3,
                boxShadow: "0 14px 30px rgba(23,105,170,0.20)",
              }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#1769AA] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1769AA]/10"
            >
              <ScanLine className="h-[18px] w-[18px]" />

              Scan a Product

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>

            <motion.a
              href="#how-it-works"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#D9E2EC] bg-white px-6 py-3.5 text-sm font-semibold text-[#0B1F33] shadow-sm transition-colors duration-300 hover:border-[#1769AA]/40 hover:text-[#1769AA]"
            >
              <PlayCircle className="h-[18px] w-[18px]" />
              Learn How It Works
            </motion.a>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            variants={item}
            className="mt-10 grid grid-cols-1 gap-4 border-t border-[#D9E2EC] pt-6 sm:grid-cols-3"
          >
            {TRUST_ITEMS.map(({ icon: Icon, label }, index) => (
              <motion.div
                key={label}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="group flex items-center gap-2.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF4FF] transition-colors duration-300 group-hover:bg-[#1769AA]/10">
                  <Icon className="h-[18px] w-[18px] text-[#16A34A]" />
                </div>

                <span className="text-xs font-semibold text-[#102A43] sm:text-sm">
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ================= RIGHT ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.25,
          }}
          className="relative mx-auto w-full max-w-md"
        >
          {/* Floating scan status */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute -right-3 -top-5 z-20 hidden rounded-xl border border-[#D9E2EC] bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur sm:block"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <motion.span
                  animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 rounded-full bg-[#16A34A]"
                />
                <span className="relative h-2 w-2 rounded-full bg-[#16A34A]" />
              </span>

              <span className="text-[11px] font-bold tracking-wide text-[#102A43]">
                AI SCANNER READY
              </span>
            </div>
          </motion.div>

          {/* Flow */}
          <div className="mb-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-wide text-[#627D98] sm:text-xs">
            <span>Product</span>
            <ArrowRight className="h-3 w-3 text-[#1769AA]" />
            <span>Scan</span>
            <ArrowRight className="h-3 w-3 text-[#1769AA]" />
            <span>AI + OCR</span>
            <ArrowRight className="h-3 w-3 text-[#1769AA]" />
            <span>Check</span>
            <ArrowRight className="h-3 w-3 text-[#1769AA]" />
            <span className="text-[#0B1F33]">Result</span>
          </div>

          {/* Main visual */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-[#D9E2EC] bg-[#EAF4FF] shadow-2xl shadow-[#0B1F33]/10">
            {/* Image */}
            <Image
              src="/images/hero-product.png"
              alt="Packaged product being scanned for compliance"
              fill
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="object-cover"
              priority
            />

            {/* Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/25 via-transparent to-transparent" />

            {/* Scanning beam */}
            <motion.div
              initial={{ top: "8%" }}
              animate={{ top: ["8%", "88%", "8%"] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-5 right-5 z-10 h-px bg-[#16A34A] shadow-[0_0_12px_rgba(22,163,74,0.7)]"
            />

            {/* Scanner corners */}
            <div className="absolute left-5 top-5 h-8 w-8 border-l-2 border-t-2 border-white/80" />
            <div className="absolute right-5 top-5 h-8 w-8 border-r-2 border-t-2 border-white/80" />
            <div className="absolute bottom-5 left-5 h-8 w-8 border-b-2 border-l-2 border-white/80" />
            <div className="absolute bottom-5 right-5 h-8 w-8 border-b-2 border-r-2 border-white/80" />

            {/* Scan indicator */}
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/30 bg-[#0B1F33]/70 px-3 py-1.5 backdrop-blur"
            >
              <ScanSearch className="h-3.5 w-3.5 text-white" />
              <span className="text-[9px] font-bold tracking-widest text-white">
                SCANNING
              </span>
            </motion.div>

            {/* Phone */}
            <motion.div
              animate={{
                y: [0, -7, 0],
                rotate: [0, 1, 0, -1, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-4 right-4 h-32 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-2xl sm:h-40 sm:w-28"
            >
              <Image
                src="/images/scan-phone.png"
                alt="Phone camera scanning the product label"
                fill
                sizes="10rem"
                className="object-cover"
              />
            </motion.div>

            {/* Result card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1,
                duration: 0.6,
              }}
              className="absolute bottom-4 left-4 z-10 w-[13rem] rounded-2xl border border-[#D9E2EC] bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:w-64"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#0B1F33]">
                  Product Compliance
                </p>

                <Cpu className="h-4 w-4 text-[#1769AA]" />
              </div>

              <ul className="space-y-2">
                {RESULT_ROWS.map((row, index) => (
                  <motion.li
                    key={row.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 1.15 + index * 0.08,
                    }}
                    className="flex items-center justify-between text-xs sm:text-sm"
                  >
                    <span className="text-[#102A43]/80">
                      {row.label}
                    </span>

                    {row.ok ? (
                      <CheckCircle2 className="h-[17px] w-[17px] text-[#16A34A]" />
                    ) : (
                      <AlertTriangle className="h-[17px] w-[17px] text-[#F59E0B]" />
                    )}
                  </motion.li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-[#F59E0B]/10 px-3 py-2">
                <span className="text-[10px] font-semibold text-[#0B1F33]">
                  Overall Status
                </span>

                <span className="text-[10px] font-bold uppercase tracking-wide text-[#F59E0B]">
                  Needs Review
                </span>
              </div>
            </motion.div>
          </div>

          {/* Bottom floating badge */}
          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-4 right-5 hidden rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2.5 shadow-xl sm:block"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF4FF]">
                <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#627D98]">
                  Compliance Engine
                </p>
                <p className="text-xs font-bold text-[#0B1F33]">
                  Rule Check Active
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}