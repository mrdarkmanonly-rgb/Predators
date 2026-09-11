import LogoutButton from "@/components/global/logout-button";
import { requireRole } from "@/lib/auth-guard";
import Link from "next/link";

export default async function InspectorPage() {
  const user = await requireRole(["INSPECTOR"]);

  return (
    <div>
      <h1>Inspector Dashboard</h1>

      <div>
        <Link href="/scan">
          <button type="button">Scan Product</button>
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
