import type { UserRole } from "@prisma/client";

export const ROLE_ROUTES: Record<UserRole, string> = {
  CONSUMER: "/consumer",
  REVIEWER: "/reviewer",
  INSPECTOR: "/inspector",
  ADMIN: "/admin",
};