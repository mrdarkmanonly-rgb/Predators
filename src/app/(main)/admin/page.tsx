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

import LogoutButton from "@/components/global/logout-button";
// import { requireRole } from "@/lib/auth-guard";

import AdminSidebar from "./components/AdminSidebar";
import StatCard from "./components/StatCard";
import ReportsChart from "./components/ReportsChart";
import IssueTypeChart from "./components/IssueTypeChart";
import DashboardLists from "./components/DashboardLists";

export default async function AdminPage() {
  // const user = await requireRole(["ADMIN"]);
  const user = {
    name: "Admin",
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">

        {/* Header */}
        <header className="border-b border-[#D9E2EC] bg-white">
          <div className="flex items-center justify-between px-8 py-5">

            <div>
              <h1 className="text-3xl font-bold text-[#102A43]">
                Admin Dashboard
              </h1>

              <p className="mt-1 text-sm text-[#627D98]">
                System Overview
                <span className="mx-2">•</span>
                Manage
                <span className="mx-2">•</span>
                Monitor
                <span className="mx-2">•</span>
                Ensure Compliance
              </p>
            </div>

            <LogoutButton />

          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">

          {/* Welcome */}
          <div className="mb-7 flex items-end justify-between gap-6">

            <div>
              <h2 className="text-2xl font-bold text-[#102A43]">
                Welcome back, {user.name ?? "Admin"}!
              </h2>

              <p className="mt-1 text-sm text-[#627D98]">
                Here's what's happening with CheckItRight today.
              </p>
            </div>

            <div className="hidden text-right md:block">
              <p className="text-xs text-[#829AB1]">
                System Overview
              </p>

              <p className="text-sm font-semibold text-[#486581]">
                Admin Control Panel
              </p>
            </div>

          </div>

          {/* Search Bar */}
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
                  d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
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
              value="12,482"
              change="↑ 8%"
              subtitle="+924 this month"
              icon={Users}
              iconBg="bg-[#E8F1FB]"
              iconColor="text-[#1769AA]"
            />

            <StatCard
              title="Total Products"
              value="9,431"
              change="↑ 5%"
              subtitle="+431 this month"
              icon={Package}
              iconBg="bg-[#EAF8F0]"
              iconColor="text-[#16A34A]"
            />

            <StatCard
              title="Total Scans"
              value="84,291"
              change="↑ 12%"
              subtitle="+9,021 this month"
              icon={ScanLine}
              iconBg="bg-[#F2EDFF]"
              iconColor="text-[#7C3AED]"
            />

            <StatCard
              title="Citizen Reports"
              value="3,821"
              change="↑ 18%"
              subtitle="+582 this month"
              icon={FileText}
              iconBg="bg-[#FFF4E8]"
              iconColor="text-[#F97316]"
            />

            <StatCard
              title="Verified Violations"
              value="721"
              change="↑ 14%"
              subtitle="+88 this month"
              icon={AlertCircle}
              iconBg="bg-[#FEECEC]"
              iconColor="text-[#DC2626]"
            />

            <StatCard
              title="Active Inspections"
              value="53"
              change="↑ 25%"
              subtitle="+11 this month"
              icon={ClipboardCheck}
              iconBg="bg-[#FFF6DF]"
              iconColor="text-[#F59E0B]"
            />

            <StatCard
              title="Resolved Cases"
              value="1,268"
              change="↑ 20%"
              subtitle="+210 this month"
              icon={CheckCircle2}
              iconBg="bg-[#EAF8F0]"
              iconColor="text-[#16A34A]"
            />

            <StatCard
              title="Pending Reviews"
              value="317"
              change="↓ 6%"
              subtitle="-21 this month"
              icon={BarChart3}
              iconBg="bg-[#E8F1FB]"
              iconColor="text-[#1769AA]"
              positive={false}
            />

          </section>

          {/* Charts */}
          <section className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-2">

            <ReportsChart />

            <IssueTypeChart />

          </section>

          {/* Recent Reports / Inspections / Activities */}
          <section className="mt-7">

            <DashboardLists />

          </section>

        </div>

      </main>
    </div>
  );
}