import { getAuditLogs } from "@/lib/admin/get-audit-logs";
import AuditLogsClient from "./AuditLogsClient";

export default async function AdminAuditLogsPage() {
  const logs = await getAuditLogs();
  return <AuditLogsClient logs={logs} />;
}