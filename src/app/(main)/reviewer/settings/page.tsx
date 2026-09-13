import { requireRole } from "@/lib/auth-guard";
import SettingsClient from "./SettingsClient";

export default async function ReviewerSettingsPage() {
  await requireRole(["REVIEWER", "ADMIN"]);

  return <SettingsClient />;
}