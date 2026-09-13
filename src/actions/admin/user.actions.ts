"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import prisma from "@/utils/prisma.client";
import type { UserRole } from "@prisma/client";

export type ActionResult =
  | { ok: true }
  | { ok: false; reason: string };

export async function changeUserRole(
  targetUserId: string,
  newRole: UserRole,
): Promise<ActionResult> {
  const admin = await requireRole(["ADMIN"]);

  if (admin.id === targetUserId) {
    return { ok: false, reason: "You can't change your own role." };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true },
  });

  if (!target) return { ok: false, reason: "User not found." };
  if (target.role === newRole) {
    return { ok: false, reason: "User already has this role." };
  }

  // safety: don't demote the last ADMIN
  if (target.role === "ADMIN" && newRole !== "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", status: "ACTIVE" },
    });
    if (adminCount <= 1) {
      return { ok: false, reason: "Can't demote the last admin." };
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    }),
    prisma.roleChangeLog.create({
      data: {
        userId: targetUserId,
        changedById: admin.id,
        oldRole: target.role,
        newRole,
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);

  return { ok: true };
}

export async function toggleUserStatus(
  targetUserId: string,
  newStatus: "ACTIVE" | "INACTIVE",
): Promise<ActionResult> {
  const admin = await requireRole(["ADMIN"]);

  if (admin.id === targetUserId) {
    return { ok: false, reason: "You can't deactivate your own account." };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, status: true },
  });

  if (!target) return { ok: false, reason: "User not found." };
  if (target.status === newStatus) {
    return { ok: false, reason: "User already has this status." };
  }

  // safety: don't deactivate the last active ADMIN
  if (newStatus === "INACTIVE" && target.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", status: "ACTIVE" },
    });
    if (adminCount <= 1) {
      return { ok: false, reason: "Can't deactivate the last active admin." };
    }
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { status: newStatus },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);

  return { ok: true };
}