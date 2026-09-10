"use client";

import React from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";

export default function ConsumerDashboard() {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut({
      redirectUrl: "/login",
    });
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <div>
        <Link href="/scan">
          <button type="button">
            Scan Product
          </button>
        </Link>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}