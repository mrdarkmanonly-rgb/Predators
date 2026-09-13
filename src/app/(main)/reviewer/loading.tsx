export default function ReviewerLoading() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-72 animate-pulse rounded bg-[#E6EDF3]" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-[#D9E2EC] bg-white shadow-sm"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-[#D9E2EC] bg-white shadow-sm"
          />
        ))}
      </div>

      <div className="h-96 animate-pulse rounded-xl border border-[#D9E2EC] bg-white shadow-sm" />
    </div>
  );
}