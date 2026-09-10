"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import {
  Search,
  ArrowRight,
  AlertTriangle,
  ScanSearch,
} from "lucide-react";

const PROBLEMS = [
  {
    image: "/images/product-mrp.png",
    title: "Incorrect or misleading MRP",
    description: "Pricing declarations can be unclear or misleading.",
    tone: "danger" as const,
  },
  {
    image: "/images/product-label.png",
    title: "Missing mandatory declarations",
    description: "Important manufacturer or importer details may be missing.",
    tone: "danger" as const,
  },
  {
    image: "/images/product-net-quantity.png",
    title: "Unclear net quantity or date information",
    description: "Quantity and date declarations are easy to overlook.",
    tone: "warning" as const,
  },
  {
    image: "/images/details.png",
    title: "Difficult manual verification",
    description: "Checking every declaration manually takes time and effort.",
    tone: "warning" as const,
    overlayIcon: true,
  },
];

const toneClasses = {
  danger: {
    dot: "bg-[#DC2626]",
    text: "text-[#DC2626]",
    bg: "bg-[#DC2626]/10",
    border: "border-[#DC2626]/15",
  },
  warning: {
    dot: "bg-[#F59E0B]",
    text: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/15",
  },
};

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function ProblemSection() {
  return (
    <section
      id="problem"
      className="relative isolate overflow-hidden bg-[#F7FAFC] py-20 lg:py-28"
    >
      {/* ================= BACKGROUND ================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Soft blue atmosphere */}
        <div className="absolute -left-40 top-20 h-[26rem] w-[26rem] rounded-full bg-[#1769AA]/5 blur-3xl" />

        {/* Soft warning atmosphere */}
        <div className="absolute -bottom-40 right-0 h-[24rem] w-[24rem] rounded-full bg-[#F59E0B]/5 blur-3xl" />

        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#0B1F33 1px, transparent 1px), linear-gradient(90deg, #0B1F33 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          {/* ================= LEFT ================= */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-xl"
          >
            {/* Section label */}
            <motion.div variants={item}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DC2626]/15 bg-[#DC2626]/5 px-3.5 py-1.5">
                <motion.span
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.65, 1, 0.65],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-[#DC2626]"
                />

                <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                  The Problem
                </span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={item}
              className="mt-5 text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-[#0B1F33] sm:text-4xl lg:text-5xl"
            >
              Important Details.
              <br />
              <span className="text-[#627D98]">Easy to Miss.</span>
            </motion.h2>

            {/* Accent line */}
            <motion.div
              variants={item}
              className="mt-5 h-1 w-16 overflow-hidden rounded-full bg-[#D9E2EC]"
            >
              <motion.div
                initial={{ x: "-100%" }}
                whileInView={{ x: "0%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full w-full rounded-full bg-[#1769AA]"
              />
            </motion.div>

            {/* Description */}
            <motion.p
              variants={item}
              className="mt-6 text-base leading-7 text-[#627D98] sm:text-lg"
            >
              Many packaged products carry missing, unclear, or incorrect
              declarations — including manufacturer, packer, or importer
              details. Without close inspection, consumers have no reliable
              way to verify whether a product actually complies with Legal
              Metrology requirements.
            </motion.p>

            {/* CTA */}
            <motion.a
              variants={item}
              href="#what-we-check"
              whileHover={{ x: 5 }}
              className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#1769AA]"
            >
              See what we check

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>

            {/* Small technical status */}
            <motion.div
              variants={item}
              className="mt-9 flex items-center gap-3 border-t border-[#D9E2EC] pt-5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF4FF]">
                <ScanSearch className="h-4 w-4 text-[#1769AA]" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#627D98]">
                  Verification Challenge
                </p>
                <p className="mt-0.5 text-xs font-semibold text-[#102A43]">
                  Manual inspection is time-consuming
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* ================= RIGHT / CARDS ================= */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {PROBLEMS.map(
              ({ image, title, description, tone, overlayIcon }, index) => {
                const colors = toneClasses[tone];

                return (
                  <motion.div
                    key={title}
                    variants={item}
                    whileHover={{
                      y: -7,
                      transition: { duration: 0.25 },
                    }}
                    className="group overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-[#0B1F33]/8"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAF4FF]">
                      <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(min-width: 1024px) 18rem, 45vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* Image overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/20 via-transparent to-transparent opacity-60" />

                      {/* Problem indicator */}
                      <motion.span
                        animate={{
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          delay: index * 0.25,
                        }}
                        className={`absolute left-3 top-3 h-2.5 w-2.5 rounded-full ${colors.dot} ring-4 ring-white/70`}
                        aria-hidden
                      />

                      {/* Search overlay */}
                      {overlayIcon && (
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          whileHover={{ scale: 1.08 }}
                          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/90 shadow-lg backdrop-blur"
                        >
                          <Search className="h-4 w-4 text-[#1769AA]" />
                        </motion.span>
                      )}

                      {/* Scan line */}
                      <motion.div
                        initial={{ top: "-5%" }}
                        whileInView={{ top: "105%" }}
                        viewport={{ once: false }}
                        transition={{
                          duration: 2.8,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeInOut",
                        }}
                        className="absolute left-0 right-0 h-px bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.border} border`}
                        >
                          <AlertTriangle
                            className={`h-3.5 w-3.5 ${colors.text}`}
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold leading-snug text-[#102A43]">
                            {title}
                          </h3>

                          <p className="mt-1.5 text-xs leading-5 text-[#627D98]">
                            {description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}