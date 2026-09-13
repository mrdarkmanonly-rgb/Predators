import { getMyReviews } from "@/lib/reviewer/get-my-reviews";
import MyReviewsClient from "./MyReviewsClient";

export default async function MyReviewsPage() {
  const reviews = await getMyReviews();

  return <MyReviewsClient rows={reviews} />;
}