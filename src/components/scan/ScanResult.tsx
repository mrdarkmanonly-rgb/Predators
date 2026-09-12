/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  FileText,
  ScanLine,
  ShieldCheck,
  Zap,
  Database,
  Cpu,
  Activity,
  PackageCheck,
  Factory,
  Scale,
  Globe2,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";

type RuleResult = {
  rule_id: string;
  field: string;
  status: string;
  message: string;
};

type ComplianceResult = {
  overall_status?: string;
  compliance_score?: number;
  summary?: {
    total_rules?: number;
    passed?: number;
    failed?: number;
    not_verifiable?: number;
  };
  rules?: RuleResult[];
  disclaimer?: string;
};

type ScanResultData = {
  id: string;
  productId?: string | null;
  status: string;
  rawOcrText: string | null;
  ocrConfidence: number | null;
  ocrEngine: string | null;
  ocrVersion: string | null;
  extractedData: any;
  analysisResult: any;
  images: {
    id: string;
    secureUrl: string;
    qualityScore: number | null;
    qualityPassed: boolean;
  }[];
  preprocessingImages?: {
    image_index: number;
    image_url: string;
    success: boolean;
    stage: string;
    quality?: {
      score?: number;
      passed?: boolean;
    };
    preprocessing?: {
      variants?: Record<string, string>;
      variant_names?: string[];
      ocr_variant_used?: string;
    };
  }[];
};

type Props = {
  scan: ScanResultData;
};

const getValue = (value: unknown) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "object") {
    return null;
  }

  return String(value);
};

const formatLabel = (value: string) => {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
};

const hasValue = (value: unknown) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return Object.keys(
      value as Record<string, unknown>,
    ).length > 0;
  }

  return true;
};

const renderValue = (value: unknown) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "object") {
    return null;
  }

  return String(value);
};

const getStatusClasses = (
  status: string,
) => {
  if (status === "PASS") {
    return {
      border: "border-[#22C55E]/20",
      bg: "bg-[#16A34A]/[0.07]",
      text: "text-[#4ADE80]",
      icon: "text-[#4ADE80]",
    };
  }

  if (status === "FAIL") {
    return {
      border: "border-[#EF4444]/20",
      bg: "bg-[#EF4444]/[0.07]",
      text: "text-[#F87171]",
      icon: "text-[#F87171]",
    };
  }

  return {
    border: "border-[#F59E0B]/20",
    bg: "bg-[#F59E0B]/[0.07]",
    text: "text-[#FBBF24]",
    icon: "text-[#FBBF24]",
  };
};

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  } as const,
};

