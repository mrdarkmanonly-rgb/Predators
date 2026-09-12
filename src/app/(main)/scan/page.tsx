/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import ScanUploader from "@/components/scan/ScanUploader";
import ScanResultLoader from "@/components/scan/ScanResultLoader";

export default function ScanPage() {
  const [scanId, setScanId] =
    useState<string | null>(null);

  const [ocrResult, setOcrResult] =
    useState<any>(null);

  const handleScanComplete = (
    completedScanId: string,
    result: any,
  ) => {
    setOcrResult(result);
    setScanId(completedScanId);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111F] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#16A34A]/10 blur-[100px]"
        />

        <motion.div
          animate={{
            x: [0, -70, 40, 0],
            y: [0, 60, -30, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[#1769AA]/10 blur-[110px]"
        />

        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-12rem] left-1/3 h-96 w-96 rounded-full bg-[#F59E0B]/5 blur-[100px]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#07111F_78%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <AnimatePresence mode="wait">
          {!scanId ? (
            <motion.div
              key="scanner"
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
            >
              <div className="mb-10 text-center">
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.1,
                    duration: 0.5,
                  }}
                  className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#16A34A]/30 bg-[#16A34A]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#4ADE80]"
                >
                  <motion.span
                    animate={{
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                    }}
                    className="h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_12px_#22C55E]"
                  />

                  AI Compliance Scanner
                </motion.div>

                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Scan.
                  <span className="text-[#4ADE80]">
                    {" "}
                    Understand.
                  </span>
                  <br />
                  Verify.
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                  Upload product packaging and let
                  CheckItRight analyze label information
                  using AI-powered OCR and compliance
                  screening.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#4ADE80]" />
                    Legal Metrology
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                    <ScanLine className="h-3.5 w-3.5 text-[#60A5FA]" />
                    PaddleOCR
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
                    AI Assisted
                  </span>
                </div>
              </div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.25,
                  duration: 0.7,
                  ease: "easeOut",
                }}
                className="relative"
              >
                <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-r from-[#16A34A]/40 via-[#1769AA]/20 to-[#F59E0B]/20 opacity-70 blur-sm" />

                <div className="relative rounded-[2rem] border border-white/10 bg-[#0B1728]/90 p-2 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-3">
                  <div className="mb-2 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.025] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16A34A]/10">
                        <ScanLine className="h-4 w-4 text-[#4ADE80]" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white">
                          PRODUCT ANALYSIS
                        </p>

                        <p className="text-[10px] text-slate-500">
                          Ready for secure image input
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.span
                        animate={{
                          opacity: [0.35, 1, 0.35],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                        className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"
                      />

                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4ADE80]">
                        System Ready
                      </span>
                    </div>
                  </div>

                  <ScanUploader
                    onScanComplete={
                      handleScanComplete
                    }
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.7,
                  duration: 0.6,
                }}
                className="mt-8 grid gap-3 sm:grid-cols-3"
              >
                <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4 text-center backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step 01
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    Upload Packaging
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4 text-center backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step 02
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    AI Reads Label
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4 text-center backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step 03
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    Compliance Screening
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
            >
              <ScanResultLoader
                scanId={scanId}
                ocrResult={ocrResult}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}