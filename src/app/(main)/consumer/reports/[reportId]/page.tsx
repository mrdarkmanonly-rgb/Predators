import { notFound } from "next/navigation";
import { getReportDetail } from "@/lib/consumer/get-report-detail";
import ReportDetailClient from "@/components/consumer/ReportDetailClient";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = await getReportDetail(reportId);

  if (!report) {
    notFound();
  }

  return <ReportDetailClient report={report} />;
}