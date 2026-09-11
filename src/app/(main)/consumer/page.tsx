import PageTransition from "@/components/consumer/PageTransition";
import HeroSection from "@/components/consumer/HeroSection";
import StatsGrid from "@/components/consumer/StatsGrid";
import QuickScanCard from "@/components/consumer/QuickScanCard";
import RecentScans from "@/components/consumer/RecentScans";
import RecentReports from "@/components/consumer/RecentReports";

export default function UserDashboardPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">
        <HeroSection />
        <StatsGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickScanCard />
          <RecentScans />
        </div>

        <RecentReports />
      </div>
    </PageTransition>
  );
}
