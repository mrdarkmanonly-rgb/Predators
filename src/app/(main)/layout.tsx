import { getCurrentUser } from "@/lib/auth-guard";
import ConsumerSidebar from "@/components/consumer/Sidebar";
import ConsumerMobileNav from "@/components/consumer/MobileNav";
import ConsumerHeader from "@/components/consumer/Heaser";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Guest → no chrome (full width, dark, matches landing)
  if (!user) {
    return <main className="min-h-screen bg-[#07111F]">{children}</main>;
  }

  // Inspector → inspector page owns its own chrome (leave as-is for now)
  if (user.role === "INSPECTOR") {
    return <>{children}</>;
  }

  // Consumer (default) → consumer sidebar + header + mobile nav
  return (
    <div className="flex min-h-screen bg-[#F7FAFC]">
      <ConsumerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ConsumerHeader
          name={user.name}
          email={user.email}
          role={user.role}
          imageUrl={user.imageUrl}
        />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">{children}</main>
        <ConsumerMobileNav />
      </div>
    </div>
  );
}