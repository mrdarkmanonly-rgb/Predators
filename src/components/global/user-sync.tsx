"use client";

import { useCurrentUser } from "@/hooks/user/use-current-user";

export default function UserSync() {
  useCurrentUser();

  return null;
}