import { redirect } from "next/navigation";
import { getUserScans } from "@/lib/consumer/get-user-scans";
import MyScansClient from "@/components/consumer/MyScansClient";

export default async function MyScansPage() {
  const scans = await getUserScans();
  if (!scans) redirect("/login");

  return <MyScansClient scans={scans} />;
}