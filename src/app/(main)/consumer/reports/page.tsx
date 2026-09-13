import { redirect } from "next/navigation";
import { getUserReports } from "@/lib/consumer/get-user-reports";
import MyReportsClient from "@/components/consumer/MyReportsClient";

export default async function MyReportsPage() {
  const reports = await getUserReports();
  if (!reports) redirect("/login");

  return <MyReportsClient reports={reports} />;
}