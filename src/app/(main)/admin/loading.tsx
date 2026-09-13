export default function AdminLoading() {
  return (
    <>
      <div className="mb-7">
        <div className="h-7 w-72 animate-pulse rounded bg-[#E6EDF3]" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-[#E6EDF3]" />
      </div>

      <div className="mb-7 h-12 w-full animate-pulse rounded-xl bg-[#E6EDF3]" />

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 w-24 animate-pulse rounded bg-[#E6EDF3]" />
                <div className="mt-3 h-7 w-20 animate-pulse rounded bg-[#E6EDF3]" />
              </div>
              <div className="h-11 w-11 animate-pulse rounded-full bg-[#E6EDF3]" />
            </div>
          </div>
        ))}
      </section>

      <section className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-xl border border-[#D9E2EC] bg-white shadow-sm"
          />
        ))}
      </section>

      <section className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-xl border border-[#D9E2EC] bg-white shadow-sm"
          />
        ))}
      </section>
    </>
  );
}