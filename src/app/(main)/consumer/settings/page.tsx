import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-guard";
import SettingsClient from "@/components/consumer/SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <SettingsClient />;
}