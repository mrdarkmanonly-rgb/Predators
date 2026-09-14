"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, CheckCircle2, ShieldX } from "lucide-react";
import { toast } from "sonner";
import {
  completeInspection,
  type InspectionFormData,
} from "@/actions/inspector/inspection.actions";

const VIOLATION_TYPES = [
  "Incorrect Weight",
  "Misleading Label",
  "Expired Product",
  "Price Mismatch",
  "Other",
];

const ACTION_TYPES = [
  "Issue Notice",
  "Warning Issued",
  "Sample Seized",
  "Fine Imposed",
  "Product Recalled",
  "No Action Required",
  "Other",
];

export default function InspectionActions({
  inspectionId,
  reportCode,
}: {
  inspectionId: string;
  reportCode: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [violationFound, setViolationFound] = useState<boolean | null>(null);
  const [violationType, setViolationType] = useState("");
  const [observation, setObservation] = useState("");
  const [actionType, setActionType] = useState("");
  const [actionDetails, setActionDetails] = useState("");
  const [actionDate, setActionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [remark, setRemark] = useState("");
  const [decision, setDecision] = useState<"REJECT" | "RESOLVE" | null>(null);
  const [confirm, setConfirm] = useState(false);

  const remarkValid = remark.trim().length >= 5;
  const canProceed =
    violationFound !== null &&
    remarkValid &&
    (violationFound === false ||
      (violationFound === true && violationType.length > 0));

  function submit() {
    if (!decision || !canProceed || violationFound === null) return;

    const payload: InspectionFormData = {
      violationFound,
      violationType: violationFound ? violationType || null : null,
      observation: observation.trim() || null,
      actionType: actionType || null,
      actionDetails: actionDetails.trim() || null,
      actionDate: actionDate ? new Date(actionDate).toISOString() : null,
      followUpRequired,
      remarks: remark.trim(),
      decision,
    };

    startTransition(async () => {
      const res = await completeInspection(inspectionId, payload);

      if (res.ok) {
        toast.success(
          decision === "REJECT" ? "Case rejected" : "Case resolved",
        );
        router.push("/inspector/my-cases");
        router.refresh();
      } else {
        toast.error(res.reason);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Step 4 — Findings */}
      <div className="space-y-4 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
            Step 4 · Inspection Findings
          </p>
          <h3 className="mt-0.5 text-sm font-bold text-[#102A43]">
            Record your findings
          </h3>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
            Finding *
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setViolationFound(true)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                violationFound === true
                  ? "border-[#DC2626] bg-[#FEECEC] text-[#DC2626]"
                  : "border-[#D9E2EC] bg-white text-[#627D98] hover:border-[#DC2626]/40"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Violation Found
            </button>
            <button
              onClick={() => setViolationFound(false)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                violationFound === false
                  ? "border-[#16A34A] bg-[#EAF8F0] text-[#16A34A]"
                  : "border-[#D9E2EC] bg-white text-[#627D98] hover:border-[#16A34A]/40"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              No Violation Found
            </button>
          </div>
        </div>

        {violationFound === true && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
              Violation Type *
            </p>
            <select
              value={violationType}
              onChange={(e) => setViolationType(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-3 py-2.5 text-sm text-[#102A43] focus:border-[#1769AA] focus:outline-none"
            >
              <option value="">Select a violation type…</option>
              {VIOLATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
            Observation
          </p>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            rows={3}
            placeholder="What did you observe during the field visit?"
            className="mt-2 w-full resize-none rounded-xl border border-[#D9E2EC] bg-[#F7FAFC] p-3 text-sm text-[#102A43] focus:border-[#1769AA] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Step 5 — Action */}
      <div className="space-y-4 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
            Step 5 · Take Action
          </p>
          <h3 className="mt-0.5 text-sm font-bold text-[#102A43]">
            Record enforcement action (if any)
          </h3>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
            Action Type
          </p>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-3 py-2.5 text-sm text-[#102A43] focus:border-[#1769AA] focus:outline-none"
          >
            <option value="">None</option>
            {ACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {actionType && (
          <>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
                Action Details
              </p>
              <textarea
                value={actionDetails}
                onChange={(e) => setActionDetails(e.target.value)}
                rows={3}
                placeholder="Describe the action taken…"
                className="mt-2 w-full resize-none rounded-xl border border-[#D9E2EC] bg-[#F7FAFC] p-3 text-sm text-[#102A43] focus:border-[#1769AA] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
                  Action Date
                </p>
                <input
                  type="date"
                  value={actionDate}
                  onChange={(e) => setActionDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-3 py-2.5 text-sm text-[#102A43] focus:border-[#1769AA] focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-[#102A43]">
                  <input
                    type="checkbox"
                    checked={followUpRequired}
                    onChange={(e) => setFollowUpRequired(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D9E2EC] text-[#1769AA]"
                  />
                  Follow-up required
                </label>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Final decision */}
      <div className="space-y-4 rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
            Final decision
          </p>
          <h3 className="mt-0.5 text-sm font-bold text-[#102A43]">
            Reject or resolve this case
          </h3>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
            Inspector Final Remark *
          </p>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            placeholder="Explain what was found, what action was taken, and why the case is being rejected or resolved."
            className="mt-2 w-full resize-none rounded-xl border border-[#D9E2EC] bg-[#F7FAFC] p-3 text-sm text-[#102A43] focus:border-[#1769AA] focus:bg-white focus:outline-none"
          />
          {remark.length > 0 && !remarkValid && (
            <p className="mt-1 text-xs text-[#DC2626]">
              Remark must be at least 5 characters.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setDecision("RESOLVE");
              setConfirm(true);
            }}
            disabled={!canProceed}
            className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#15803D] disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Resolve Case
          </button>
          <button
            onClick={() => {
              setDecision("REJECT");
              setConfirm(true);
            }}
            disabled={!canProceed}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DC2626]/30 bg-[#FEECEC] px-4 py-2.5 text-sm font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2] disabled:opacity-50"
          >
            <ShieldX className="h-4 w-4" />
            Reject Case
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      {confirm && decision && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !pending && setConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-[#102A43]">
              {decision === "RESOLVE"
                ? "Confirm Resolve"
                : "Confirm Reject"}
            </h3>
            <p className="mt-1 text-sm text-[#627D98]">
              This decision cannot be undone. The citizen will see your remark.
            </p>

            <div className="mt-4 space-y-3 rounded-xl border border-[#D9E2EC] bg-[#F7FAFC] p-4 text-sm">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
                  Report
                </span>
                <p className="mt-0.5 font-mono">{reportCode}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
                  Finding
                </span>
                <p className="mt-0.5">
                  {violationFound
                    ? `Violation found · ${violationType}`
                    : "No violation found"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
                  Decision
                </span>
                <p className="mt-0.5 font-semibold">
                  {decision === "RESOLVE" ? "Resolve Case" : "Reject Case"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
                  Remark
                </span>
                <p className="mt-0.5 italic">&ldquo;{remark.trim()}&rdquo;</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirm(false)}
                disabled={pending}
                className="rounded-lg border border-[#D9E2EC] px-4 py-2 text-sm font-semibold text-[#627D98] transition hover:bg-[#F7FAFC] disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={submit}
                disabled={pending}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${
                  decision === "RESOLVE"
                    ? "bg-[#16A34A] hover:bg-[#15803D]"
                    : "bg-[#DC2626] hover:bg-[#B91C1C]"
                }`}
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}