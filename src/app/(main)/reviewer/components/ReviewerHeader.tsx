"use client";

import React, { useState } from "react";
import LogoutButton from "@/components/global/logout-button";
import {
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
} from "lucide-react";

interface ReviewerHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
  pendingCount?: number;
}

export default function ReviewerHeader({
  user,
  pendingCount = 24,
}: ReviewerHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: "n-1",
      title: "High Priority Report Assigned",
      desc: "Report CR-2026-0001 (Mustard Oil 130ml shortfall) assigned to your queue.",
      time: "15m ago",
      unread: true,
      type: "alert",
    },
    {
      id: "n-2",
      title: "Citizen Submitted Evidence Update",
      desc: "Citizen #5521 added back panel seal photo for CR-2026-0004.",
      time: "1h ago",
      unread: true,
      type: "info",
    },
    {
      id: "n-3",
      title: "Inspection Confirmed",
      desc: "Inspector Patel accepted forward for CR-2026-0007 (Railway Stall Dual MRP).",
      time: "3h ago",
      unread: false,
      type: "success",
    },
  ];

  return (
    <header className="bg-white border-b border-[#D9E2EC] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Portal Identification */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0B1F33] text-white shadow-xs">
              <ShieldCheck className="w-6 h-6 text-[#1769AA]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-[#0B1F33]">
                  CheckItRight
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF4FF] text-[#1769AA] border border-[#1769AA]/20">
                  Reviewer Portal
                </span>
              </div>
              <p className="text-xs text-[#627D98] hidden sm:block">
                Legal Metrology (Packaged Commodities) Compliance Triage
              </p>
            </div>
          </div>

          {/* Right Section: Status Badge, Notification Drawer, Officer Profile, Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Duty Status */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F0FDF4] border border-[#86EFAC]/50 text-xs font-medium text-[#166534]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>On Duty • Active Session</span>
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-[#627D98] hover:text-[#102A43] hover:bg-[#F7FAFC] rounded-lg transition-colors border border-transparent hover:border-[#D9E2EC]"
                aria-label="Open notifications"
              >
                <Bell className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-bold text-white ring-2 ring-white">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#D9E2EC] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#1769AA]" />
                      <h4 className="text-sm font-semibold text-[#102A43]">
                        Reviewer Notifications
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-[#627D98] hover:text-[#102A43]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-[#D9E2EC]/50 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`py-2.5 px-1 hover:bg-[#F7FAFC] rounded-md transition-colors ${
                          n.unread ? "bg-[#EAF4FF]/30" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {n.type === "alert" && (
                            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                          )}
                          {n.type === "info" && (
                            <FileText className="w-4 h-4 text-[#1769AA] shrink-0 mt-0.5" />
                          )}
                          {n.type === "success" && (
                            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#102A43]">
                              {n.title}
                            </p>
                            <p className="text-[11px] text-[#627D98] line-clamp-2 mt-0.5">
                              {n.desc}
                            </p>
                            <span className="text-[10px] text-[#9AA5B1] mt-1 block">
                              {n.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2.5 border-t border-[#D9E2EC] text-center">
                    <span className="text-[11px] font-medium text-[#1769AA] hover:underline cursor-pointer">
                      Mark all as acknowledged
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Officer Profile Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#D9E2EC]">
              <div className="w-8 h-8 rounded-full bg-[#EAF4FF] border border-[#1769AA]/30 flex items-center justify-center text-[#1769AA] font-bold text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "RV"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-[#102A43] leading-tight">
                  {user?.name || "Officer Sharma"}
                </p>
                <p className="text-[10px] text-[#627D98] leading-tight">
                  Officer ID: REV-8429
                </p>
              </div>
            </div>

            {/* Existing Logout Button */}
            <div className="shrink-0">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
