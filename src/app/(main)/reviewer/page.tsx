import { getReviewerDashboard } from "@/lib/reviewer/get-reviewer-dashboard";
import StatsGrid from "./components/StatsGrid";
import StatusDonut from "./components/StatusDonut";
import IssueTypeChart from "./components/IssueTypeChart";
import ReviewQueue from "./components/ReviewQueue";

export default async function ReviewerDashboardPage() {
  const data = await getReviewerDashboard();

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[#102A43]">
            Welcome back, {data.reviewer.name}!
          </h2>
          <p className="mt-1 text-sm text-[#627D98]">
            Here&apos;s your review overview.
          </p>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-xs text-[#829AB1]">System Overview</p>
          <p className="text-sm font-semibold text-[#486581]">
            Reviewer Control Panel
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid stats={data.stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <StatusDonut segments={data.segments} total={data.totalReports} />
        <IssueTypeChart data={data.issueTypes} />
      </div>

      {/* Queue */}
      <ReviewQueue rows={data.queue} />
    </div>
  );
}