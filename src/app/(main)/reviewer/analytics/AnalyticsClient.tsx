"use client";

import {
  FileText,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { ReviewerAnalytics } from "@/lib/reviewer/get-reviewer-analytics";

export default function AnalyticsClient({
  data,
}: {
  data: ReviewerAnalytics;
}) {
  const firstWeek = data.weeks[0]?.label ?? "";
  const lastWeek = data.weeks[data.weeks.length - 1]?.label ?? "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#102A43]">Analytics</h2>
        <p className="mt-1 text-sm text-[#627D98]">
          Your review activity and decisions.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total Reviewed" value={data.totalReviewed} />
        <Stat label="Forwarded" value={data.forwardedCount} />
        <Stat label="Rejected" value={data.rejectedCount} />
        <Stat
          label="Avg / week"
          value={data.avgPerWeek.toFixed(1)}
        />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card
          title="Reviews per week"
          hint={`Last 12 weeks · ${firstWeek} → ${lastWeek}`}
          icon={<TrendingUp className="h-4 w-4 text-[#1769AA]" />}
        >
          {data.totalReviewed === 0 ? (
            <p className="py-10 text-center text-xs text-[#829AB1]">
              No reviews yet.
            </p>
          ) : (
            <WeeklyBars weeks={data.weeks} />
          )}
        </Card>

        <Card
          title="Decisions"
          hint="Reports you forwarded or rejected"
          icon={<CheckCircle2 className="h-4 w-4 text-[#16A34A]" />}
        >
          {data.totalReviewed === 0 ? (
            <p className="py-10 text-center text-xs text-[#829AB1]">
              No decisions yet.
            </p>
          ) : (
            <DecisionBars
              forwarded={data.forwardedCount}
              rejected={data.rejectedCount}
            />
          )}
        </Card>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card
          title="Reports by issue type"
          hint="Across your reviews"
          icon={<FileText className="h-4 w-4 text-[#1769AA]" />}
        >
          {data.issues.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#829AB1]">
              No reports yet.
            </p>
          ) : (
            <IssueBars issues={data.issues} />
          )}
        </Card>

        <Card
          title="Current status mix"
          hint="All reports you reviewed"
          icon={<XCircle className="h-4 w-4 text-[#DC2626]" />}
        >
          <StatusList statuses={data.statuses} />
        </Card>
      </div>
    </div>
  );
}

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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#D9E2EC] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#829AB1]">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-[#102A43]">{value}</p>
    </div>
  );
}

function WeeklyBars({
  weeks,
}: {
  weeks: { label: string; reviewed: number }[];
}) {
  const max = Math.max(1, ...weeks.map((w) => w.reviewed));
  return (
    <div className="flex h-40 items-end gap-1.5">
      {weeks.map((w, i) => {
        const h = (w.reviewed / max) * 100;
        return (
          <div
            key={i}
            className="group relative flex flex-1 flex-col items-center"
          >
            <div
              className="w-full rounded-t bg-[#1769AA] transition-all"
              style={{ height: `${h}%`, minHeight: 2 }}
            />
            <span className="pointer-events-none absolute -top-6 rounded bg-[#0B1F33] px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
              {w.reviewed}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DecisionBars({
  forwarded,
  rejected,
}: {
  forwarded: number;
  rejected: number;
}) {
  const total = forwarded + rejected;
  const fwdPct = total > 0 ? (forwarded / total) * 100 : 0;
  const rejPct = total > 0 ? (rejected / total) * 100 : 0;

  return (
    <div className="space-y-4 py-4">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-[#486581]">Forwarded</span>
          <span className="font-semibold text-[#102A43]">
            {forwarded} ({fwdPct.toFixed(0)}%)
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#F7FAFC]">
          <div
            className="h-full bg-[#1769AA]"
            style={{ width: `${fwdPct}%` }}
          />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-[#486581]">Rejected</span>
          <span className="font-semibold text-[#102A43]">
            {rejected} ({rejPct.toFixed(0)}%)
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#F7FAFC]">
          <div
            className="h-full bg-[#DC2626]"
            style={{ width: `${rejPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function IssueBars({
  issues,
}: {
  issues: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(1, ...issues.map((i) => i.value));
  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <div key={issue.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="truncate text-[#486581]">{issue.label}</span>
            <span className="font-semibold text-[#102A43]">
              {issue.value}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#F7FAFC]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(issue.value / max) * 100}%`,
                background: issue.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusList({
  statuses,
}: {
  statuses: { key: string; label: string; value: number; color: string }[];
}) {
  const total = statuses.reduce((sum, s) => sum + s.value, 0);
  return (
    <div className="space-y-3">
      {statuses.map((s) => {
        const pct = total > 0 ? (s.value / total) * 100 : 0;
        return (
          <div key={s.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-[#486581]">{s.label}</span>
              <span className="font-semibold text-[#102A43]">
                {s.value}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#F7FAFC]">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: s.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}