"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  UserRound,
} from "lucide-react";
import type {
  RecentReport,
  ActiveInspection,
  RecentActivity,
} from "@/lib/admin/get-admin-dashboard";

// ── relative time (client-only, avoids hydration mismatch) ──
function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState<string>("");
  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(iso).getTime();
      const s = Math.floor(diff / 1000);
      if (s < 60) setLabel("just now");
      else if (s < 3600) setLabel(`${Math.floor(s / 60)} min ago`);
      else if (s < 86_400) {
        const h = Math.floor(s / 3600);
        setLabel(`${h} hour${h === 1 ? "" : "s"} ago`);
      } else {
        const d = Math.floor(s / 86_400);
        setLabel(`${d} day${d === 1 ? "" : "s"} ago`);
      }
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [iso]);
  return <span suppressHydrationWarning>{label}</span>;
}

// ── helpers ──
function reportStatusStyle(status: RecentReport["status"]) {
  switch (status) {
    case "Pending Review":
      return "bg-[#FEF3C7] text-[#B45309]";
    case "Sent to Inspector":
      return "bg-[#DBEAFE] text-[#1D4ED8]";
    case "Rejected":
      return "bg-[#FEECEC] text-[#DC2626]";
    case "Resolved":
      return "bg-[#DCFCE7] text-[#15803D]";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── component ──
export default function DashboardLists({
  reports,
  inspections,
  activities,
}: {
  reports: RecentReport[];
  inspections: ActiveInspection[];
  activities: RecentActivity[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      {/* Recent Reports */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D9E2EC] px-5 py-4">
          <h2 className="font-bold text-[#102A43]">Recent Reports</h2>
          <a
            href="/admin/reports"
            className="flex items-center gap-1 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            View all
            <ArrowRight size={14} />
          </a>
        </div>

        {reports.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-[#829AB1]">
            No reports yet.
          </p>
        ) : (
          <div className="divide-y divide-[#D9E2EC]">
            {reports.map((report) => (
              <div key={report.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">
                      <FileText size={18} className="text-[#1769AA]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#102A43]">
                        {report.code}
                      </p>
                      <p className="mt-1 text-xs text-[#627D98]">
                        {report.product}
                      </p>
                      <p
                        className="mt-1 text-[11px] text-[#829AB1]"
                        suppressHydrationWarning
                      >
                        {formatDateTime(report.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${reportStatusStyle(
                      report.status,
                    )}`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Inspections */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D9E2EC] px-5 py-4">
          <h2 className="font-bold text-[#102A43]">Active Inspections</h2>
          <a
            href="/admin/inspections"
            className="flex items-center gap-1 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            View all
            <ArrowRight size={14} />
          </a>
        </div>

        {inspections.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-[#829AB1]">
            No active inspections.
          </p>
        ) : (
          <div className="divide-y divide-[#D9E2EC]">
            {inspections.map((insp) => (
              <div key={insp.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#102A43]">
                      {insp.code}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-[#627D98]">
                      <MapPin size={13} />
                      {insp.location}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-[#829AB1]">
                      <UserRound size={12} />
                      Inspector: {insp.inspectorName}
                    </div>
                  </div>
                  <span className="whitespace-nowrap rounded-full bg-[#DBEAFE] px-2 py-1 text-[10px] font-semibold text-[#1D4ED8]">
                    In Progress
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activities */}
      <div className="rounded-xl border border-[#D9E2EC] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D9E2EC] px-5 py-4">
          <h2 className="font-bold text-[#102A43]">Recent Activities</h2>
          <a
            href="/admin/audit-logs"
            className="flex items-center gap-1 text-xs font-semibold text-[#1769AA] hover:underline"
          >
            View all
            <ArrowRight size={14} />
          </a>
        </div>

        {activities.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-[#829AB1]">
            No recent activity.
          </p>
        ) : (
          <div className="divide-y divide-[#D9E2EC]">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
                  {activity.type === "report" && (
                    <FileText size={17} className="text-[#1769AA]" />
                  )}
                  {activity.type === "user" && (
                    <UserRound size={17} className="text-[#1769AA]" />
                  )}
                  {activity.type === "inspection" && (
                    <CheckCircle2 size={17} className="text-[#16A34A]" />
                  )}
                  {activity.type === "product" && (
                    <Clock size={17} className="text-[#F59E0B]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#102A43]">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-xs text-[#627D98]">
                    {activity.description}
                  </p>
                  <p className="mt-1 text-[11px] text-[#829AB1]">
                    <RelativeTime iso={activity.occurredAt} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}