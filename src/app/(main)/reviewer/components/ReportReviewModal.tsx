"use client";

import React, { useState } from "react";
import {
  X,
  Shield,
  Calendar,
  User,
  Store,
  Package,
  Layers,
  Sparkles,
  Lock,
  Compass,
} from "lucide-react";
import { CitizenReportItem, DecisionPayload } from "../types";
import EvidenceViewer from "./EvidenceViewer";
import ProductScanComparison from "./ProductScanComparison";
import ReviewDecisionForm from "./ReviewDecisionForm";
import ReviewNotesSection from "./ReviewNotesSection";
import ReviewTimeline from "./ReviewTimeline";

interface ReportReviewModalProps {
  report: CitizenReportItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmitDecision: (payload: DecisionPayload) => void;
  onAddNote: (noteText: string) => void;
}

export default function ReportReviewModal({
  report,
  isOpen,
  onClose,
  onSubmitDecision,
  onAddNote,
}: ReportReviewModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "product_shop" | "verification" | "notes_history"
  >("overview");

  if (!isOpen) return null;

  const { productSnapshot } = report;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-[#FEE2E2] text-[#991B1B] border-[#F87171]";
      case "MEDIUM":
        return "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]";
      default:
        return "bg-[#E0F2FE] text-[#075985] border-[#7DD3FC]";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]";
      case "REJECTED":
        return "bg-[#FEE2E2] text-[#991B1B] border-[#F87171]";
      case "FORWARDED_TO_INSPECTOR":
        return "bg-[#0B1F33] text-white border-[#1E3A5F]";
      case "NEED_MORE_INFORMATION":
        return "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]";
      default:
        return "bg-[#EAF4FF] text-[#1769AA] border-[#1769AA]/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 modal-overlay overflow-y-auto custom-scrollbar">
      {/* Modal Card Box */}
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-[#D9E2EC] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Sticky Header Bar */}
        <div className="bg-[#0B1F33] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#1E3A5F]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Shield className="w-5 h-5 text-[#1769AA]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold tracking-tight text-white">
                  Report Review: {report.reportNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                    report.priority
                  )}`}
                >
                  {report.priority} PRIORITY
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                    report.status
                  )}`}
                >
                  {report.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-white/70">
                {productSnapshot.productName} • {report.shopCity}, {report.shopState}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Top Nav Tabs */}
        <div className="bg-[#F8FAFC] border-b border-[#D9E2EC] px-4 sm:px-6 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: "overview", label: "Evidence & Violation Overview", icon: Layers },
            { id: "product_shop", label: "Product & Shop Metadata", icon: Package },
            { id: "verification", label: "Cross-Verification & AI Audit", icon: Sparkles },
            { id: "notes_history", label: "Internal Notes & Timeline", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-[#1769AA] text-[#1769AA] bg-white rounded-t-lg"
                    : "border-transparent text-[#627D98] hover:text-[#102A43]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-5 bg-[#F7FAFC]">
          {/* TAB 1: OVERVIEW & EVIDENCE */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Top Quick Summary Info Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-[#D9E2EC] shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98]">
                    Citizen Report Claim
                  </span>
                  <p className="text-xs font-bold text-[#DC2626] mt-0.5">
                    {report.issueLabel}
                  </p>
                  <p className="text-xs text-[#627D98] mt-1 leading-relaxed">
                    "{report.description}"
                  </p>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-[#D9E2EC] pt-3 md:pt-0 md:pl-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98]">
                    Citizen Informant (Masked)
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-[#102A43]">
                    <User className="w-3.5 h-3.5 text-[#1769AA]" />
                    <span className="font-medium">{report.citizenNameMasked}</span>
                  </div>
                  <p className="text-[11px] text-[#627D98] font-mono mt-0.5">
                    Phone: {report.citizenPhoneMasked}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-[#627D98] mt-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>Submitted: {new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-[#D9E2EC] pt-3 md:pt-0 md:pl-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98]">
                    Retail Location & GPS
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-[#102A43]">
                    <Store className="w-3.5 h-3.5 text-[#1769AA]" />
                    <span className="font-semibold">{report.shopName}</span>
                  </div>
                  <p className="text-xs text-[#627D98] truncate">
                    {report.shopAddress}
                  </p>
                  <p className="text-[11px] text-[#627D98] font-semibold mt-0.5">
                    {report.shopCity}, {report.shopState} - {report.shopPinCode}
                  </p>
                </div>
              </div>

              {/* High-Resolution Evidence Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7">
                  <EvidenceViewer
                    evidenceList={report.evidence}
                    reportNumber={report.reportNumber}
                  />
                </div>

                {/* Extracted Product Highlights & AI Scan Check */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white rounded-xl border border-[#D9E2EC] p-4 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#1769AA]" />
                        Product Package Declarations
                      </span>
                      <span className="text-[10px] font-mono bg-[#EAF4FF] text-[#1769AA] px-1.5 py-0.2 rounded">
                        GTIN: {productSnapshot.barcodeGTIN || "890..."}
                      </span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#D9E2EC]/50">
                        <span className="text-[#627D98]">Product Name:</span>
                        <span className="font-semibold text-[#102A43] text-right">
                          {productSnapshot.productName}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#D9E2EC]/50">
                        <span className="text-[#627D98]">Brand:</span>
                        <span className="font-semibold text-[#102A43]">
                          {productSnapshot.brand}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#D9E2EC]/50">
                        <span className="text-[#627D98]">Declared Net Quantity:</span>
                        <span className="font-bold text-[#102A43]">
                          {productSnapshot.declaredNetQuantity}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#D9E2EC]/50">
                        <span className="text-[#627D98]">Declared MRP:</span>
                        <span className="font-bold text-[#16A34A]">
                          {productSnapshot.declaredMRP}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#D9E2EC]/50">
                        <span className="text-[#627D98]">Packaging Date:</span>
                        <span className="font-mono text-[#102A43]">
                          {productSnapshot.monthYearOfManufacture || "Not Declared"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#627D98]">Manufacturer:</span>
                        <span className="text-right text-[#102A43] max-w-[200px] truncate" title={productSnapshot.manufacturerName}>
                          {productSnapshot.manufacturerName || "Not Declared"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Quick Flag */}
                  <div className="bg-[#EAF4FF]/50 rounded-xl border border-[#1769AA]/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1769AA] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#1769AA]" />
                        Preliminary OCR & AI Analysis
                      </span>
                      <span className="text-xs font-bold text-[#1769AA]">
                        {report.analysisSnapshot.overallConfidence}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-[#0B1F33]">
                      Automated scan classified report as{" "}
                      <strong className="text-[#DC2626]">
                        {report.analysisSnapshot.preliminaryResult.replace(/_/g, " ")}
                      </strong>
                      . Found {report.analysisSnapshot.ruleChecks.filter((r) => r.status === "NON_COMPLIANT").length} potential non-compliances.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT & SHOP METADATA */}
          {activeTab === "product_shop" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Product Detailed Card */}
              <div className="bg-white rounded-xl border border-[#D9E2EC] p-5 space-y-3 shadow-2xs">
                <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider flex items-center gap-2 border-b border-[#D9E2EC] pb-2">
                  <Package className="w-4 h-4 text-[#1769AA]" />
                  Section B: Full Product Statutory Declarations
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                    <span className="text-[#627D98]">Product Name:</span>
                    <span className="col-span-2 font-medium text-[#102A43]">
                      {productSnapshot.productName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                    <span className="text-[#627D98]">Generic Name:</span>
                    <span className="col-span-2 text-[#102A43]">
                      {productSnapshot.genericName || "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                    <span className="text-[#627D98]">Commodity Category:</span>
                    <span className="col-span-2 text-[#102A43]">
                      {productSnapshot.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                    <span className="text-[#627D98]">Manufacturer:</span>
                    <span className="col-span-2 text-[#102A43]">
                      {productSnapshot.manufacturerName || "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                    <span className="text-[#627D98]">Mfr Address:</span>
                    <span className="col-span-2 text-[#627D98]">
                      {productSnapshot.manufacturerAddress || "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                    <span className="text-[#627D98]">Packer / Importer:</span>
                    <span className="col-span-2 text-[#102A43]">
                      {productSnapshot.importerName || productSnapshot.packerName || "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                    <span className="text-[#627D98]">Country of Origin:</span>
                    <span className="col-span-2 font-semibold text-[#102A43]">
                      {productSnapshot.countryOfOrigin || "Not Declared"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                    <span className="text-[#627D98]">Declared Net Qty:</span>
                    <span className="col-span-2 font-bold text-[#102A43]">
                      {productSnapshot.declaredNetQuantity}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                    <span className="text-[#627D98]">Retail Sale Price:</span>
                    <span className="col-span-2 font-bold text-[#16A34A]">
                      {productSnapshot.declaredMRP}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                    <span className="text-[#627D98]">Unit Sale Price (USP):</span>
                    <span className="col-span-2 font-mono text-[#102A43]">
                      {productSnapshot.unitSalePrice || "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                    <span className="text-[#627D98]">Batch / Lot No:</span>
                    <span className="col-span-2 font-mono text-[#102A43]">
                      {productSnapshot.batchOrLotNumber || "—"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1">
                    <span className="text-[#627D98]">Consumer Helpline:</span>
                    <span className="col-span-2 text-[#102A43]">
                      {productSnapshot.consumerCarePhone || productSnapshot.consumerCareEmail || "None Declared"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shop & Geolocation Card */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-[#D9E2EC] p-5 space-y-3 shadow-2xs">
                  <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider flex items-center gap-2 border-b border-[#D9E2EC] pb-2">
                    <Store className="w-4 h-4 text-[#1769AA]" />
                    Section D: Retail Shop Information
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                      <span className="text-[#627D98]">Establishment:</span>
                      <span className="col-span-2 font-semibold text-[#102A43]">
                        {report.shopName}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                      <span className="text-[#627D98]">Shopkeeper:</span>
                      <span className="col-span-2 text-[#102A43]">
                        {report.shopkeeperName || "Not Recorded"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                      <span className="text-[#627D98]">Address:</span>
                      <span className="col-span-2 text-[#102A43]">
                        {report.shopAddress || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                      <span className="text-[#627D98]">City / District:</span>
                      <span className="col-span-2 font-semibold text-[#102A43]">
                        {report.shopCity}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-1 border-b border-[#D9E2EC]/50">
                      <span className="text-[#627D98]">State:</span>
                      <span className="col-span-2 text-[#102A43]">
                        {report.shopState}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-1">
                      <span className="text-[#627D98]">PIN Code:</span>
                      <span className="col-span-2 font-mono text-[#102A43]">
                        {report.shopPinCode || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Geolocation Coordinate Box */}
                <div className="bg-white rounded-xl border border-[#D9E2EC] p-5 space-y-3 shadow-2xs">
                  <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider flex items-center gap-2 border-b border-[#D9E2EC] pb-2">
                    <Compass className="w-4 h-4 text-[#1769AA]" />
                    Section E: Geolocation Coordinates & Accuracy
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#D9E2EC]/50 font-mono">
                      <span className="text-[#627D98]">Latitude:</span>
                      <span className="text-[#102A43]">{report.latitude ?? "28.6139"}° N</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#D9E2EC]/50 font-mono">
                      <span className="text-[#627D98]">Longitude:</span>
                      <span className="text-[#102A43]">{report.longitude ?? "77.2090"}° E</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#627D98]">GPS Fix Accuracy:</span>
                      <span className="font-semibold text-[#16A34A]">
                        ±{report.locationAccuracy ?? 5.0} meters (High Precision)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFICATION PIPELINE */}
          {activeTab === "verification" && (
            <ProductScanComparison report={report} />
          )}

          {/* TAB 4: INTERNAL NOTES & TIMELINE */}
          {activeTab === "notes_history" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ReviewNotesSection
                notes={report.reviewNotes}
                onAddNote={onAddNote}
              />
              <ReviewTimeline timeline={report.timeline} />
            </div>
          )}

          {/* DECISION FORM SECTION (Always accessible at bottom for rapid action) */}
          <div className="pt-2">
            <ReviewDecisionForm
              report={report}
              onSubmitDecision={onSubmitDecision}
              onCancel={onClose}
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#F8FAFC] border-t border-[#D9E2EC] px-6 py-3 flex items-center justify-between text-xs text-[#627D98]">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#102A43]">Assigned Reviewer:</span>
            <span>{report.assignedReviewerName || "Unassigned"}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#D9E2EC] bg-white font-semibold text-[#102A43] hover:bg-[#F1F5F9] transition-colors"
          >
            Close Review Panel
          </button>
        </div>
      </div>
    </div>
  );
}