export default function ScanResult({
  scan,
}: Props) {
  const fields =
    scan.extractedData ?? {};

  const compliance =
    (scan.analysisResult ??
      {}) as ComplianceResult;

  const rules =
    compliance.rules ?? [];

  const summary =
    compliance.summary ?? {};

  const status =
    compliance.overall_status ??
    "NEEDS_REVIEW";

  const score =
    compliance.compliance_score ?? 0;

  const isCompliant =
    status === "COMPLIANT";

  const isViolation =
    status ===
    "POTENTIAL_VIOLATION";

  const statusLabel =
    status === "COMPLIANT"
      ? "COMPLIANT"
      : status ===
          "POTENTIAL_VIOLATION"
        ? "POTENTIAL VIOLATION"
        : "NEEDS REVIEW";

  const scoreWidth = Math.min(
    100,
    Math.max(0, score),
  );

  const productFields = [
    ["Product Name", fields.product_name],
    [
      "MRP",
      fields.mrp !== null &&
      fields.mrp !== undefined
        ? `₹${fields.mrp}`
        : null,
    ],
    [
      "Net Quantity",
      fields.net_quantity_value !==
        null &&
      fields.net_quantity_value !==
        undefined
        ? `${fields.net_quantity_value} ${
            fields.net_quantity_unit ?? ""
          }`.trim()
        : null,
    ],
    ["Manufacturer", fields.manufacturer],
    ["Packer", fields.packer],
    ["Importer", fields.importer],
    [
      "Manufacturing Date",
      fields.manufacturing_date,
    ],
    [
      "Packing Date",
      fields.packing_date,
    ],
    ["Best Before", fields.best_before],
    ["Use By", fields.use_by],
    [
      "Consumer Care",
      fields.consumer_care_details,
    ],
    [
      "Country Of Origin",
      fields.country_of_origin,
    ],
  ].filter(([, value]) =>
    hasValue(value),
  );

  const regulatoryFields = [
    ["Batch Number", fields.batch_number],
    [
      "FSSAI License",
      fields.fssai_license,
    ],
    ["Barcode", fields.barcode],
    ["Tax Status", fields.tax_status],
  ].filter(([, value]) =>
    hasValue(value),
  );

  const contactFields = [
    ["Phone", fields.phone],
    ["Email", fields.email],
    ["Website", fields.website],
  ].filter(([, value]) =>
    hasValue(value),
  );

  const productDetailFields = [
    ["Ingredients", fields.ingredients],
    [
      "Allergen Information",
      fields.allergen_information,
    ],
    [
      "Storage Instruction",
      fields.storage_instruction,
    ],
  ].filter(([, value]) =>
    hasValue(value),
  );

  const nutritionFields =
    fields.nutrition &&
    typeof fields.nutrition ===
      "object"
      ? Object.entries(fields.nutrition)
      : [];

  const renderFieldGrid = (
    items: [string, unknown][],
  ) => {
    if (!items.length) {
      return (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-6 text-sm text-slate-500">
          No additional information was
          reliably extracted.
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(
          ([label, value], index) => (
            <motion.div
              key={label}
              initial={{
                opacity: 0,
                x: -12,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                delay: index * 0.035,
              }}
              whileHover={{
                y: -2,
              }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-[#22C55E]/20 hover:bg-[#16A34A]/[0.035]"
            >
              <motion.div
                animate={{
                  x: ["-120%", "180%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 0.2,
                }}
                className="absolute top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-[#4ADE80]/40 to-transparent"
              />

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                {label}
              </p>

              <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-200">
                {renderValue(value)}
              </p>
            </motion.div>
          ),
        )}
      </div>
    );
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      className="relative mt-8 space-y-5 overflow-hidden"
    >
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: ["-20%", "20%", "-20%"],
            y: ["-10%", "15%", "-10%"],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/4 top-1/4 h-[420px] w-[420px] rounded-full bg-[#16A34A]/[0.045] blur-[100px]"
        />

        <motion.div
          animate={{
            x: ["20%", "-15%", "20%"],
            y: ["10%", "-10%", "10%"],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-0 top-1/2 h-[380px] w-[380px] rounded-full bg-[#1769AA]/[0.04] blur-[100px]"
        />
      </div>

      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-[2rem] border border-[#22C55E]/20 bg-[#07111F] shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
      >
        <motion.div
          animate={{
            x: ["-120%", "120%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#22C55E]/10 to-transparent blur-2xl"
        />

        <motion.div
          animate={{
            backgroundPosition: [
              "0px 0px",
              "40px 40px",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(74,222,128,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.5)_1px,transparent_1px)] [background-size:20px_20px]"
        />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#4ADE80]">
                <motion.span
                  animate={{
                    opacity: [
                      0.4,
                      1,
                      0.4,
                    ],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                  }}
                  className="h-2 w-2 rounded-full bg-[#4ADE80] shadow-[0_0_12px_#4ADE80]"
                />
                <ShieldCheck className="h-4 w-4" />
                Scan Complete
              </div>

              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                {getValue(
                  fields.product_name,
                ) ??
                  "Product Information"}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                AI-assisted packaged commodity
                compliance screening completed.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Cpu className="h-3.5 w-3.5 text-[#60A5FA]" />
                  AI ANALYSIS
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <ScanLine className="h-3.5 w-3.5 text-[#4ADE80]" />
                  OCR VERIFIED
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Scale className="h-3.5 w-3.5 text-[#FBBF24]" />
                  RULE ENGINE
                </div>
              </div>

              {scan.productId && (
                <Link
                  href={`/product/${scan.productId}`}
                  className="group relative mt-5 inline-flex items-center gap-2 overflow-hidden rounded-xl border border-[#4ADE80]/20 bg-[#16A34A]/10 px-4 py-2.5 text-sm font-bold text-[#4ADE80] transition hover:border-[#4ADE80]/40 hover:bg-[#16A34A]/20"
                >
                  <motion.span
                    animate={{
                      x: [
                        "-150%",
                        "150%",
                      ],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-y-0 w-1/3 bg-white/10 blur-sm"
                  />

                  <FileText className="relative h-4 w-4" />
                  <span className="relative">
                    View Product Profile
                  </span>
                  <ExternalLink className="relative h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div className="relative mx-auto flex h-48 w-48 shrink-0 items-center justify-center">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 rounded-full border border-dashed border-[#22C55E]/20"
              />

              <motion.div
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-5 rounded-full border border-[#1769AA]/20"
              />

              <motion.div
                animate={{
                  scale: [
                    1,
                    1.05,
                    1,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`relative flex h-32 w-32 flex-col items-center justify-center rounded-full border ${
                  isCompliant
                    ? "border-[#22C55E]/30 bg-[#16A34A]/10 shadow-[0_0_50px_rgba(34,197,94,0.12)]"
                    : isViolation
                      ? "border-[#EF4444]/30 bg-[#EF4444]/10 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
                      : "border-[#F59E0B]/30 bg-[#F59E0B]/10 shadow-[0_0_50px_rgba(245,158,11,0.1)]"
                }`}
              >
                {isCompliant ? (
                  <CheckCircle2 className="h-7 w-7 text-[#4ADE80]" />
                ) : isViolation ? (
                  <CircleAlert className="h-7 w-7 text-[#F87171]" />
                ) : (
                  <AlertTriangle className="h-7 w-7 text-[#FBBF24]" />
                )}

                <span className="mt-1 text-3xl font-black text-white">
                  {score}
                </span>

                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  Score
                </span>
              </motion.div>
            </div>
          </div>

          <div className="mt-7 h-px overflow-hidden bg-white/[0.06]">
            <motion.div
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent shadow-[0_0_15px_#4ADE80]"
            />
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              <Activity className="h-3.5 w-3.5 text-[#4ADE80]" />
              Compliance intelligence active
            </div>

            <div
              className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                isCompliant
                  ? "border-[#22C55E]/20 bg-[#16A34A]/10 text-[#4ADE80]"
                  : isViolation
                    ? "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#F87171]"
                    : "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#FBBF24]"
              }`}
            >
              {statusLabel}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="grid gap-4 sm:grid-cols-3"
      >
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0B1728] p-5">
          <motion.div
            animate={{
              x: ["-120%", "160%"],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent"
          />

          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Compliance Score
            </p>
            <Zap className="h-4 w-4 text-[#4ADE80]" />
          </div>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-black text-white">
              {score}
            </span>
            <span className="mb-1 text-sm text-slate-600">
              / 100
            </span>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${scoreWidth}%`,
              }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
              }}
              className="relative h-full rounded-full bg-[#16A34A]"
            >
              <motion.div
                animate={{
                  x: ["-100%", "300%"],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute h-full w-1/3 bg-white/40 blur-sm"
              />
            </motion.div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0B1728] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
            Rules Passed
          </p>

          <p className="mt-3 text-4xl font-black text-[#4ADE80]">
            {summary.passed ?? 0}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            of {summary.total_rules ?? 0} rules
          </p>

          <CheckCircle2 className="absolute bottom-5 right-5 h-10 w-10 text-[#22C55E]/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0B1728] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
            Needs Review
          </p>

          <p className="mt-3 text-4xl font-black text-[#FBBF24]">
            {summary.not_verifiable ?? 0}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            items not reliably verifiable
          </p>

          <AlertTriangle className="absolute bottom-5 right-5 h-10 w-10 text-[#F59E0B]/10" />
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#0B1728] p-6 sm:p-8"
      >
        <motion.div
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-[#1769AA] to-transparent"
        />

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#60A5FA]/10 bg-[#1769AA]/10 text-[#60A5FA]">
            <PackageCheck className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">
              Product Information
            </h3>
            <p className="text-sm text-slate-500">
              Information extracted from the product
              packaging
            </p>
          </div>
        </div>

        <div className="mt-6">
          {renderFieldGrid(
            productFields as [string, unknown][],
          )}
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#0B1728] p-6 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#22C55E]/10 bg-[#16A34A]/10 text-[#4ADE80]">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">
              Regulatory & Traceability
            </h3>
            <p className="text-sm text-slate-500">
              Additional packaging and traceability
              information
            </p>
          </div>
        </div>

        <div className="mt-6">
          {renderFieldGrid(
            regulatoryFields as [string, unknown][],
          )}
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#0B1728] p-6 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#60A5FA]/10 bg-[#1769AA]/10 text-[#60A5FA]">
            <FileText className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">
              Product Details
            </h3>
            <p className="text-sm text-slate-500">
              Ingredients, allergen and storage
              information
            </p>
          </div>
        </div>

        <div className="mt-6">
          {renderFieldGrid(
            productDetailFields as [string, unknown][],
          )}
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#0B1728] p-6 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400">
            <Phone className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">
              Contact Information
            </h3>
            <p className="text-sm text-slate-500">
              Contact details detected from the
              packaging
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contactFields.length ? (
            contactFields.map(
              ([label, value], index) => (
                <motion.div
                  key={label}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                >
                  <div className="flex items-center gap-2 text-slate-600">
                    {label === "Email" ? (
                      <Mail className="h-3.5 w-3.5" />
                    ) : label === "Website" ? (
                      <Globe2 className="h-3.5 w-3.5" />
                    ) : (
                      <Phone className="h-3.5 w-3.5" />
                    )}

                    <p className="text-[10px] font-bold uppercase tracking-wider">
                      {label}
                    </p>
                  </div>

                  <p className="mt-2 break-words text-sm font-semibold text-slate-200">
                    {renderValue(value)}
                  </p>
                </motion.div>
              ),
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
              No contact information was reliably
              extracted.
            </div>
          )}
        </div>
      </motion.div>

      {nutritionFields.length > 0 && (
        <motion.div
          variants={sectionVariants}
          className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#0B1728] p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F59E0B]/10 bg-[#F59E0B]/10 text-[#FBBF24]">
              <Activity className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                Nutrition Information
              </h3>
              <p className="text-sm text-slate-500">
                Nutritional values detected from the
                label
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nutritionFields.map(
              ([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                    {formatLabel(
                      String(key),
                    )}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-200">
                    {String(value)}
                  </p>
                </motion.div>
              ),
            )}
          </div>
        </motion.div>
      )}

      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-[1.75rem] border border-[#22C55E]/15 bg-[#0B1728] p-6 sm:p-8"
      >
        <motion.div
          animate={{
            y: ["-100%", "300%"],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute left-0 h-1/3 w-full bg-gradient-to-b from-transparent via-[#4ADE80]/[0.04] to-transparent"
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#22C55E]/10 bg-[#16A34A]/10 text-[#4ADE80]">
            <Scale className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">
              Compliance Analysis
            </h3>
            <p className="text-sm text-slate-500">
              Rule-by-rule screening results
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-6 space-y-3">
          {rules.length ? (
            rules.map((rule, index) => {
              const passed =
                rule.status === "PASS";

              const failed =
                rule.status === "FAIL";

              const statusClasses =
                getStatusClasses(
                  rule.status,
                );

              return (
                <motion.div
                  key={rule.rule_id}
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.1,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  whileHover={{
                    x: 3,
                  }}
                  className={`relative overflow-hidden rounded-2xl border ${statusClasses.border} ${statusClasses.bg} p-4`}
                >
                  <motion.div
                    animate={{
                      x: [
                        "-120%",
                        "180%",
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                      delay: index * 0.15,
                    }}
                    className="absolute top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {passed ? (
                        <CheckCircle2
                          className={`h-5 w-5 ${statusClasses.icon}`}
                        />
                      ) : failed ? (
                        <CircleAlert
                          className={`h-5 w-5 ${statusClasses.icon}`}
                        />
                      ) : (
                        <AlertTriangle
                          className={`h-5 w-5 ${statusClasses.icon}`}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-bold text-slate-200">
                            {formatLabel(
                              rule.field,
                            )}
                          </p>

                          <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                            {rule.rule_id}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusClasses.border} ${statusClasses.bg} ${statusClasses.text}`}
                        >
                          {rule.status ===
                          "NOT_VERIFIABLE"
                            ? "NEEDS REVIEW"
                            : rule.status}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {rule.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-500">
              No rule results available.
            </div>
          )}
        </div>
      </motion.div>

      {scan.preprocessingImages &&
        scan.preprocessingImages.length > 0 && (
          <motion.div
            variants={sectionVariants}
            className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#0B1728] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#60A5FA]/10 bg-[#1769AA]/10 text-[#60A5FA]">
                  <ScanLine className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">
                    Image Processing Variants
                  </h3>

                  <p className="text-sm text-slate-500">
                    Different preprocessing versions generated
                    before OCR
                  </p>
                </div>
              </div>

              <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-slate-500">
                {scan.preprocessingImages.reduce(
                  (total, image) =>
                    total +
                    Object.keys(
                      image.preprocessing
                        ?.variants ?? {},
                    ).length,
                  0,
                )}{" "}
                variants generated
              </div>
            </div>

            <div className="mt-8 space-y-8">
              {scan.preprocessingImages.map(
                (image) => {
                  const variants =
                    image.preprocessing
                      ?.variants ?? {};

                  const variantNames =
                    image.preprocessing
                      ?.variant_names ??
                    Object.keys(
                      variants,
                    );

                  const ocrVariant =
                    image.preprocessing
                      ?.ocr_variant_used;

                  return (
                    <div
                      key={image.image_index}
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-bold text-slate-200">
                            Image{" "}
                            {image.image_index}
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            {
                              variantNames.length
                            }{" "}
                            preprocessing variants
                          </p>
                        </div>

                        {ocrVariant && (
                          <div className="w-fit rounded-full border border-[#22C55E]/20 bg-[#16A34A]/10 px-3 py-1.5 text-xs font-bold text-[#4ADE80]">
                            OCR:{" "}
                            {formatLabel(
                              ocrVariant,
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {variantNames.map(
                          (variant) => (
                            <span
                              key={variant}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                variant ===
                                ocrVariant
                                  ? "border border-[#22C55E]/20 bg-[#16A34A]/10 text-[#4ADE80]"
                                  : "border border-white/[0.06] bg-white/[0.03] text-slate-500"
                              }`}
                            >
                              {formatLabel(
                                variant,
                              )}
                            </span>
                          ),
                        )}
                      </div>

                      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {variantNames.map(
                          (variant) => {
                            const imageSource =
                              variants[
                                variant
                              ];

                            if (!imageSource) {
                              return null;
                            }

                            const isOcrVariant =
                              variant ===
                              ocrVariant;

                            return (
                              <motion.div
                                key={variant}
                                whileHover={{
                                  y: -4,
                                }}
                                className={`overflow-hidden rounded-2xl border ${
                                  isOcrVariant
                                    ? "border-[#22C55E]/40 shadow-[0_0_25px_rgba(34,197,94,0.08)]"
                                    : "border-white/[0.07]"
                                } bg-[#07111F]`}
                              >
                                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                                  <div>
                                    <p className="text-sm font-bold text-slate-200">
                                      {formatLabel(
                                        variant,
                                      )}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-600">
                                      Processed view
                                    </p>
                                  </div>

                                  {isOcrVariant && (
                                    <span className="rounded-full border border-[#22C55E]/20 bg-[#16A34A]/10 px-2 py-1 text-[10px] font-black text-[#4ADE80]">
                                      OCR
                                    </span>
                                  )}
                                </div>

                                <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-[#050C16]">
                                  <img
                                    src={
                                      imageSource
                                    }
                                    alt={`${formatLabel(
                                      variant,
                                    )} preprocessing variant`}
                                    className="h-full w-full object-contain"
                                  />

                                  <motion.div
                                    animate={{
                                      y: [
                                        "-100%",
                                        "250%",
                                      ],
                                    }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                      ease: "linear",
                                    }}
                                    className="pointer-events-none absolute left-0 h-1/3 w-full bg-gradient-to-b from-transparent via-[#4ADE80]/10 to-transparent"
                                  />
                                </div>
                              </motion.div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </motion.div>
        )}

      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#0B1728] p-6 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#60A5FA]/10 bg-[#1769AA]/10 text-[#60A5FA]">
            <Database className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">
              OCR Information
            </h3>

            <p className="text-sm text-slate-500">
              Technical information from the extraction
              pipeline
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Cpu className="h-3.5 w-3.5" />
              <p className="text-[10px] font-bold uppercase tracking-wider">
                OCR Engine
              </p>
            </div>

            <p className="mt-2 text-sm font-bold text-slate-200">
              {scan.ocrEngine ??
                "Not available"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Activity className="h-3.5 w-3.5" />
              <p className="text-[10px] font-bold uppercase tracking-wider">
                Confidence
              </p>
            </div>

            <p className="mt-2 text-sm font-bold text-slate-200">
              {scan.ocrConfidence !==
              null
                ? `${(
                    scan.ocrConfidence *
                    100
                  ).toFixed(2)}%`
                : "Not available"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <PackageCheck className="h-3.5 w-3.5" />
              <p className="text-[10px] font-bold uppercase tracking-wider">
                Images
              </p>
            </div>

            <p className="mt-2 text-sm font-bold text-slate-200">
              {scan.images.length}
            </p>
          </div>
        </div>

        <details className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07]">
          <summary className="cursor-pointer bg-white/[0.025] px-5 py-4 text-sm font-bold text-slate-300 transition hover:bg-white/[0.04]">
            View complete OCR text
          </summary>

          <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap bg-[#050C16] p-5 text-xs leading-6 text-slate-500">
            {scan.rawOcrText ||
              "No OCR text available."}
          </pre>
        </details>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/[0.06] p-5"
      >
        <motion.div
          animate={{
            x: ["-120%", "150%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent"
        />

        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#FBBF24]" />

          <p className="text-sm leading-6 text-[#FBBF24]/80">
            {compliance.disclaimer ??
              "This result is an AI-assisted compliance screening and does not constitute a final legal determination."}
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
}