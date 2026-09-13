"use client";

import {
  FileText,
  AlertCircle,
  TrendingUp,
  UserRound,
  Package,
  Clock,
} from "lucide-react";
import type {
  AnalyticsData,
  FunnelRow,
  TopInspector,
  TopProduct,
  WeekPoint,
} from "@/lib/admin/get-admin-analytics";

// ── card wrapper ──
function Card({
  title,
  hint,
  icon,
  children,
}: {
  title: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#102A43]">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-[#829AB1]">{hint}</p>}
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF4FF]">
            {icon}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// ── weekly bar chart ──
function WeekBars({
  weeks,
  field,
  color,
}: {
  weeks: WeekPoint[];
  field: "reports" | "violations";
  color: string;
}) {
  const max = Math.max(1, ...weeks.map((w) => w[field]));
  return (
    <div className="flex h-40 items-end gap-1.5">
      {weeks.map((w, i) => {
        const h = (w[field] / max) * 100;
        return (
          <div
            key={i}
            className="group relative flex flex-1 flex-col items-center"
          >
            <div
              className="w-full rounded-t transition-all"
              style={{ height: `${h}%`, background: color, minHeight: 2 }}
            />
            <span className="pointer-events-none absolute -top-6 rounded bg-[#0B1F33] px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
              {w[field]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const weekFirst = data.weeks[0]?.label ?? "";
  const weekLast = data.weeks[data.weeks.length - 1]?.label ?? "";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#102A43]">Analytics</h2>
        <p className="mt-1 text-sm text-[#627D98]">
          System-wide metrics and trends.
        </p>
      </div>

      {/* Top summary row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MiniStat label="Total reports" value={data.totalReports} />
        <MiniStat label="Total inspections" value={data.totalInspections} />
        <MiniStat
          label="Avg resolution time"
          value={
            data.avgResolutionDays != null
              ? `${data.avgResolutionDays.toFixed(1)} days`
              : "—"
          }
        />
        <MiniStat
          label="Avg time to claim"
          value="—"
        />
      </div>

      {/* Row 1 — trends */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card
          title="Reports per week"
          hint={`Last 12 weeks · ${weekFirst} → ${weekLast}`}
          icon={<FileText className="h-4 w-4 text-[#1769AA]" />}
        >
          {data.totalReports === 0 ? (
            <p className="py-10 text-center text-xs text-[#829AB1]">
              No reports yet.
            </p>
          ) : (
            <WeekBars weeks={data.weeks} field="reports" color="#1769AA" />
          )}
        </Card>

        <Card
          title="Violations per week"
          hint="Confirmed during field inspection"
          icon={<AlertCircle className="h-4 w-4 text-[#DC2626]" />}
        >
          {data.weeks.every((w) => w.violations === 0) ? (
            <p className="py-10 text-center text-xs text-[#829AB1]">
              No violations recorded yet.
            </p>
          ) : (
            <WeekBars
              weeks={data.weeks}
              field="violations"
              color="#DC2626"
            />
          )}
        </Card>
      </div>

      {/* Row 2 — funnel + inspectors */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card
          title="Status funnel"
          hint="All reports by current status"
          icon={<TrendingUp className="h-4 w-4 text-[#1769AA]" />}
        >
          {data.totalReports === 0 ? (
            <p className="py-10 text-center text-xs text-[#829AB1]">
              No reports yet.
            </p>
          ) : (
            <Funnel data={data.funnel} />
          )}
        </Card>

        <Card
          title="Top inspectors"
          hint="Ranked by claimed cases"
          icon={<UserRound className="h-4 w-4 text-[#1769AA]" />}
        >
          {data.topInspectors.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#829AB1]">
              No inspections claimed yet.
            </p>
          ) : (
            <InspectorList rows={data.topInspectors} />
          )}
        </Card>
      </div>

      {/* Row 3 — top products + quick stat */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card
          title="Top reported products"
          hint="By number of citizen reports"
          icon={<Package className="h-4 w-4 text-[#1769AA]" />}
        >
          {data.topProducts.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#829AB1]">
              No reported products yet.
            </p>
          ) : (
            <ProductList rows={data.topProducts} />
          )}
        </Card>

        <Card
          title="Average resolution time"
          hint="From submission to resolved"
          icon={<Clock className="h-4 w-4 text-[#1769AA]" />}
        >
          <div className="flex h-40 flex-col items-center justify-center">
            {data.avgResolutionDays != null ? (
              <>
                <p className="text-5xl font-bold text-[#102A43]">
                  {data.avgResolutionDays.toFixed(1)}
                </p>
                <p className="mt-2 text-xs text-[#627D98]">days on average</p>
              </>
            ) : (
              <p className="text-xs text-[#829AB1]">
                No resolved reports yet.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── subcomponents ──
function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#829AB1]">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-[#102A43]">{value}</p>
    </div>
  );
}

function Funnel({ data }: { data: FunnelRow[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div key={row.key}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-[#486581]">{row.label}</span>
            <span className="font-semibold text-[#102A43]">{row.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#F7FAFC]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(row.value / max) * 100}%`,
                background: row.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function InspectorList({ rows }: { rows: TopInspector[] }) {
  const max = Math.max(1, ...rows.map((r) => r.claimed));
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="truncate text-[#486581]">{r.name}</span>
            <span className="whitespace-nowrap font-semibold text-[#102A43]">
              {r.claimed} claimed · {r.completed} done
              {r.violations > 0 ? ` · ${r.violations} violations` : ""}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#F7FAFC]">
            <div
              className="h-full rounded-full bg-[#1769AA]"
              style={{ width: `${(r.claimed / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductList({ rows }: { rows: TopProduct[] }) {
  const max = Math.max(1, ...rows.map((r) => r.reports));
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="truncate text-[#486581]">
              {r.name}
              {r.category ? (
                <span className="ml-2 text-[#829AB1]">{r.category}</span>
              ) : null}
            </span>
            <span className="whitespace-nowrap font-semibold text-[#102A43]">
              {r.reports} {r.reports === 1 ? "report" : "reports"}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#F7FAFC]">
            <div
              className="h-full rounded-full bg-[#1769AA]"
              style={{ width: `${(r.reports / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}