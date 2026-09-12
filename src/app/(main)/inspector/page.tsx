"use client";

// import { requireRole } from "@/lib/auth-guard";
import { useState } from "react";
import InspectorSidebar from "./components/InspectorSidebar";
import MobileDrawer from "./components/MobileDrawer";
import MobileBottomNav from "./components/MobileBottomNav";
import MobileScanCTA from "./components/MobileScanCTA";
import InspectorTopbar from "./components/InspectorTopbar";
import WelcomeHeader from "./components/WelcomeHeader";
import StatsGrid from "./components/StatsGrid";
import TodaysSchedule from "./components/TodaysSchedule";
import CasesByStatus from "./components/CasesByStatus";
import InspectionsByIssueType from "./components/InspectionsByIssueType";
import RecentActivity from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";
import InspectionWorkflowStrip from "./components/InspectionWorkflowStrip";

export default function InspectorDashboardPage() {
  // const user = await requireRole(["INSPECTOR"]);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F7FAFC]">
      {/* Desktop sidebar */}
      <InspectorSidebar />

      {/* Mobile slide-in drawer */}
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <InspectorTopbar onOpenMenu={() => setMenuOpen(true)} />

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-5 sm:gap-6">
            <WelcomeHeader />

            <StatsGrid />

            {/* Mobile-only prominent Scan CTA */}
            <MobileScanCTA />

            {/* Middle row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <TodaysSchedule />
              </div>
              <div className="lg:col-span-3">
                <CasesByStatus />
              </div>
              <div className="lg:col-span-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <RecentActivity />
                  <InspectionsByIssueType />
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-12">
                <QuickActions />
              </div>
            </div>

            {/* Workflow strip */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#627D98]">
                  Inspection Workflow
                </h2>
                <span className="hidden text-[10px] font-medium text-[#627D98] sm:inline">
                  Preview · will connect to backend later
                </span>
              </div>
              <InspectionWorkflowStrip />
            </section>
          </div>
        </main>

        {/* Footer (hidden on mobile because bottom nav occupies it) */}
        <footer className="hidden border-t border-[#D9E2EC] bg-white px-4 py-3 sm:px-6 lg:block lg:px-8">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-1 text-[10px] font-medium text-[#627D98] sm:flex-row">
            <span>CheckItRight · Consumer Protection · Fair Trade · A Stronger India</span>
            <span>On Ground. For Fair Trade. For a Stronger India.</span>
          </div>
        </footer>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}