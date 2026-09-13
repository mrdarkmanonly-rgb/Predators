"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { forwardReport, rejectReport } from "@/actions/reviewer/review.actions";

type Action = "reject" | "forward";

export default function ReviewActions({
  reportId,
  reportCode,
}: {
  reportId: string;
  reportCode: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<Action | null>(null);
  const [remark, setRemark] = useState("");
  const [confirm, setConfirm] = useState(false);

  function openAction(a: Action) {
    setAction(a);
    setRemark("");
    setConfirm(false);
  }

  function closeAction() {
    if (pending) return;
    setAction(null);
    setRemark("");
    setConfirm(false);
  }

  const remarkValid = remark.trim().length >= 5;

  function submit() {
    if (!action || !remarkValid) return;

    startTransition(async () => {
      const res =
        action === "reject"
          ? await rejectReport(reportId, remark)
          : await forwardReport(reportId, remark);

      if (res.ok) {
        toast.success(
          action === "reject"
            ? "Report rejected"
            : "Report forwarded to inspector pool",
        );
        router.refresh();
        closeAction();
      } else {
        toast.error(res.reason);
      }
    });
  }

  return (
    <>
      <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#102A43]">
          Review decision
        </h3>
        <p className="mt-1 text-xs text-[#627D98]">
          A remark is required for both actions — it will be visible to the
          citizen.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => openAction("forward")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1769AA] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#135a92]"
          >
            <CheckCircle2 className="h-4 w-4" />
            Forward to Inspector
          </button>
          <button
            onClick={() => openAction("reject")}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DC2626]/30 bg-[#FEECEC] px-4 py-2.5 text-sm font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2]"
          >
            <XCircle className="h-4 w-4" />
            Reject Report
          </button>
        </div>
      </div>

      <AnimatePresence>
        {action && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={closeAction}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            >
              {!confirm ? (
                <>
                  <h3 className="text-lg font-bold text-[#102A43]">
                    {action === "reject"
                      ? "Reject this report?"
                      : "Forward this report to the inspector pool?"}
                  </h3>
                  <p className="mt-1 text-sm text-[#627D98]">
                    {action === "reject"
                      ? "Explain why this report is being rejected. The citizen will see this remark."
                      : "Explain what the inspector should verify. The inspector will see this note when they claim the case."}
                  </p>

                  <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
                    {action === "reject"
                      ? "Reviewer Remark / Rejection Reason *"
                      : "Reviewer Remark / Forwarding Note *"}
                  </label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows={4}
                    placeholder={
                      action === "reject"
                        ? "e.g. Report does not contain sufficient evidence to establish a packaging declaration violation."
                        : "e.g. Reported MRP mismatch appears significant. Forwarding for field verification of the product label and sale price."
                    }
                    className="mt-2 w-full resize-none rounded-xl border border-[#D9E2EC] bg-[#F7FAFC] p-3 text-sm text-[#102A43] outline-none focus:border-[#1769AA] focus:bg-white"
                  />
                  {!remarkValid && remark.length > 0 && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      Remark must be at least 5 characters.
                    </p>
                  )}

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      onClick={closeAction}
                      className="rounded-lg border border-[#D9E2EC] px-4 py-2 text-sm font-semibold text-[#627D98] transition hover:bg-[#F7FAFC]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setConfirm(true)}
                      disabled={!remarkValid}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${
                        action === "reject"
                          ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                          : "bg-[#1769AA] hover:bg-[#135a92]"
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-[#102A43]">
                    Confirm
                  </h3>
                  <p className="mt-1 text-sm text-[#627D98]">
                    Please confirm this decision. It cannot be undone.
                  </p>

                  <div className="mt-4 rounded-xl border border-[#D9E2EC] bg-[#F7FAFC] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
                      Action
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#102A43]">
                      {action === "reject"
                        ? "Reject Report"
                        : "Forward to Inspector"}
                    </p>

                    <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
                      Report
                    </p>
                    <p className="mt-1 text-sm font-mono text-[#102A43]">
                      {reportCode}
                    </p>

                    <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#829AB1]">
                      Remark
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm italic text-[#486581]">
                      &ldquo;{remark.trim()}&rdquo;
                    </p>
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
                        action === "reject"
                          ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                          : "bg-[#1769AA] hover:bg-[#135a92]"
                      }`}
                    >
                      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {action === "reject"
                        ? "Confirm Reject"
                        : "Confirm Forward"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}