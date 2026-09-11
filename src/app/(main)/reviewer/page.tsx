import LogoutButton from "@/components/global/logout-button";
import { requireRole } from "@/lib/auth-guard";

export default async function ReviewerPage () {
  const user = await requireRole(["REVIEWER"]);
  return (
    <main>
      <h1>Reviewer Dashboard</h1>
      <p>Reviewer dashboard coming soon.</p>
      <LogoutButton />
    </main>
  );
}
