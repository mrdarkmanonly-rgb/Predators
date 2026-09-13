import { redirect } from "next/navigation";
import Link from "next/link";
import { searchUserData } from "@/lib/consumer/search";

const SCAN_STATUS: Record<string, string> = {
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

const REPORT_STATUS: Record<string, string> = {
  SUBMITTED: "Submitted",
  FORWARDED_TO_INSPECTOR: "Forwarded to Inspector",
  REJECTED: "Rejected",
  RESOLVED: "Resolved",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const data = await searchUserData(q);
  if (!data) redirect("/login");

  const total = data.scans.length + data.reports.length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#102A43]">Search</h1>
        <p className="text-sm text-[#627D98] mt-1">
          {q
            ? `${total} result${total === 1 ? "" : "s"} for “${q}”`
            : "Type a query in the top bar and press Enter."}
        </p>
      </div>

      {q && total === 0 && (
        <div className="bg-white rounded-2xl border border-[#D9E2EC] p-12 text-center">
          <p className="text-sm text-[#627D98]">
            Nothing found for “{q}”.
          </p>
        </div>
      )}

      {data.scans.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#627D98] mb-2">
            Scans ({data.scans.length})
          </h2>
          <div className="bg-white rounded-2xl border border-[#D9E2EC] divide-y divide-[#EAF0F6]">
            {data.scans.map((s) => (
              <Link
                key={s.id}
                href={`/consumer/scans`}
                className="flex items-center justify-between p-4 hover:bg-[#F7FAFC] transition"
              >
                <div>
                  <p className="text-sm font-semibold text-[#102A43]">
                    {s.productName}
                  </p>
                  <p className="text-xs text-[#627D98] mt-0.5">
                    {fmt(s.createdAt)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#1769AA]">
                  {SCAN_STATUS[s.status] ?? s.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.reports.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#627D98] mb-2">
            Reports ({data.reports.length})
          </h2>
          <div className="bg-white rounded-2xl border border-[#D9E2EC] divide-y divide-[#EAF0F6]">
            {data.reports.map((r) => (
              <Link
                key={r.id}
                href={`/consumer/reports`}
                className="flex items-center justify-between p-4 hover:bg-[#F7FAFC] transition"
              >
                <div>
                  <p className="text-sm font-semibold text-[#102A43]">
                    {r.productName}
                  </p>
                  <p className="text-xs text-[#627D98] mt-0.5">
                    #{r.reportCode} · {fmt(r.createdAt)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#1769AA]">
                  {REPORT_STATUS[r.status] ?? r.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}