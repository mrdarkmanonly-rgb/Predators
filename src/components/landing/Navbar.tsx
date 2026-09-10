"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ScanLine,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "What We Check", href: "#what-we-check" },
  { label: "Legal Metrology", href: "#legal-metrology" },
  { label: "About", href: "#about" },
];

/* -------------------------------------------------------
   Continuous background bubbles
------------------------------------------------------- */

const BUBBLES = [
  { left: "4%", size: 3, duration: 7, delay: 0 },
  { left: "11%", size: 2, duration: 9, delay: 2 },
  { left: "19%", size: 4, duration: 8, delay: 1 },
  { left: "28%", size: 2, duration: 10, delay: 4 },
  { left: "36%", size: 3, duration: 7, delay: 3 },
  { left: "45%", size: 2, duration: 9, delay: 0.5 },
  { left: "54%", size: 4, duration: 8, delay: 5 },
  { left: "63%", size: 2, duration: 10, delay: 2.5 },
  { left: "72%", size: 3, duration: 8, delay: 1.5 },
  { left: "81%", size: 2, duration: 9, delay: 4.5 },
  { left: "89%", size: 4, duration: 7, delay: 2 },
  { left: "96%", size: 2, duration: 10, delay: 6 },
];

/* -------------------------------------------------------
   Reusable nav link
------------------------------------------------------- */

function NavLink({
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
      className="group relative flex items-center py-2 text-sm font-medium text-[#102A43]/75 transition-colors duration-300 hover:text-[#1769AA]"
    >
      <span className="relative z-10">{label}</span>

      {/* Arrow appears on hover */}
      <motion.span
        variants={{
          rest: {
            opacity: 0,
            x: -4,
            y: 2,
          },
          hover: {
            opacity: 1,
            x: 3,
            y: -1,
          },
        }}
        transition={{ duration: 0.25 }}
      >
        <ArrowUpRight className="ml-1 h-3 w-3 text-[#16A34A]" />
      </motion.span>

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
        className="absolute bottom-0 left-0 h-[2px] w-full origin-center rounded-full bg-[#16A34A]"
      />

      {/* Hover bubbles */}
      <span className="pointer-events-none absolute -bottom-1 left-0 right-0 h-8 overflow-visible">
        {[0, 1, 2].map((bubble) => (
          <motion.span
            key={bubble}
            variants={{
              rest: {
                opacity: 0,
                y: 2,
                scale: 0.3,
              },
              hover: {
                opacity: [0, 0.8, 0],
                y: [-1, -9, -17],
                scale: [0.3, 1, 0.6],
              },
            }}
            transition={{
              duration: 0.8 + bubble * 0.15,
              delay: bubble * 0.12,
              ease: "easeOut",
            }}
            style={{
              left: `${20 + bubble * 30}%`,
              width: `${2 + bubble}px`,
              height: `${2 + bubble}px`,
            }}
            className="absolute rounded-full bg-[#16A34A] shadow-[0_0_7px_rgba(22,163,74,0.55)]"
          />
        ))}
      </span>
    </motion.a>
  );
}

