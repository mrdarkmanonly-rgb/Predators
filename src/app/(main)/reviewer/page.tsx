import ReviewerDashboard from "./components/ReviewerDashboard";
import "./reviewer.css";

export default function ReviewerPage() {
  return (
    <ReviewerDashboard
      user={{
        name: "Reviewer",
        email: "reviewer@checkitright.com",
      }}
    />
  );
}