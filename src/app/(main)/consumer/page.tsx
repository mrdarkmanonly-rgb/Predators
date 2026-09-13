import { redirect } from "next/navigation";
import PageTransition from "@/components/consumer/PageTransition";
import HeroSection from "@/components/consumer/HeroSection";
import StatsGrid from "@/components/consumer/StatsGrid";
import QuickScanCard from "@/components/consumer/QuickScanCard";
import RecentScans from "@/components/consumer/RecentScans";
import RecentReports from "@/components/consumer/RecentReports";
import { getUserDashboard } from "@/lib/consumer/get-user-dashboard";

export default async function UserDashboardPage() {
  const data = await getUserDashboard();

  if (!data) redirect("/login");

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">
        <HeroSection name={data.user.name} />

        <StatsGrid stats={data.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickScanCard />
          <RecentScans scans={data.recentScans} />
        </div>

        <RecentReports reports={data.recentReports} />
      </div>
    </PageTransition>
  );
}