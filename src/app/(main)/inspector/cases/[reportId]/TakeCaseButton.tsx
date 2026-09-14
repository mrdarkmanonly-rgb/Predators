"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { claimCase } from "@/actions/inspector/claim.actions";

export default function TakeCaseButton({
  reportId,
  reportCode,
}: {
  reportId: string;
  reportCode: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function take() {
    startTransition(async () => {
      const res = await claimCase(reportId);

      if (res.ok) {
        toast.success("Case claimed", {
          description: `${reportCode} is now in My Cases.`,
        });
        router.push("/inspector/my-cases");
        router.refresh();
      } else if (res.reason === "ALREADY_CLAIMED") {
        toast.error("Already claimed", {
          description: "Another inspector took this case first.",
        });
        router.push("/inspector/available");
        router.refresh();
      } else if (res.reason === "NOT_AVAILABLE") {
        toast.error("Case no longer available");
        router.push("/inspector/available");
        router.refresh();
      } else {
        toast.error("Could not claim case");
      }
    });
  }

  return (
    <div className="sticky bottom-4 z-30 rounded-xl border border-[#1769AA]/20 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(16,42,67,0.08)] backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#102A43]">
            Ready to inspect this case?
          </p>
          <p className="text-xs text-[#627D98]">
            Claiming assigns it to you and removes it from the available pool.
          </p>
        </div>
        <button
          onClick={take}
          disabled={pending}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1769AA] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#135a92] disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Claiming…
            </>
          ) : (
            <>
              <Briefcase className="h-4 w-4" />
              Take Case
            </>
          )}
        </button>
      </div>
    </div>
  );
}