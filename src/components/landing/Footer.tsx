"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ShieldCheck,
  ScanLine,
} from "lucide-react";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Home", href: "#" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "What We Check", href: "#what-we-check" },
      { label: "Legal Metrology", href: "#legal-metrology" },
    ],
  },
  {
    title: "For Citizens",
    links: [
      { label: "Scan Product", href: "#scan" },
      { label: "Report Issue", href: "#report" },
      { label: "Track Report", href: "#track" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Contact", href: "#contact" },
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Use", href: "#terms" },
    ],
  },
];

const bubbles = [
  { left: "8%", size: 3, delay: 0 },
  { left: "25%", size: 2, delay: 0.15 },
  { left: "42%", size: 4, delay: 0.05 },
  { left: "61%", size: 2.5, delay: 0.22 },
  { left: "78%", size: 3, delay: 0.1 },
  { left: "92%", size: 2, delay: 0.3 },
];

function FooterLink({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <motion.a
      href={href}
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="group relative inline-flex w-fit items-center gap-1 py-0.5 text-sm text-white/45"
    >
      {/* Link text */}
      <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
        {label}
      </span>

      {/* Arrow */}
      <ArrowUpRight className="relative z-10 h-3 w-3 opacity-0 -translate-x-1 translate-y-1 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-[#16A34A] group-hover:opacity-100" />

      {/* Animated underline */}
      <motion.span
        variants={{
          rest: {
            scaleX: 0,
            opacity: 0,
          },
          hover: {
            scaleX: 1,
            opacity: 1,
          },
        }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-center rounded-full bg-[#16A34A]"
      />

      {/* Floating bubbles */}
      <span className="pointer-events-none absolute -bottom-1 left-0 right-0 h-7 overflow-visible">
        {bubbles.map((bubble, index) => (
          <motion.span
            key={index}
            variants={{
              rest: {
                y: 2,
                opacity: 0,
                scale: 0.3,
              },
              hover: {
                y: -18 - (index % 3) * 5,
                opacity: [0, 0.8, 0],
                scale: [0.4, 1, 0.7],
              },
            }}
            transition={{
              duration: 0.9 + (index % 3) * 0.15,
              delay: bubble.delay,
              ease: "easeOut",
            }}
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
            }}
            className="absolute rounded-full bg-[#16A34A] shadow-[0_0_8px_rgba(22,163,74,0.7)]"
          />
        ))}
      </span>
    </motion.a>
  );
}

export default function Footer() {
  return (
    <footer
      id="about"
      className="relative mt-auto overflow-hidden bg-[#0B1F33] text-white/70"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute right-[-10%] top-[-20%] h-96 w-96 rounded-full blur-3xl"
          style={{
            background: "#1769AA",
            opacity: 0.09,
          }}
        />

        <div
          className="absolute bottom-[-25%] left-[-5%] h-80 w-80 rounded-full blur-3xl"
          style={{
            background: "#16A34A",
            opacity: 0.045,
          }}
        />

        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(234,244,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(234,244,255,0.8) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        {/* Main footer */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <a href="#" className="group inline-flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-2 transition-all duration-300 group-hover:border-[#16A34A]/30 group-hover:bg-white/[0.09]">
                <Image
                  src="/images/logo.png"
                  alt="CheckItRight logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />

                <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />
              </span>

              <span className="text-xl font-bold tracking-tight text-white">
                CheckIt<span className="text-[#16A34A]">Right</span>
              </span>
            </a>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">
              AI-assisted packaged commodity compliance platform helping
              consumers understand labels, identify potential issues, and
              support evidence-based reporting.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
                Evidence-based compliance
              </span>
            </div>
          </motion.div>

          {/* Link columns */}
          {COLUMNS.map((col, columnIndex) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.45,
                delay: 0.08 * (columnIndex + 1),
              }}
            >
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white">
                {col.title}
              </h3>

              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink
                      label={link.label}
                      href={link.href}
                    />
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-5 sm:flex-row sm:items-center sm:px-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1769AA]/15 text-[#1769AA]">
              <ScanLine className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-semibold text-white/85">
                Something doesn&apos;t look right?
              </p>

              <p className="mt-0.5 text-[11px] text-white/40">
                Scan the product and check its declarations.
              </p>
            </div>
          </div>

          <a
            href="/scan"
            className="group inline-flex items-center gap-2 rounded-lg bg-[#1769AA] px-4 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1769AA]/90 hover:shadow-[0_8px_25px_rgba(23,105,170,0.25)]"
          >
            Scan a Product

            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>

        {/* Bottom */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-white/45">
                © 2026 CheckItRight. Built for Smart India Hackathon — PS34.
              </p>

              <p className="mt-1 text-white/25">
                CheckItRight is not an official government website.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]" />
              </span>

              GovTech Compliance Platform
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}