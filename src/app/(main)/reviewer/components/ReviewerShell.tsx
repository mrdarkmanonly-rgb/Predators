"use client";

import { useState, createContext, useContext } from "react";
import ReviewerSidebar from "./ReviewerSidebar";
import ReviewerTopbar from "./ReviewerTopbar";

type ReviewerUser = {
  name: string;
  email: string;
  role: string;
  imageUrl: string | null;
};

type SidebarContextType = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within ReviewerShell");
  return ctx;
}

export default function ReviewerShell({
  user,
  children,
}: {
  user: ReviewerUser;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = () => setCollapsed((c) => !c);

  return (
    <SidebarContext.Provider
      value={{ collapsed, toggleCollapsed, mobileOpen, setMobileOpen }}
    >
      <div className="min-h-screen bg-[#F7FAFC]">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar wrapper handles the responsive/collapse transform;
            ReviewerSidebar itself renders content and can call useSidebar()
            for its own collapsed-state styling if desired */}
        <div
          className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } ${collapsed ? "lg:w-20" : "lg:w-64"}`}
        >
          <ReviewerSidebar />
        </div>

        <div
          className={`flex min-h-screen flex-col transition-[margin] duration-300 ease-in-out ${
            collapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
        >
          <ReviewerTopbar
            name={user.name}
            role={user.role}
            imageUrl={user.imageUrl}
          />
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}