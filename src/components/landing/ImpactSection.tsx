"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck, Crown, Trophy } from "lucide-react";

const BADGES = [
  { icon: Star, title: "First Valid Report" },
  { icon: ShieldCheck, title: "Trusted Reporter" },
  { icon: Crown, title: "Consumer Guardian" },
  { icon: Trophy, title: "Compliance Champion" },
];

export default function ImpactSection() {
  return (
    <section className="bg-navy py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Turn Checking Into Social Impact.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Genuine, verified citizen contributions are recognised —
              rewards are based on validated reports, not raw complaint
              volume.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {BADGES.map(({ icon: Icon, title }) => (
              <motion.div
                key={title}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                }}
                className="flex w-32 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-center"
              >
                <Icon className="h-6 w-6 text-success" />
                <span className="text-xs font-medium leading-snug text-white/90">
                  {title}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}