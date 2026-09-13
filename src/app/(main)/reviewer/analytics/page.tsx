import { getReviewerAnalytics } from "@/lib/reviewer/get-reviewer-analytics";
import AnalyticsClient from "./AnalyticsClient";

export default async function ReviewerAnalyticsPage() {
  const data = await getReviewerAnalytics();

  return <AnalyticsClient data={data} />;
}