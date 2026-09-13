"use client";

import { Search, Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type Props = {
  onOpenMenu: () => void;
  name: string;
  role: string;
  imageUrl?: string | null;
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

export default function InspectorTopbar({
  onOpenMenu,
  name,
  role,
  imageUrl,
}: Props) {
  const { signOut } = useClerk();
  const router = useRouter();
  const initials = initialsFrom(name);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#D9E2EC] bg-white/95 px-4 backdrop-blur-xl sm:gap-4 sm:px-6">
      {/* Hamburger (mobile only) */}
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D9E2EC] bg-white text-[#102A43] transition-colors hover:bg-[#EAF4FF] lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
        <input
          type="text"
          placeholder="Search cases, products, shops, locations..."
          className="h-10 w-full rounded-xl border border-[#D9E2EC] bg-[#F7FAFC] pl-9 pr-3 text-sm text-[#102A43] placeholder:text-[#627D98]/70 outline-none transition-colors focus:border-[#1769AA] focus:bg-white"
        />
      </div>

      {/* Mobile brand */}
      <div className="flex flex-1 items-center gap-2 sm:hidden">
        <span className="text-sm font-bold text-[#102A43]">
          CheckIt<span className="text-[#1769AA]">Right</span>
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9E2EC] bg-white text-[#102A43] transition-colors hover:bg-[#EAF4FF]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#DC2626]" />
        </button>

        {/* User chip */}
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl border border-[#D9E2EC] bg-white px-1.5 py-1.5 transition-colors hover:bg-[#EAF4FF] sm:px-2"
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
            <span className="text-xs font-semibold text-[#102A43]">
              {name}
            </span>
            <span className="text-[10px] text-[#627D98]">
              {roleLabel(role)}
            </span>
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-[#627D98] sm:block" />
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          className="group flex h-10 items-center gap-2 rounded-xl border border-[#DC2626]/20 bg-white px-2.5 text-[#DC2626] transition-colors hover:bg-[#DC2626]/10 sm:px-3"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden text-xs font-semibold sm:inline">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}