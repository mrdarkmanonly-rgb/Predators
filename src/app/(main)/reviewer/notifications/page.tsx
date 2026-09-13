import { getReviewerNotifications } from "@/lib/reviewer/get-reviewer-notifications";
import NotificationsClient from "./NotificationsClient";

export default async function ReviewerNotificationsPage() {
  const notifications = await getReviewerNotifications();

  return <NotificationsClient notifications={notifications} />;
}