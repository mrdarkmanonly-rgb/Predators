"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ScanLine } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "What We Check", href: "#what-we-check" },
  { label: "Legal Metrology", href: "#legal-metrology" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur">
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        {/* Logo */}
        <Link href="#home" className="flex items-center gap-2">
          <span className="relative h-8 w-8 shrink-0">
            <Image
              src="/images/logo.png"
              alt="CheckItRight logo"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </span>
          <span className="text-lg font-bold tracking-tight text-navy">
            CheckItRight
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-ink/80 transition-colors hover:text-trust"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            className="text-sm font-medium text-navy transition-colors hover:text-trust"
          >
            Login
          </button>
          <button
            type="button"
            className="rounded-lg border border-trust px-4 py-2 text-sm font-medium text-trust transition-colors hover:bg-trust-light"
          >
            Register
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-trust px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            <ScanLine className="h-4 w-4" />
            Scan a Product
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </motion.div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-line bg-surface lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-trust-light hover:text-trust"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
                <button
                  type="button"
                  className="w-full rounded-lg border border-line px-4 py-3 text-sm font-medium text-navy"
                >
                  Login
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg border border-trust px-4 py-3 text-sm font-medium text-trust"
                >
                  Register
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-trust px-4 py-3 text-sm font-semibold text-white"
                >
                  <ScanLine className="h-4 w-4" />
                  Scan a Product
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}