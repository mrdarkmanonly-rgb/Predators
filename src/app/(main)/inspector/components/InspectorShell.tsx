"use client";

import { useState } from "react";
import InspectorSidebar from "./InspectorSidebar";
import MobileDrawer from "./MobileDrawer";
import MobileBottomNav from "./MobileBottomNav";
import InspectorTopbar from "./InspectorTopbar";

type InspectorUser = {
  name: string;
  email: string;
  role: string;
  imageUrl: string | null;
};

export default function InspectorShell({
  user,
  children,
}: {
  user: InspectorUser;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F7FAFC]">
      <InspectorSidebar />

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <InspectorTopbar
          onOpenMenu={() => setMenuOpen(true)}
          name={user.name}
          role={user.role}
          imageUrl={user.imageUrl}
        />
        {children}
      </div>

      <MobileBottomNav />
    </div>
  );
}