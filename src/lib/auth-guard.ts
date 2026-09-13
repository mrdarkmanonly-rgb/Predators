import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/prisma.client";
import type { UserRole } from "@prisma/client";

export async function requireRole(allowedRoles: UserRole[]) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  return user;
}