/* -------------------------------------------------------
   Navbar
------------------------------------------------------- */

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 border-b border-[#D9E2EC]/80 bg-white/90 backdrop-blur-xl">
      {/* Continuous atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft blue glow */}
        <div
          className="absolute left-[20%] top-1/2 h-20 w-64 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: "#1769AA",
            opacity: 0.035,
          }}
        />

        {/* Continuous bubbles */}
        {BUBBLES.map((bubble, index) => (
          <motion.span
            key={index}
            initial={{
              y: 45,
              opacity: 0,
            }}
            animate={{
              y: [-5, -45],
              opacity: [0, 0.35, 0],
            }}
            transition={{
              duration: bubble.duration,
              delay: bubble.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
            }}
            className="absolute bottom-0 rounded-full bg-[#16A34A] shadow-[0_0_8px_rgba(22,163,74,0.35)]"
          />
        ))}
      </div>

      {/* Navbar */}
      <motion.div
        initial={{
          y: -16,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        {/* Logo */}
        <Link
          href="#home"
          className="group flex items-center gap-2.5"
        >
          <motion.span
            whileHover={{
              scale: 1.06,
              rotate: 2,
            }}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#D9E2EC] bg-[#F7FAFC] p-1.5 shadow-sm transition-all duration-300 group-hover:border-[#1769AA]/30 group-hover:shadow-[0_4px_18px_rgba(23,105,170,0.12)]"
          >
            <Image
              src="/images/logo.png"
              alt="CheckItRight logo"
              fill
              sizes="36px"
              className="object-contain"
              priority
            />

            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-[#1769AA]/5" />
          </motion.span>

          <span className="text-lg font-bold tracking-tight text-[#102A43]">
            CheckIt
            <span className="text-[#1769AA]">Right</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              label={link.label}
              href={link.href}
            />
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="group relative px-2 py-2 text-sm font-medium text-[#102A43]/75 transition-colors hover:text-[#1769AA]"
          >
            Login

            <span className="absolute bottom-0 left-2 right-2 h-px origin-center scale-x-0 bg-[#16A34A] transition-transform duration-300 group-hover:scale-x-100" />
          </Link>

          <Link
            href="/register"
            className="group relative overflow-hidden rounded-xl border border-[#1769AA]/30 bg-white px-4 py-2 text-sm font-semibold text-[#1769AA] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1769AA]/50 hover:bg-[#EAF4FF] hover:shadow-[0_6px_20px_rgba(23,105,170,0.1)]"
          >
            <span className="relative z-10">Register</span>

            <motion.span
              initial={{ x: "-120%" }}
              whileHover={{ x: "120%" }}
              transition={{ duration: 0.6 }}
              className="absolute inset-y-0 w-1/3 skew-x-12 bg-white/60"
            />
          </Link>

          {/* Scan button */}
          <motion.button
            type="button"
            onClick={() => router.push("/scan")} 
            whileHover={{
              y: -2,
            }}
            whileTap={{
              y: 0,
              scale: 0.98,
            }}
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-[#1769AA] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(23,105,170,0.18)]"
          >
            {/* Moving highlight */}
            <motion.span
              initial={{ x: "-120%" }}
              animate={{ x: "120%" }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
              className="absolute inset-y-0 w-1/3 skew-x-12 bg-white/10"
            />

            <ScanLine className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />

            <span className="relative z-10">
              Scan a Product
            </span>
          </motion.button>
        </div>

        {/* Mobile menu button */}
        <motion.button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          whileTap={{ scale: 0.92 }}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9E2EC] bg-white text-[#102A43] lg:hidden"
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </motion.button>
      </motion.div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden border-t border-[#D9E2EC] bg-white lg:hidden"
          >
            <div className="px-4 py-5 sm:px-6">
              {/* Mobile links */}
              <div className="flex flex-col">
                {NAV_LINKS.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    initial={{
                      opacity: 0,
                      x: -12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.3,
                    }}
                    className="group flex items-center justify-between border-b border-[#D9E2EC]/60 px-2 py-3.5 text-sm font-medium text-[#102A43] transition-colors hover:text-[#1769AA]"
                  >
                    <span>{link.label}</span>

                    <ArrowUpRight className="h-4 w-4 text-[#627D98] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#16A34A]" />
                  </motion.a>
                ))}
              </div>

              {/* Mobile actions */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-[#D9E2EC] px-4 py-3 text-center text-sm font-semibold text-[#102A43] transition-colors hover:bg-[#F7FAFC]"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-[#1769AA]/30 bg-[#EAF4FF] px-4 py-3 text-center text-sm font-semibold text-[#1769AA]"
                >
                  Register
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/scan");
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#1769AA] px-4 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(23,105,170,0.15)]"
                >
                  <ScanLine className="h-4 w-4" />
                  Scan a Product
                </button>
              </div>

              {/* Mobile status */}
              <div className="mt-5 flex items-center justify-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#627D98]">
                  AI-assisted compliance checking
                </span>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}