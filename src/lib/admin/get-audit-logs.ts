import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type AuditLogEntry = {
  id: string;
  targetName: string;
  targetEmail: string;
  oldRole: string;
  newRole: string;
  changedByName: string;
  changedByEmail: string;
  createdAt: string;
};

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  await requireRole(["ADMIN"]);

  const logs = await prisma.roleChangeLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      oldRole: true,
      newRole: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      changedBy: { select: { name: true, email: true } },
    },
  });

  return logs.map((l) => ({
    id: l.id,
    targetName: l.user.name ?? l.user.email.split("@")[0],
    targetEmail: l.user.email,
    oldRole: l.oldRole,
    newRole: l.newRole,
    changedByName: l.changedBy.name ?? l.changedBy.email.split("@")[0],
    changedByEmail: l.changedBy.email,
    createdAt: l.createdAt.toISOString(),
  }));
}