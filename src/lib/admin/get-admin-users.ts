import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: "CONSUMER" | "REVIEWER" | "INSPECTOR" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  scansCount: number;
  reportsCount: number;
  inspectionsCount: number;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          scans: true,
          submittedReports: true,
          inspections: true,
        },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name ?? u.email.split("@")[0],
    email: u.email,
    imageUrl: u.imageUrl,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    scansCount: u._count.scans,
    reportsCount: u._count.submittedReports,
    inspectionsCount: u._count.inspections,
  }));
}

export type AdminUserDetail = AdminUser & {
  recentRoleChanges: {
    id: string;
    oldRole: string;
    newRole: string;
    changedBy: string;
    createdAt: string;
  }[];
};

export async function getAdminUserDetail(
  userId: string,
): Promise<AdminUserDetail | null> {
  await requireRole(["ADMIN"]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          scans: true,
          submittedReports: true,
          inspections: true,
        },
      },
      roleChanges: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          oldRole: true,
          newRole: true,
          createdAt: true,
          changedBy: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name ?? user.email.split("@")[0],
    email: user.email,
    imageUrl: user.imageUrl,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    scansCount: user._count.scans,
    reportsCount: user._count.submittedReports,
    inspectionsCount: user._count.inspections,
    recentRoleChanges: user.roleChanges.map((r) => ({
      id: r.id,
      oldRole: r.oldRole,
      newRole: r.newRole,
      changedBy: r.changedBy.name ?? r.changedBy.email.split("@")[0],
      createdAt: r.createdAt.toISOString(),
    })),
  };
}