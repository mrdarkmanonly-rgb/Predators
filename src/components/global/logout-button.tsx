"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <SignOutButton redirectUrl="/login">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-[#D9E2EC] bg-white px-4 py-2 text-sm font-medium text-[#102A43] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#DC2626] hover:text-[#DC2626] hover:shadow-md"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </SignOutButton>
  );
}