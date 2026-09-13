import { getInspectorNotifications } from "@/lib/inspector/get-inspector-notifications";
import InspectorNotificationsClient from "@/components/inspector/InspectorNotificationsClient";

export default async function InspectorNotificationsPage() {
  const notifications = await getInspectorNotifications();

  return <InspectorNotificationsClient notifications={notifications} />;
}