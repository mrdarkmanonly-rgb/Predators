"use client";

import { SignIn } from "@clerk/nextjs";
import { motion, useReducedMotion } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Fingerprint,
  Lock,
  ScanLine,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import Link from "next/link";

const signals = [
  "IDENTITY",
  "SESSION",
  "SECURITY",
  "AUTHORIZATION",
];

const metrics = [
  { label: "IDENTITY", value: "VERIFIED", icon: Fingerprint },
  { label: "SESSION", value: "SECURE", icon: Lock },
  { label: "NETWORK", value: "ONLINE", icon: Wifi },
];

export default function LoginPage() {
  const shouldReduceMotion = useReducedMotion();
  const motionEnabled = !shouldReduceMotion;

  return (
    <main className="relative h-dvh overflow-hidden bg-[#F7FAFC] text-[#102A43]">
      {/* ====================================================== */}
      {/* AMBIENT BACKGROUND                                     */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/3 h-[550px] w-[550px] rounded-full bg-[#1769AA]/[0.035] blur-[120px]" />

        <div className="absolute right-[-180px] top-[-150px] h-[500px] w-[500px] rounded-full bg-[#16A34A]/[0.025] blur-[120px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#1769AA 1px, transparent 1px), linear-gradient(90deg, #1769AA 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Moving telemetry */}
        <div className="absolute inset-0 hidden lg:block">
          <motion.div
            animate={
              motionEnabled
                ? {
                    y: [0, -30, 0],
                  }
                : undefined
            }
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-[3%] top-[15%] rotate-[-7deg] text-[8px] font-black tracking-[0.4em] text-[#1769AA]/[0.07]"
          >
            {signals.map((signal) => (
              <div key={signal} className="mb-9">
                {signal}
              </div>
            ))}
          </motion.div>

          <motion.div
            animate={
              motionEnabled
                ? {
                    y: [0, 30, 0],
                  }
                : undefined
            }
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-[3%] top-[18%] rotate-[7deg] text-right text-[8px] font-black tracking-[0.4em] text-[#1769AA]/[0.07]"
          >
            {signals
              .slice()
              .reverse()
              .map((signal) => (
                <div key={signal} className="mb-9">
                  {signal}
                </div>
              ))}
          </motion.div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* NAVBAR                                                  */}
      {/* ====================================================== */}

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
          New here?{" "}
          <Link
            href="/register"
            className="group inline-flex items-center gap-1 font-bold text-[#1769AA] transition-colors hover:text-[#0B1F33]"
          >
            Create account
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

      {/* ====================================================== */}
      {/* MAIN                                                    */}
      {/* ====================================================== */}

      <section className="relative z-10 mx-auto grid h-[calc(100dvh-4rem)] w-full max-w-[1450px] items-center overflow-hidden px-5 sm:px-8 lg:grid-cols-[1.05fr_0.75fr] lg:gap-10 lg:px-10 xl:gap-20">
        {/* ================================================== */}
        {/* LEFT — SECURITY CONTROL CENTER                    */}
        {/* ================================================== */}

        <div className="relative hidden h-full items-center lg:flex">
          <motion.div
            initial={
              motionEnabled
                ? {
                    opacity: 0,
                    x: -60,
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
              duration: 0.9,
              ease: "easeOut",
            }}
            className="w-full"
          >
            {/* Status */}
            <motion.div
              initial={
                motionEnabled
                  ? {
                      opacity: 0,
                      y: 10,
                    }
                  : false
              }
              animate={
                motionEnabled
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : undefined
              }
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D9E2EC] bg-white/80 px-3 py-1.5 text-[9px] font-black tracking-[0.2em] text-[#1769AA] shadow-sm backdrop-blur"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A]/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]" />
              </span>
              SECURE ACCESS SYSTEM
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={
                motionEnabled
                  ? {
                      opacity: 0,
                      y: 20,
                    }
                  : false
              }
              animate={
                motionEnabled
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : undefined
              }
              transition={{
                delay: 0.35,
                duration: 0.7,
              }}
              className="text-4xl font-black leading-[0.96] tracking-[-0.055em] text-[#0B1F33] xl:text-6xl"
            >
              Welcome
              <br />
              <span className="text-[#1769AA]">back.</span>
            </motion.h1>

            <motion.p
              initial={
                motionEnabled
                  ? {
                      opacity: 0,
                      y: 15,
                    }
                  : false
              }
              animate={
                motionEnabled
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : undefined
              }
              transition={{
                delay: 0.5,
                duration: 0.6,
              }}
              className="mt-4 max-w-lg text-sm leading-6 text-[#627D98] xl:text-base"
            >
              Access your compliance intelligence workspace and
              continue protecting consumers through smarter verification.
            </motion.p>

            {/* ================================================= */}
            {/* SECURITY HUD                                      */}
            {/* ================================================= */}

            <div className="relative mt-7 h-[320px] max-w-[700px] overflow-hidden rounded-[2rem] border border-[#D9E2EC] bg-[#0B1F33] shadow-[0_30px_100px_rgba(11,31,51,0.18)]">
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(#EAF4FF 1px, transparent 1px), linear-gradient(90deg, #EAF4FF 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />

              {/* Scan glow */}
              <motion.div
                animate={
                  motionEnabled
                    ? {
                        scale: [1, 1.25, 1],
                        opacity: [0.08, 0.2, 0.08],
                      }
                    : undefined
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1769AA] blur-[100px]"
              />

              {/* Outer ring */}
              <motion.div
                animate={
                  motionEnabled
                    ? {
                        rotate: 360,
                      }
                    : undefined
                }
                transition={{
                  duration: 16,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-1/2 top-1/2 h-[255px] w-[255px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#1769AA]/60"
              />

              {/* Second ring */}
              <motion.div
                animate={
                  motionEnabled
                    ? {
                        rotate: -360,
                      }
                    : undefined
                }
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-1/2 top-1/2 h-[195px] w-[195px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#16A34A]/30"
              />

              {/* Third ring */}
              <motion.div
                animate={
                  motionEnabled
                    ? {
                        scale: [1, 1.08, 1],
                        opacity: [0.3, 0.7, 0.3],
                      }
                    : undefined
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 h-[145px] w-[145px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1769AA]/50"
              />

              {/* Center lock */}
              <div className="absolute left-1/2 top-1/2 flex h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-[#1769AA]/70 bg-[#102A43]/95 shadow-[0_0_65px_rgba(23,105,170,0.35)]">
                <motion.div
                  animate={
                    motionEnabled
                      ? {
                          scale: [1, 1.12, 1],
                        }
                      : undefined
                  }
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ShieldCheck className="h-9 w-9 text-[#16A34A]" />
                </motion.div>
              </div>

              {/* Horizontal scanner */}
              <motion.div
                animate={
                  motionEnabled
                    ? {
                        x: ["-45%", "45%", "-45%"],
                        opacity: [0, 1, 1, 0],
                      }
                    : undefined
                }
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 h-px w-[85%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#16A34A] to-transparent shadow-[0_0_18px_#16A34A]"
              />

              {/* Vertical scanner */}
              <motion.div
                animate={
                  motionEnabled
                    ? {
                        y: ["-90px", "90px", "-90px"],
                        opacity: [0, 0.7, 0],
                      }
                    : undefined
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
                className="absolute left-1/2 top-1/2 h-[80%] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#1769AA] to-transparent shadow-[0_0_14px_#1769AA]"
              />

              {/* Top system status */}
              <div className="absolute left-6 top-6 flex items-center gap-2">
                <Activity className="h-3 w-3 text-[#16A34A]" />

                <span className="text-[8px] font-bold tracking-[0.25em] text-white/60">
                  AUTHENTICATION CORE
                </span>
              </div>

              {/* Security status */}
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
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-[0.35em] text-[#16A34A]"
              >
                SYSTEM SECURE
              </motion.div>

              {/* Floating metric cards */}
              {metrics.map((metric, index) => {
                const Icon = metric.icon;

                return (
                  <motion.div
                    key={metric.label}
                    initial={
                      motionEnabled
                        ? {
                            opacity: 0,
                            scale: 0.85,
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
                    className={[
                      "absolute rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur-md",
                      index === 0
                        ? "left-5 top-20"
                        : index === 1
                          ? "right-5 top-24"
                          : index === 2
                            ? "bottom-20 left-5"
                            : "bottom-20 right-5",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3 w-3 text-[#1769AA]" />

                      <div>
                        <div className="text-[7px] font-bold tracking-[0.18em] text-[#627D98]">
                          {metric.label}
                        </div>

                        <div className="mt-0.5 text-[9px] font-bold text-white">
                          {metric.value}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust row */}
            <div className="mt-4 flex gap-7">
              {[
                "Encrypted session",
                "Secure authentication",
                "Protected access",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={
                    motionEnabled
                      ? {
                          opacity: 0,
                          y: 8,
                        }
                      : false
                  }
                  animate={
                    motionEnabled
                      ? {
                          opacity: 1,
                          y: 0,
                        }
                      : undefined
                  }
                  transition={{
                    delay: 1.8 + index * 0.12,
                    duration: 0.45,
                  }}
                  className="flex items-center gap-2 text-[10px] font-medium text-[#627D98]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ================================================== */}
        {/* RIGHT — CLERK SIGN IN                             */}
        {/* ================================================== */}

        <motion.div
          initial={
            motionEnabled
              ? {
                  opacity: 0,
                  x: 40,
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
            {/* Card glow */}
            <motion.div
              animate={
                motionEnabled
                  ? {
                      opacity: [0.15, 0.35, 0.15],
                      scale: [0.96, 1.04, 0.96],
                    }
                  : undefined
              }
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -inset-7 rounded-[3rem] bg-[#1769AA]/10 blur-3xl"
            />

            {/* Access header */}
            <div className="relative mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.2em] text-[#627D98]">
                <Lock className="h-3.5 w-3.5 text-[#1769AA]" />
                SECURE LOGIN
              </div>

              <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#16A34A]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16A34A]" />
                ONLINE
              </div>
            </div>

            <div className="relative">
              <SignIn
                routing="path"
                path="/login"
                signUpUrl="/register"
                
                appearance={{
                  variables: {
                    colorPrimary: "#1769AA",
                    colorBackground: "#FFFFFF",
                    borderRadius: "0.85rem",
                  },

                  elements: {
                    rootBox: "w-full",
                    cardBox:
                      "w-full shadow-[0_25px_80px_rgba(11,31,51,0.12)]",
                    card:
                      "w-full rounded-[1.5rem] border border-[#D9E2EC] shadow-none",
                    headerTitle:
                      "font-black tracking-tight text-[#0B1F33]",
                    headerSubtitle:
                      "text-[#627D98]",
                    socialButtonsBlockButton:
                      "h-11 rounded-xl border-[#D9E2EC] bg-white font-semibold transition-all hover:border-[#1769AA] hover:bg-[#EAF4FF]",
                    formFieldInput:
                      "h-11 rounded-xl border-[#D9E2EC] bg-white focus:border-[#1769AA] focus:ring-[#1769AA]/20",
                    formButtonPrimary:
                      "h-11 rounded-xl bg-[#1769AA] font-bold shadow-none transition-all hover:bg-[#0B1F33]",
                    footerActionLink:
                      "font-bold text-[#1769AA] hover:text-[#0B1F33]",
                    identityPreviewEditButton:
                      "font-bold text-[#1769AA]",
                  },
                }}
              />
            </div>

            {/* Bottom security */}
            <div className="mt-3 flex items-center justify-center gap-2 text-[9px] font-medium text-[#627D98]">
              <ShieldCheck className="h-3 w-3 text-[#16A34A]" />
              Protected authentication environment
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}