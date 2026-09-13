"use client";

import React from "react";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  History,
  Scale,
} from "lucide-react";

export type NavTab = "dashboard" | "assigned" | "analytics" | "activity";

interface ReviewerSubNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  assignedCount: number;
  pendingCount: number;
}

export default function ReviewerSubNav({
  activeTab,
  onTabChange,
  assignedCount,
  pendingCount,
}: ReviewerSubNavProps) {
  const tabs = [
    {
      id: "dashboard" as NavTab,
      label: "Review Dashboard & Queue",
      icon: LayoutDashboard,
      badge: pendingCount,
      badgeColor: "bg-[#DC2626] text-white",
    },
    {
      id: "assigned" as NavTab,
      label: "Assigned to Me",
      icon: ClipboardList,
      badge: assignedCount,
      badgeColor: "bg-[#1769AA] text-white",
    },
    {
      id: "analytics" as NavTab,
      label: "Legal Metrology Analytics",
      icon: BarChart3,
    },
    {
      id: "activity" as NavTab,
      label: "Recent Activity Log",
      icon: History,
    },
  ];

  return (
    <div className="bg-white border-b border-[#D9E2EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto custom-scrollbar">
          <nav className="flex space-x-1 sm:space-x-4 py-2" aria-label="Reviewer Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  type="button"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#EAF4FF] text-[#1769AA] font-semibold border border-[#1769AA]/20 shadow-2xs"
                      : "text-[#627D98] hover:text-[#102A43] hover:bg-[#F7FAFC]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#1769AA]" : "text-[#627D98]"}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${tab.badgeColor}`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-xs text-[#627D98] pl-4 border-l border-[#D9E2EC]">
            <Scale className="w-4 h-4 text-[#1769AA]" />
            <span>PCR 2011 & Legal Metrology Act 2009</span>
          </div>
        </div>
      </div>
    </div>
  );
}
