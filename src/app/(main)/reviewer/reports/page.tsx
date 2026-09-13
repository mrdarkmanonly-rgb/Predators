import { getReviewerReports } from "@/lib/reviewer/get-reviewer-reports";
import ReportsClient from "./ReportsClient";

export default async function ReviewerReportsPage() {
  const data = await getReviewerReports();

  return <ReportsClient rows={data.rows} total={data.total} />;
}