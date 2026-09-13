import Link from "next/link";

export default function AccountInactivePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7FAFC] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#D9E2EC] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FEECEC]">
          <svg
            className="h-7 w-7 text-[#DC2626]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>

        <h1 className="mt-4 text-lg font-bold text-[#102A43]">
          Your account is inactive
        </h1>
        <p className="mt-2 text-sm text-[#627D98]">
          Access to CheckItRight has been disabled for this account. If you
          believe this is a mistake, please contact support.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-[#1769AA] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#135a92]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}