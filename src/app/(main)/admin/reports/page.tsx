import { getAdminReports } from "@/lib/admin/get-admin-reports";
import ReportsClient from "./ReportsClient";

export default async function AdminReportsPage() {
  const data = await getAdminReports();

  return (
    <ReportsClient
      rows={data.rows}
      total={data.total}
      capped={data.capped}
    />
  );
}