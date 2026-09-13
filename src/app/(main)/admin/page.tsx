import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Package,
  ScanLine,
  Users,
} from "lucide-react";

import { getAdminDashboard } from "@/lib/admin/get-admin-dashboard";
import StatCard from "./components/StatCard";
import ReportsChart from "./components/ReportsChart";
import IssueTypeChart from "./components/IssueTypeChart";
import DashboardLists from "./components/DashboardLists";

export default async function AdminPage() {
  const data = await getAdminDashboard();

  const fmt = (n: number) => n.toLocaleString("en-IN");

  return (
    <>
      {/* Welcome */}
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[#102A43]">
            Welcome back, {data.admin.name}!
          </h2>
          <p className="mt-1 text-sm text-[#627D98]">
            Here&apos;s what&apos;s happening with CheckItRight today.
          </p>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-xs text-[#829AB1]">System Overview</p>
          <p className="text-sm font-semibold text-[#486581]">
            Admin Control Panel
          </p>
        </div>
      </div>

      {/* Search — visual only; wire in Phase C */}
      <div className="mb-7">
        <div className="flex items-center rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 shadow-sm">
          <svg
            className="mr-3 h-5 w-5 text-[#829AB1]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 0-14 0 7 7 0 0 0 14 0Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search reports, users, products..."
            className="w-full bg-transparent text-sm text-[#102A43] outline-none placeholder:text-[#9FB3C8]"
          />
        </div>
      </div>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={fmt(data.stats.totalUsers)}
          icon={Users}
          iconBg="bg-[#E8F1FB]"
          iconColor="text-[#1769AA]"
        />
        <StatCard
          title="Total Products"
          value={fmt(data.stats.totalProducts)}
          icon={Package}
          iconBg="bg-[#EAF8F0]"
          iconColor="text-[#16A34A]"
        />
        <StatCard
          title="Total Scans"
          value={fmt(data.stats.totalScans)}
          icon={ScanLine}
          iconBg="bg-[#F2EDFF]"
          iconColor="text-[#7C3AED]"
        />
        <StatCard
          title="Citizen Reports"
          value={fmt(data.stats.totalReports)}
          icon={FileText}
          iconBg="bg-[#FFF4E8]"
          iconColor="text-[#F97316]"
        />
        <StatCard
          title="Violations Found"
          value={fmt(data.stats.violationsFound)}
          icon={AlertCircle}
          iconBg="bg-[#FEECEC]"
          iconColor="text-[#DC2626]"
        />
        <StatCard
          title="Active Inspections"
          value={fmt(data.stats.activeInspections)}
          icon={ClipboardCheck}
          iconBg="bg-[#FFF6DF]"
          iconColor="text-[#F59E0B]"
        />
        <StatCard
          title="Resolved Cases"
          value={fmt(data.stats.resolvedCases)}
          icon={CheckCircle2}
          iconBg="bg-[#EAF8F0]"
          iconColor="text-[#16A34A]"
        />
        <StatCard
          title="Pending Reviews"
          value={fmt(data.stats.pendingReviews)}
          icon={BarChart3}
          iconBg="bg-[#E8F1FB]"
          iconColor="text-[#1769AA]"
        />
      </section>

      {/* Charts */}
      <section className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ReportsChart data={data.trends} />
        <IssueTypeChart
          data={data.issueTypes}
          total={data.stats.totalReports}
        />
      </section>

      {/* Lists */}
      <section className="mt-7">
        <DashboardLists
          reports={data.recentReports}
          inspections={data.activeInspections}
          activities={data.recentActivities}
        />
      </section>
    </>
  );
}