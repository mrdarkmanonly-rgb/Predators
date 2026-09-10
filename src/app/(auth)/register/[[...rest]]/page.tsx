"use client";

import { SignUp } from "@clerk/nextjs";
import {
  ArrowUpRight,
  Check,
  CircleDot,
  Fingerprint,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

const telemetry = [
  "LEGAL METROLOGY",
  "PACKAGED COMMODITIES",
  "DECLARATIONS",
  "MRP",
  "NET QUANTITY",
  "COMPLIANCE",
];

const dataPoints = [
  { label: "MRP", value: "₹245", x: "12%", y: "28%" },
  { label: "NET QTY", value: "500 g", x: "68%", y: "20%" },
  { label: "ORIGIN", value: "INDIA", x: "8%", y: "72%" },
  { label: "STATUS", value: "READY", x: "70%", y: "76%" },
];

const checks = [
  "Secure identity verification",
  "Consumer account protection",
  "Compliance network access",
];

export default function RegisterPage() {
  const shouldReduceMotion = useReducedMotion();
  const motionEnabled = !shouldReduceMotion;

  return (
    <main className="relative h-dvh overflow-hidden bg-[#F7FAFC] text-[#102A43]">
   
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-[#1769AA]/[0.035] blur-[100px]" />
        <div className="absolute right-[-180px] top-[-120px] h-[500px] w-[500px] rounded-full bg-[#16A34A]/[0.025] blur-[120px]" />

        <div className="absolute inset-0 hidden lg:block">
          <motion.div
            animate={
              motionEnabled
                ? {
                    y: [0, -25, 0],
                  }
                : undefined
            }
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-[4%] top-[16%] rotate-[-8deg] text-[8px] font-bold tracking-[0.4em] text-[#1769AA]/[0.08]"
          >
            {telemetry.map((item) => (
              <div key={item} className="mb-7">
                {item}
              </div>
            ))}
          </motion.div>

          <motion.div
            animate={
              motionEnabled
                ? {
                    y: [0, 25, 0],
                  }
                : undefined
            }
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-[4%] top-[12%] rotate-[8deg] text-right text-[8px] font-bold tracking-[0.4em] text-[#1769AA]/[0.08]"
          >
            {telemetry
              .slice()
              .reverse()
              .map((item) => (
                <div key={item} className="mb-7">
                  {item}
                </div>
              ))}
          </motion.div>
        </div>
      </div>

    
      <nav className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#D9E2EC]/80 bg-white/75 px-5 backdrop-blur-2xl sm:px-8 lg:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <motion.div
            whileHover={motionEnabled ? { rotate: 90 } : undefined}
            transition={{ duration: 0.35 }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1F33] text-white shadow-lg"
          >
            <ScanLine className="h-4.5 w-4.5" />

            <span className="absolute inset-0 rounded-xl border border-[#1769AA]/40" />
          </motion.div>

          <div>
            <div className="text-base font-black tracking-tight text-[#0B1F33]">
              Check<span className="text-[#1769AA]">It</span>Right
            </div>

            <div className="hidden text-[8px] font-semibold tracking-[0.22em] text-[#627D98] sm:block">
              LEGAL METROLOGY INTELLIGENCE
            </div>
          </div>
        </Link>

        <div className="text-xs text-[#627D98] sm:text-sm">
          Already registered?{" "}
          <Link
            href="/login"
            className="group inline-flex items-center gap-1 font-bold text-[#1769AA] transition-colors hover:text-[#0B1F33]"
          >
            Sign in
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

   
      <section className="relative z-10 mx-auto grid h-[calc(100dvh-4rem)] w-full max-w-[1450px] items-center overflow-hidden px-5 sm:px-8 lg:grid-cols-[1.1fr_0.8fr] lg:gap-8 lg:px-10 xl:grid-cols-[1fr_0.72fr] xl:gap-16">
 
        <div className="relative hidden h-full items-center lg:flex">
          <motion.div
            initial={motionEnabled ? { opacity: 0, x: -50 } : false}
            animate={motionEnabled ? { opacity: 1, x: 0 } : undefined}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="relative w-full"
          >
            <motion.div
              initial={motionEnabled ? { opacity: 0, y: 10 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D9E2EC] bg-white/80 px-3 py-1.5 text-[9px] font-black tracking-[0.18em] text-[#1769AA] shadow-sm backdrop-blur"
            >
              <CircleDot className="h-3 w-3 text-[#16A34A]" />
              SECURE REGISTRATION SYSTEM
            </motion.div>

            <motion.h1
              initial={motionEnabled ? { opacity: 0, y: 20 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.35, duration: 0.65 }}
              className="text-4xl font-black leading-[0.98] tracking-[-0.05em] text-[#0B1F33] xl:text-6xl"
            >
              Enter the
              <br />
              <span className="text-[#1769AA]">compliance network.</span>
            </motion.h1>

            <motion.p
              initial={motionEnabled ? { opacity: 0, y: 15 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-4 max-w-xl text-sm leading-6 text-[#627D98] xl:text-base"
            >
              Create your consumer identity and access intelligent
              packaged-commodity compliance verification.
            </motion.p>

      
            <div className="relative mt-6 h-[315px] w-full max-w-[690px] overflow-hidden rounded-[2rem] border border-[#D9E2EC] bg-[#0B1F33] shadow-[0_30px_100px_rgba(11,31,51,0.18)]">
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(#EAF4FF 1px, transparent 1px), linear-gradient(90deg, #EAF4FF 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />

              <div className="absolute left-5 top-5 h-5 w-5 border-l border-t border-[#1769AA]/60" />
              <div className="absolute right-5 top-5 h-5 w-5 border-r border-t border-[#1769AA]/60" />
              <div className="absolute bottom-5 left-5 h-5 w-5 border-b border-l border-[#1769AA]/60" />
              <div className="absolute bottom-5 right-5 h-5 w-5 border-b border-r border-[#1769AA]/60" />

              <motion.div
                animate={
                  motionEnabled
                    ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.08, 0.18, 0.08],
                      }
                    : undefined
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1769AA] blur-[90px]"
              />

              <motion.div
                animate={
                  motionEnabled
                    ? {
                        rotate: 360,
                      }
                    : undefined
                }
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-1/2 top-1/2 h-[245px] w-[245px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#1769AA]/50"
              />

              <motion.div
                animate={
                  motionEnabled
                    ? {
                        rotate: -360,
                      }
                    : undefined
                }
                transition={{
                  duration: 11,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#16A34A]/30"
              />

              <div className="absolute left-1/2 top-1/2 h-[265px] w-[265px] -translate-x-1/2 -translate-y-1/2">
                {[
                  ["left-1 top-1/2", "bg-[#16A34A]"],
                  ["right-1 top-1/2", "bg-[#1769AA]"],
                  ["left-1/2 top-1", "bg-[#1769AA]"],
                  ["left-1/2 bottom-1", "bg-[#16A34A]"],
                ].map(([position, color], index) => (
                  <motion.span
                    key={index}
                    animate={
                      motionEnabled
                        ? {
                            opacity: [0.3, 1, 0.3],
                            scale: [0.8, 1.2, 0.8],
                          }
                        : undefined
                    }
                    transition={{
                      duration: 2,
                      delay: index * 0.4,
                      repeat: Infinity,
                    }}
                    className={`absolute h-1.5 w-1.5 rounded-full ${position} ${color}`}
                  />
                ))}
              </div>

              <div className="absolute left-1/2 top-1/2 flex h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-[#1769AA]/70 bg-[#102A43]/95 shadow-[0_0_60px_rgba(23,105,170,0.3)]">
                <motion.div
                  animate={
                    motionEnabled
                      ? {
                          scale: [1, 1.08, 1],
                        }
                      : undefined
                  }
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Fingerprint className="h-9 w-9 text-[#16A34A]" />
                </motion.div>

                <span className="absolute inset-2 rounded-xl border border-[#16A34A]/20" />
              </div>

              <motion.div
                animate={
                  motionEnabled
                    ? {
                        y: [-110, 110, -110],
                        opacity: [0, 1, 1, 0],
                      }
                    : undefined
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-10 right-10 top-1/2 h-px bg-gradient-to-r from-transparent via-[#16A34A] to-transparent shadow-[0_0_18px_#16A34A]"
              />

              {dataPoints.map((point, index) => (
                <motion.div
                  key={point.label}
                  initial={
                    motionEnabled
                      ? {
                          opacity: 0,
                          scale: 0.8,
                        }
                      : false
                  }
                  animate={
                    motionEnabled
                      ? {
                          opacity: 1,
                          scale: 1,
                        }
                      : undefined
                  }
                  transition={{
                    delay: 1 + index * 0.2,
                    duration: 0.5,
                  }}
                  style={{
                    left: point.x,
                    top: point.y,
                  }}
                  className="absolute rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur-md"
                >
                  <div className="text-[7px] font-bold tracking-[0.2em] text-[#627D98]">
                    {point.label}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                    {point.value}
                  </div>
                </motion.div>
              ))}

              <div className="absolute left-6 top-6 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#16A34A]" />
                <span className="text-[8px] font-bold tracking-[0.25em] text-white/60">
                  SYSTEM ONLINE
                </span>
              </div>

              <motion.div
                animate={
                  motionEnabled
                    ? {
                        opacity: [0.5, 1, 0.5],
                      }
                    : undefined
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-[0.3em] text-[#16A34A]"
              >
                IDENTITY VERIFICATION READY
              </motion.div>
            </div>

            <div className="mt-4 flex gap-6">
              {checks.map((item, index) => (
                <motion.div
                  key={item}
                  initial={motionEnabled ? { opacity: 0, y: 10 } : false}
                  animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                    delay: 1.8 + index * 0.12,
                    duration: 0.45,
                  }}
                  className="flex items-center gap-2 text-[10px] font-medium text-[#627D98]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF4FF]">
                    <Check className="h-3 w-3 text-[#1769AA]" />
                  </span>

                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>


        <motion.div
          initial={
            motionEnabled
              ? {
                  opacity: 0,
                  x: 35,
                }
              : false
          }
          animate={
            motionEnabled
              ? {
                  opacity: 1,
                  x: 0,
                }
              : undefined
          }
          transition={{
            duration: 0.8,
            delay: 0.35,
            ease: "easeOut",
          }}
          className="flex w-full items-center justify-center"
        >
          <div className="relative w-full max-w-[420px]">
            <motion.div
              animate={
                motionEnabled
                  ? {
                      opacity: [0.2, 0.4, 0.2],
                      scale: [0.95, 1.05, 0.95],
                    }
                  : undefined
              }
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-[#1769AA]/10 blur-3xl"
            />

            <div className="relative mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.18em] text-[#627D98]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                SECURE ACCESS
              </div>

              <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#16A34A]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16A34A]" />
                ENCRYPTED
              </div>
            </div>

            <div className="relative">
              <SignUp
                routing="path"
                path="/register"
                signInUrl="/login"
                appearance={{
                  variables: {
                    colorPrimary: "#1769AA",
                    colorBackground: "#FFFFFF",
                    borderRadius: "0.85rem",
                  },

                  elements: {
                    rootBox: "w-full",
                    cardBox: "w-full shadow-[0_25px_80px_rgba(11,31,51,0.12)]",
                    card: "w-full rounded-[1.5rem] border border-[#D9E2EC] shadow-none",
                    headerTitle: "font-black tracking-tight text-[#0B1F33]",
                    headerSubtitle: "text-[#627D98]",
                    socialButtonsBlockButton:
                      "h-11 rounded-xl border-[#D9E2EC] bg-white font-semibold transition-all hover:border-[#1769AA] hover:bg-[#EAF4FF]",
                    formFieldInput:
                      "h-11 rounded-xl border-[#D9E2EC] bg-white focus:border-[#1769AA] focus:ring-[#1769AA]/20",
                    formButtonPrimary:
                      "h-11 rounded-xl bg-[#1769AA] font-bold shadow-none transition-all hover:bg-[#0B1F33]",
                    footerActionLink:
                      "font-bold text-[#1769AA] hover:text-[#0B1F33]",
                    identityPreviewEditButton: "font-bold text-[#1769AA]",
                  },
                }}
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-[9px] font-medium text-[#627D98]">
              <LockKeyhole className="h-3 w-3 text-[#16A34A]" />
              Your authentication is securely managed
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
