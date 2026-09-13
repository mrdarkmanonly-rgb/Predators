import { redirect } from "next/navigation";
import { getUserNotifications } from "@/lib/consumer/get-user-notifications";
import MyNotificationsClient from "@/components/consumer/MyNotificationsClient";

export default async function MyNotificationsPage() {
  const notifications = await getUserNotifications();
  if (!notifications) redirect("/login");

  return <MyNotificationsClient notifications={notifications} />;
}