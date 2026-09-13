import { requireRole } from "@/lib/auth-guard";
import LogoutButton from "@/components/global/logout-button";
import AdminSidebar from "./components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["ADMIN"]);

  return (
    <div className="fixed inset-0 z-50 min-h-screen overflow-y-auto bg-[#F7FAFC]">
      <AdminSidebar />

      <main className="ml-64 min-h-screen">
        <header className="border-b border-[#D9E2EC] bg-white">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <h1 className="text-3xl font-bold text-[#102A43]">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-[#627D98]">
                System Overview
                <span className="mx-2">•</span>
                Manage
                <span className="mx-2">•</span>
                Monitor
                <span className="mx-2">•</span>
                Ensure Compliance
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}