"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, Menu, Settings, User as UserIcon, Check } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSidebar } from "./ReviewerShell";

type Props = {
  name: string;
  role: string;
  imageUrl?: string | null;
};

type Notification = {
  id: string;
  title: string;
  time: string;
  read: boolean;
};

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function roleLabel(role: string) {
  const map: Record<string, string> = {
    CONSUMER: "Consumer",
    REVIEWER: "Reviewer",
    INSPECTOR: "Field Inspector",
    ADMIN: "Admin",
  };
  return map[role] ?? role;
}

// Replace with real data fetched from your notifications API/route
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "New report submitted for review", time: "5m ago", read: false },
  { id: "2", title: "Product flagged for re-inspection", time: "1h ago", read: false },
  { id: "3", title: "Weekly compliance summary ready", time: "3h ago", read: true },
];

export default function ReviewerTopbar({ name, role, imageUrl }: Props) {
  const { signOut } = useClerk();
  const router = useRouter();
  const { setMobileOpen } = useSidebar();
  const initials = initialsFrom(name);

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[#D9E2EC] bg-white/95 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger — opens the sidebar drawer */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D9E2EC] bg-white text-[#102A43] transition-colors hover:bg-[#EAF4FF] lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-[#102A43]">Reviewer Dashboard</h1>
          <p className="hidden text-[11px] text-[#829AB1] sm:block">
            Review Reports • Verify Evidence • Ensure Compliance
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Notifications dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setNotifOpen((o) => !o)}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
              notifOpen
                ? "border-[#1769AA] bg-[#EAF4FF]"
                : "border-[#D9E2EC] bg-white hover:bg-[#EAF4FF]"
            } text-[#102A43]`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 origin-top-right animate-in fade-in slide-in-from-top-2 rounded-xl border border-[#D9E2EC] bg-white shadow-lg duration-150">
              <div className="flex items-center justify-between border-b border-[#D9E2EC] px-4 py-3">
                <span className="text-sm font-bold text-[#102A43]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#1769AA] hover:underline"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-[#829AB1]">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() =>
                        setNotifications((prev) =>
                          prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                        )
                      }
                      className="flex w-full items-start gap-2.5 border-b border-[#EAF4FF] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#F7FAFC]"
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          n.read ? "bg-transparent" : "bg-[#1769AA]"
                        }`}
                      />
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`text-xs leading-snug ${
                            n.read ? "text-[#627D98]" : "font-semibold text-[#102A43]"
                          }`}
                        >
                          {n.title}
                        </span>
                        <span className="text-[10px] text-[#829AB1]">{n.time}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <Link
                href="/reviewer/notifications"
                onClick={() => setNotifOpen(false)}
                className="block px-4 py-2.5 text-center text-xs font-semibold text-[#1769AA] hover:bg-[#F7FAFC]"
              >
                View all
              </Link>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className={`flex items-center gap-3 rounded-xl border px-1.5 py-1.5 transition-colors sm:px-2 ${
              profileOpen
                ? "border-[#1769AA] bg-[#EAF4FF]"
                : "border-[#D9E2EC] bg-white hover:bg-[#EAF4FF]"
            }`}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={name}
                className="h-8 w-8 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1769AA] text-xs font-bold text-white">
                {initials}
              </span>
            )}
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-xs font-semibold text-[#102A43]">{name}</span>
              <span className="text-[10px] text-[#627D98]">{roleLabel(role)}</span>
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 origin-top-right animate-in fade-in slide-in-from-top-2 rounded-xl border border-[#D9E2EC] bg-white shadow-lg duration-150">
              <div className="border-b border-[#D9E2EC] px-4 py-3">
                <p className="text-xs font-semibold text-[#102A43]">{name}</p>
                <p className="text-[11px] text-[#829AB1]">{roleLabel(role)}</p>
              </div>
              <div className="p-1.5">
                <Link
                  href="/reviewer/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#102A43] transition-colors hover:bg-[#F7FAFC]"
                >
                  <UserIcon className="h-3.5 w-3.5 text-[#627D98]" />
                  My Profile
                </Link>
                <Link
                  href="/reviewer/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#102A43] transition-colors hover:bg-[#F7FAFC]"
                >
                  <Settings className="h-3.5 w-3.5 text-[#627D98]" />
                  Settings
                </Link>
              </div>
              <div className="border-t border-[#D9E2EC] p-1.5">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#DC2626] transition-colors hover:bg-[#DC2626]/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}