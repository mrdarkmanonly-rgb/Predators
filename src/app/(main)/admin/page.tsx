import { requireRole } from "@/lib/auth-guard";

export default async function AdminPage() {
  const user = await requireRole(["ADMIN"]);

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>Admin dashboard coming soon.</p>
      <p>Welcome {user.name ?? "Admin"}</p>
    </main>
  );
}
