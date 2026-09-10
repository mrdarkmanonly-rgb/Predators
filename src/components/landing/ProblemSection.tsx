"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const PROBLEMS = [
  {
    image: "/images/product-mrp.png",
    title: "Incorrect or misleading MRP",
    tone: "danger" as const,
  },
  {
    image: "/images/product-label.png",
    title: "Missing mandatory declarations",
    tone: "danger" as const,
  },
  {
    image: "/images/product-net-quantity.png",
    title: "Unclear net quantity or date information",
    tone: "warning" as const,
  },
  {
    image: "/images/details.png",
    title: "Difficult manual verification",
    tone: "warning" as const,
    overlayIcon: true,
  },
];

const toneClasses = {
  danger: { dot: "bg-danger", text: "text-danger" },
  warning: { dot: "bg-warning", text: "text-warning" },
};

export default function ProblemSection() {
  return (
    <section className="bg-bg py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <span className="text-sm font-semibold text-danger">
              The Problem
            </span>
            <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
              Important Details.
              <br />
              Easy to Miss.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Many packaged products carry missing, unclear, or incorrect
              declarations — including manufacturer, packer, or importer
              details. Without close inspection, consumers have no reliable
              way to verify whether a product actually complies with Legal
              Metrology requirements.
            </p>
            <a
              href="#what-we-check"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-trust hover:underline"
            >
              See what we check
              <span aria-hidden>→</span>
            </a>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {PROBLEMS.map(({ image, title, tone, overlayIcon }) => (
              <motion.div
                key={title}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                className="overflow-hidden rounded-xl border border-line bg-surface transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-trust-light">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(min-width: 640px) 12rem, 45vw"
                    className="object-cover"
                  />
                  {overlayIcon && (
                    <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow">
                      <Search className="h-4 w-4 text-trust" />
                    </span>
                  )}
                  <span
                    className={`absolute left-2 top-2 h-2.5 w-2.5 rounded-full ${toneClasses[tone].dot}`}
                    aria-hidden
                  />
                </div>
                <p className="p-4 text-sm font-medium leading-snug text-ink">
                  {title}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}