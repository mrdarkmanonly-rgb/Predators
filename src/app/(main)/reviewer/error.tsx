"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ReviewerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[reviewer dashboard error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-[#D9E2EC] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FEECEC]">
          <AlertCircle className="h-7 w-7 text-[#DC2626]" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-[#102A43]">
          Couldn&apos;t load this page
        </h1>
        <p className="mt-2 text-sm text-[#627D98]">
          Something went wrong while fetching data. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1769AA] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#135a92]"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}