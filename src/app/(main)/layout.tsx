import { getCurrentUser } from "@/lib/auth-guard";
import ConsumerSidebar from "@/components/consumer/Sidebar";
import ConsumerMobileNav from "@/components/consumer/MobileNav";
import ConsumerHeader from "@/components/consumer/Heaser";
import InspectorShell from "@/app/(main)/inspector/components/InspectorShell";

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

  // Inspector → inspector chrome wraps every inspector route (incl. /scan)
  if (user.role === "INSPECTOR") {
    return (
      <InspectorShell
        user={{
          name: user.name ?? user.email.split("@")[0],
          email: user.email,
          role: user.role,
          imageUrl: user.imageUrl,
        }}
      >
        {children}
      </InspectorShell>
    );
  }

  // Reviewer → reviewer chrome wraps every reviewer route
  // (page-level reviewer/layout.tsx provides the actual chrome)
  if (user.role === "REVIEWER") {
    return <>{children}</>;
  }

  // Consumer (default)
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