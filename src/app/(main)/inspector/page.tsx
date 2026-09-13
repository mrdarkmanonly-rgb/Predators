import { getInspectorDashboard } from "@/lib/inspector/get-inspector-dashboard";
import MobileScanCTA from "./components/MobileScanCTA";
import WelcomeHeader from "./components/WelcomeHeader";
import StatsGrid from "./components/StatsGrid";
import TodaysSchedule from "./components/TodaysSchedule";
import CasesByStatus from "./components/CasesByStatus";
import InspectionsByIssueType from "./components/InspectionsByIssueType";
import RecentActivity from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";
import InspectionWorkflowStrip from "./components/InspectionWorkflowStrip";

export default async function InspectorDashboardPage() {
  const data = await getInspectorDashboard();

  return (
    <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 sm:gap-6">
        <WelcomeHeader name={data.inspector.name} />

        <StatsGrid stats={data.stats} />

        <MobileScanCTA />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <TodaysSchedule />
          </div>
          <div className="lg:col-span-3">
            <CasesByStatus
              segments={data.segments}
              total={data.totalCases}
            />
          </div>
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RecentActivity activity={data.recentActivity} />
              <InspectionsByIssueType data={data.violationsByType} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <QuickActions />
          </div>
        </div>

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
  );
}