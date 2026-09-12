export default function WelcomeHeader() {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-[#102A43] sm:text-2xl">
          Welcome back, Inspector Kumar!
        </h1>
        <p className="mt-0.5 text-sm text-[#627D98]">
          Here&apos;s your field inspection overview.
        </p>
      </div>
      <span className="text-xs font-medium text-[#627D98]">
        Mon, 15 Sep 2025
      </span>
    </div>
  );
}