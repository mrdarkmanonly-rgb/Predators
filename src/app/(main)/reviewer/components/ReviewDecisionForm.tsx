"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRightCircle,
  Send,
  ShieldAlert,
} from "lucide-react";
import { CitizenReportItem, DecisionPayload, PriorityLevel } from "../types";
import { MOCK_INSPECTORS } from "../mock-data";

interface ReviewDecisionFormProps {
  report: CitizenReportItem;
  onSubmitDecision: (payload: DecisionPayload) => void;
  onCancel?: () => void;
}

export default function ReviewDecisionForm({
  report,
  onSubmitDecision,
  onCancel,
}: ReviewDecisionFormProps) {
  const [activeAction, setActiveAction] = useState<
    "NONE" | "VERIFY" | "REJECT" | "NEED_MORE_INFO" | "FORWARD_TO_INSPECTOR"
  >("NONE");

  // Rejection state
  const [rejectionReason, setRejectionReason] = useState(
    "BLURRED_INCONCLUSIVE_EVIDENCE"
  );
  const [rejectionNotes, setRejectionNotes] = useState("");

  // Need more info state
  const [requestedInfoNote, setRequestedInfoNote] = useState("");
  const [requestedFields, setRequestedFields] = useState<string[]>([
    "CLEAR_MRP_PHOTO",
  ]);

  // Forward to inspector state
  const [selectedInspectorId, setSelectedInspectorId] = useState(
    MOCK_INSPECTORS[0].id
  );
  const [forwardingPriority, setForwardingPriority] =
    useState<PriorityLevel>("HIGH");
  const [forwardingInstructions, setForwardingInstructions] = useState(
    "Please conduct physical verification of retail stock and draw statutory test samples under Rule 24 of Packaged Commodities Rules, 2011."
  );

  const toggleField = (field: string) => {
    if (requestedFields.includes(field)) {
      setRequestedFields(requestedFields.filter((f) => f !== field));
    } else {
      setRequestedFields([...requestedFields, field]);
    }
  };

  const handleVerify = () => {
    onSubmitDecision({
      reportId: report.id,
      decision: "VERIFY",
      notes: "Report verified against Legal Metrology Rules. Non-compliance established on primary declarations.",
    });
  };

  const handleReject = () => {
    onSubmitDecision({
      reportId: report.id,
      decision: "REJECT",
      rejectionReason,
      notes: rejectionNotes,
    });
  };

  const handleRequestInfo = () => {
    onSubmitDecision({
      reportId: report.id,
      decision: "NEED_MORE_INFO",
      requestedInfoFields: requestedFields,
      requestedInfoNote,
      notes: requestedInfoNote,
    });
  };

  const handleForward = () => {
    const inspector = MOCK_INSPECTORS.find((i) => i.id === selectedInspectorId);
    onSubmitDecision({
      reportId: report.id,
      decision: "FORWARD_TO_INSPECTOR",
      inspectorId: selectedInspectorId,
      inspectorName: inspector?.name,
      inspectionPriority: forwardingPriority,
      forwardingInstructions,
      notes: forwardingInstructions,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-[#D9E2EC] p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[#0B1F33] uppercase tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#1769AA]" />
            Official Review Decision & Disposition
          </h3>
          <p className="text-xs text-[#627D98] mt-0.5">
            Select one of the 4 statutory reviewer decisions for Report {report.reportNumber}
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF4FF] text-[#1769AA] border border-[#1769AA]/20">
          Current: {report.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* 4 Decision Primary Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* 1. VERIFY / ACCEPT */}
        <button
          type="button"
          onClick={() => setActiveAction(activeAction === "VERIFY" ? "NONE" : "VERIFY")}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
            activeAction === "VERIFY"
              ? "bg-[#DCFCE7] border-[#16A34A] text-[#166534] shadow-xs ring-2 ring-[#16A34A]/20"
              : "bg-white border-[#D9E2EC] hover:border-[#16A34A] hover:bg-[#F0FDF4] text-[#102A43]"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              1. Verify / Accept
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <p className="text-[11px] text-[#627D98] line-clamp-2">
            Confirm Legal Metrology violation from available evidence.
          </p>
        </button>

        {/* 2. NEED MORE INFORMATION */}
        <button
          type="button"
          onClick={() => setActiveAction(activeAction === "NEED_MORE_INFO" ? "NONE" : "NEED_MORE_INFO")}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
            activeAction === "NEED_MORE_INFO"
              ? "bg-[#FEF3C7] border-[#F59E0B] text-[#92400E] shadow-xs ring-2 ring-[#F59E0B]/20"
              : "bg-white border-[#D9E2EC] hover:border-[#F59E0B] hover:bg-[#FFFBEB] text-[#102A43]"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              2. Need More Info
            </span>
            <HelpCircle className="w-4 h-4 text-[#D97706]" />
          </div>
          <p className="text-[11px] text-[#627D98] line-clamp-2">
            Request citizen to clarify, reshoot label, or provide invoice.
          </p>
        </button>

        {/* 3. REJECT */}
        <button
          type="button"
          onClick={() => setActiveAction(activeAction === "REJECT" ? "NONE" : "REJECT")}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
            activeAction === "REJECT"
              ? "bg-[#FEE2E2] border-[#DC2626] text-[#991B1B] shadow-xs ring-2 ring-[#DC2626]/20"
              : "bg-white border-[#D9E2EC] hover:border-[#DC2626] hover:bg-[#FEF2F2] text-[#102A43]"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              3. Reject Report
            </span>
            <XCircle className="w-4 h-4 text-[#DC2626]" />
          </div>
          <p className="text-[11px] text-[#627D98] line-clamp-2">
            Close case as ungrounded, blurry, or outside PCR purview.
          </p>
        </button>

        {/* 4. FORWARD TO INSPECTOR */}
        <button
          type="button"
          onClick={() => setActiveAction(activeAction === "FORWARD_TO_INSPECTOR" ? "NONE" : "FORWARD_TO_INSPECTOR")}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
            activeAction === "FORWARD_TO_INSPECTOR"
              ? "bg-[#EAF4FF] border-[#1769AA] text-[#075985] shadow-xs ring-2 ring-[#1769AA]/20"
              : "bg-white border-[#D9E2EC] hover:border-[#1769AA] hover:bg-[#F0F9FF] text-[#102A43]"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              4. Forward to Inspector
            </span>
            <ArrowRightCircle className="w-4 h-4 text-[#1769AA]" />
          </div>
          <p className="text-[11px] text-[#627D98] line-clamp-2">
            Assign to Field Legal Metrology Officer for on-site raid.
          </p>
        </button>
      </div>

      {/* ACTION 1: VERIFY CONFIRMATION PANEL */}
      {activeAction === "VERIFY" && (
        <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] space-y-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#166534]">
                Confirm Statutory Verification
              </h4>
              <p className="text-xs text-[#15803D] mt-1">
                You are formally certifying that the photographic evidence and extracted declarations substantiate a non-compliance under the Legal Metrology (Packaged Commodities) Rules, 2011.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#86EFAC]/50">
            <button
              type="button"
              onClick={() => setActiveAction("NONE")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#627D98] hover:bg-white/80"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleVerify}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#16A34A] text-white hover:bg-[#15803D] shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirm & Mark Verified
            </button>
          </div>
        </div>
      )}

      {/* ACTION 2: NEED MORE INFORMATION PANEL */}
      {activeAction === "NEED_MORE_INFO" && (
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FCD34D] space-y-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#92400E]">
                Request Additional Information / Evidence from Citizen
              </h4>
              <p className="text-xs text-[#B45309] mt-0.5">
                Specify what details or photographs are required to complete Legal Metrology triage.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#92400E] uppercase tracking-wider mb-1.5">
              Required Evidence Items:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: "CLEAR_MRP_PHOTO", label: "Clear photo of MRP & packaging stamp" },
                { id: "PURCHASE_RECEIPT", label: "Cash memo / Retail invoice copy" },
                { id: "BACK_PANEL_WRAP", label: "360-degree wrap photo of all carton sides" },
                { id: "CALIBRATED_SCALE", label: "Net weight on certified digital scale" },
                { id: "MFR_ADDRESS", label: "Close-up of manufacturer address panel" },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 p-2 bg-white/80 rounded-md border border-[#FDE68A] cursor-pointer hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={requestedFields.includes(item.id)}
                    onChange={() => toggleField(item.id)}
                    className="rounded text-[#D97706] focus:ring-[#D97706]"
                  />
                  <span className="text-xs text-[#78350F]">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#92400E] uppercase tracking-wider mb-1">
              Instructions for Citizen:
            </label>
            <textarea
              rows={2}
              value={requestedInfoNote}
              onChange={(e) => setRequestedInfoNote(e.target.value)}
              placeholder="e.g., Please upload a photo of the bottom flap where the manufacturing date is stamped in clear natural light."
              className="w-full text-xs p-2.5 rounded-lg border border-[#FDE68A] bg-white text-[#102A43] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D97706]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#FCD34D]/50">
            <button
              type="button"
              onClick={() => setActiveAction("NONE")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#627D98] hover:bg-white/80"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleRequestInfo}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#D97706] text-white hover:bg-[#B45309] shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Send Clarification Request
            </button>
          </div>
        </div>
      )}

      {/* ACTION 3: REJECT PANEL */}
      {activeAction === "REJECT" && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#F87171] space-y-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#991B1B]">
                Reject Citizen Report with Justification
              </h4>
              <p className="text-xs text-[#B91C1C] mt-0.5">
                Rejections require a formal statutory reason code to record in the audit log.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#991B1B] uppercase tracking-wider mb-1">
                Standard Rejection Code:
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-[#FCA5A5] bg-white text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              >
                <option value="BLURRED_INCONCLUSIVE_EVIDENCE">
                  Evidence Photo Blurred / Unreadable
                </option>
                <option value="WITHIN_MAX_PERMISSIBLE_ERROR">
                  Weight Discrepancy Within Legal MPE Limits
                </option>
                <option value="OUTSIDE_LEGAL_METROLOGY_PURVIEW">
                  Outside Legal Metrology Purview (FSSAI/GST issue)
                </option>
                <option value="COMMERCIAL_DISPUTE_OR_FRIVOLOUS">
                  Commercial Dispute / Lack of Prima Facie Case
                </option>
                <option value="DUPLICATE_REPORT">
                  Duplicate of Existing Report Number
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#991B1B] uppercase tracking-wider mb-1">
                Specific Findings for Record:
              </label>
              <textarea
                rows={2}
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Explain why evidence does not establish violation..."
                className="w-full text-xs p-2 rounded-lg border border-[#FCA5A5] bg-white text-[#102A43] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F87171]/50">
            <button
              type="button"
              onClick={() => setActiveAction("NONE")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#627D98] hover:bg-white/80"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-xs transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Confirm Rejection & Archive
            </button>
          </div>
        </div>
      )}

      {/* ACTION 4: FORWARD TO INSPECTOR PANEL */}
      {activeAction === "FORWARD_TO_INSPECTOR" && (
        <div className="p-4 rounded-xl bg-[#F0F9FF] border border-[#7DD3FC] space-y-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-2">
            <ArrowRightCircle className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#075985]">
                Forward Report for Field Legal Metrology Inspection
              </h4>
              <p className="text-xs text-[#0369A1] mt-0.5">
                Assign this verified case to a designated district inspector for on-site search, seizure, and compounding.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#075985] uppercase tracking-wider mb-1">
                Select District Inspector:
              </label>
              <select
                value={selectedInspectorId}
                onChange={(e) => setSelectedInspectorId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-[#BAE6FD] bg-white text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              >
                {MOCK_INSPECTORS.map((insp) => (
                  <option key={insp.id} value={insp.id}>
                    {insp.name} ({insp.jurisdiction}) — {insp.activeCases} Active
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#075985] uppercase tracking-wider mb-1">
                Field Action Priority:
              </label>
              <select
                value={forwardingPriority}
                onChange={(e) => setForwardingPriority(e.target.value as PriorityLevel)}
                className="w-full text-xs p-2 rounded-lg border border-[#BAE6FD] bg-white text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              >
                <option value="HIGH">High (Immediate 24h Spot Inspection)</option>
                <option value="MEDIUM">Medium (Within 3 Business Days)</option>
                <option value="LOW">Low (Routine Verification)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#075985] uppercase tracking-wider mb-1">
              Directives / Instructions for Inspector:
            </label>
            <textarea
              rows={2}
              value={forwardingInstructions}
              onChange={(e) => setForwardingInstructions(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#BAE6FD] bg-white text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#7DD3FC]/50">
            <button
              type="button"
              onClick={() => setActiveAction("NONE")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#627D98] hover:bg-white/80"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleForward}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#1769AA] text-white hover:bg-[#0B1F33] shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch to Field Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
