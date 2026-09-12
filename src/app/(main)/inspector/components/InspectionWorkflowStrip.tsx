"use client";

import {
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Plus,
  ArrowRight,
  Package,
  Scale,
} from "lucide-react";
import { EXTRACTED_FIELDS } from "./data";

export default function InspectionWorkflowStrip() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
      {/* STEP 1 — Scan Product */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#D9E2EC] bg-white p-4">
        <StepHeader n={1} title="Scan Product" hint="Capture product images on-site" />

        {/* Product preview placeholder (no image file needed) */}
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[#0B1F33]">
          <div className="flex flex-col items-center gap-2 text-white/40">
            <Package className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              Product Preview
            </span>
          </div>
          <div className="absolute inset-x-6 bottom-6 h-0.5 rounded-full bg-[#16A34A] shadow-[0_0_8px_rgba(22,163,74,0.7)]" />
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {["Front View", "Back View", "Side View", "MRP / Price", "Net Quantity"].map((label) => (
            <span
              key={label}
              className="rounded-md border border-[#D9E2EC] bg-[#F7FAFC] px-2 py-1 text-[10px] font-medium text-[#627D98]"
            >
              {label}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-[#1769AA] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0B1F33]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add More
        </button>
      </div>

      {/* STEP 2 — AI Extraction */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#D9E2EC] bg-white p-4">
        <StepHeader n={2} title="AI Extraction" hint="Automatic OCR and data extraction" />

        <div className="flex items-center gap-2 rounded-lg border border-[#D9E2EC] bg-[#F7FAFC] p-2">
          {/* Thumbnail placeholder */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#EAF4FF]">
            <Package className="h-5 w-5 text-[#1769AA]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#627D98]">
              Extracted Information
            </span>
            <span className="text-xs font-semibold text-[#102A43]">
              Parle-G Biscuits
            </span>
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-1.5">
          {EXTRACTED_FIELDS.slice(0, 6).map((f) => (
            <li key={f.label} className="flex items-center justify-between text-[10px]">
              <span className="text-[#627D98]">{f.label}</span>
              <span className="font-semibold text-[#102A43]">{f.value}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between rounded-lg bg-[#16A34A]/10 px-3 py-2">
          <span className="text-[10px] font-semibold text-[#16A34A]">
            Confidence
          </span>
          <span className="text-xs font-bold text-[#16A34A]">92%</span>
        </div>
      </div>

      {/* STEP 3 — Verify & Compare */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#D9E2EC] bg-white p-4">
        <StepHeader n={3} title="Verify & Compare" hint="Check with existing product and report" />

        <div className="flex gap-1 border-b border-[#D9E2EC]">
          {["Scanned Data", "Product Database", "Report Data"].map((t, i) => (
            <span
              key={t}
              className={`px-2 py-1.5 text-[10px] font-semibold ${
                i === 0
                  ? "border-b-2 border-[#1769AA] text-[#1769AA]"
                  : "text-[#627D98]"
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        <ul className="flex flex-1 flex-col gap-2">
          {[
            { label: "Product Name", value: "Parle-G Biscuits", ok: true },
            { label: "Net Quantity", value: "100 g", ok: true },
            { label: "MRP", value: "₹ 10.00", ok: false },
            { label: "Manufacturer", value: "Parle Products Pvt. Ltd.", ok: true },
          ].map((row) => (
            <li key={row.label} className="flex items-center justify-between text-[11px]">
              <span className="text-[#627D98]">{row.label}</span>
              <span className="flex items-center gap-1.5 font-semibold text-[#102A43]">
                {row.value}
                {row.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-[#F59E0B]" />
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 rounded-lg bg-[#16A34A]/10 px-2.5 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold text-[#16A34A]">
              Product matched with existing record
            </span>
            <span className="text-[9px] text-[#16A34A]/80">Product ID: P-000123</span>
          </div>
        </div>

        <button
          type="button"
          className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-[#1769AA]/30 bg-white px-3 py-2 text-xs font-semibold text-[#1769AA] transition-colors hover:bg-[#EAF4FF]"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit / Correct Information
        </button>
      </div>

      {/* STEP 4 — Inspection Findings */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#D9E2EC] bg-white p-4">
        <StepHeader n={4} title="Inspection Findings" hint="Record your observations" />

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[#627D98]">
            Finding
          </label>
          <div className="flex items-center justify-between rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/10 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Violation Found
            </span>
            <ArrowRight className="h-3 w-3 rotate-90 text-[#DC2626]" />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[#627D98]">
            Observations
          </label>
          <textarea
            rows={4}
            defaultValue="Actual net quantity is 90g, but label shows 100g. Shop selling at ₹10. Product underweight."
            className="w-full resize-none rounded-lg border border-[#D9E2EC] bg-[#F7FAFC] p-2 text-[11px] text-[#102A43] outline-none focus:border-[#1769AA] focus:bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[#627D98]">
            Upload Evidence
          </label>
          <div className="flex items-center gap-2">
            {/* Weighing evidence placeholder */}
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#D9E2EC] bg-[#F7FAFC]">
              <Scale className="h-5 w-5 text-[#627D98]" />
            </div>
            {/* Product evidence placeholder */}
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#D9E2EC] bg-[#F7FAFC]">
              <Package className="h-5 w-5 text-[#627D98]" />
            </div>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-[#D9E2EC] text-[#627D98] transition-colors hover:border-[#1769AA] hover:text-[#1769AA]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* STEP 5 — Take Action */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#D9E2EC] bg-white p-4">
        <StepHeader n={5} title="Take Action" hint="Record enforcement action" />

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[#627D98]">
            Action Type
          </label>
          <div className="flex items-center justify-between rounded-lg border border-[#D9E2EC] bg-[#F7FAFC] px-3 py-2 text-xs font-semibold text-[#102A43]">
            Issue Notice
            <ArrowRight className="h-3 w-3 rotate-90 text-[#627D98]" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[#627D98]">
            Action Details
          </label>
          <textarea
            rows={3}
            defaultValue="Issued notice to shopkeeper for selling underweight product. Seized 5 units for further investigation."
            className="w-full resize-none rounded-lg border border-[#D9E2EC] bg-[#F7FAFC] p-2 text-[11px] text-[#102A43] outline-none focus:border-[#1769AA] focus:bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-[#627D98]">
            Action Date
          </label>
          <div className="rounded-lg border border-[#D9E2EC] bg-[#F7FAFC] px-3 py-2 text-xs font-semibold text-[#102A43]">
            15 Sep 2025
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[#EAF4FF] px-3 py-2">
          <span className="text-[10px] font-semibold text-[#1769AA]">
            Follow-up Required
          </span>
          <span className="relative h-4 w-8 rounded-full bg-[#1769AA]">
            <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
          </span>
        </div>

        <div className="mt-auto flex flex-col items-center gap-2 rounded-lg bg-[#16A34A]/10 px-3 py-3 text-center">
          <CheckCircle2 className="h-6 w-6 text-[#16A34A]" />
          <span className="text-xs font-bold text-[#16A34A]">
            Inspection Completed!
          </span>
          <span className="text-[9px] text-[#16A34A]/80">
            Your inspection report has been saved successfully.
          </span>
          <button
            type="button"
            className="mt-1 w-full rounded-lg bg-[#1769AA] px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#0B1F33]"
          >
            View Inspection
          </button>
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  n,
  title,
  hint,
}: {
  n: number;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1769AA] text-[10px] font-bold text-white">
        {n}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-bold text-[#102A43]">{title}</span>
        <span className="text-[10px] text-[#627D98]">{hint}</span>
      </div>
    </div>
  );
}