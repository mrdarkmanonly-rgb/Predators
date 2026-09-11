import Sidebar from "@/components/consumer/Sidebar";
import MobileNav from "@/components/consumer/MobileNav";
import Header from "@/components/consumer/Heaser";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F7FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
