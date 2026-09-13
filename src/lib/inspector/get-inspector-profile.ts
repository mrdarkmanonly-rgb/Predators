import "server-only";

import prisma from "@/utils/prisma.client";
import { requireRole } from "@/lib/auth-guard";

export type InspectorProfile = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: string;
  status: string;
  createdAt: string;
  claimedCases: number;
  completedCases: number;
  violationsFound: number;
};

export async function getInspectorProfile(): Promise<InspectorProfile> {
  const user = await requireRole(["INSPECTOR"]);

  const [claimedCases, completedCases, violationsFound] = await Promise.all([
    prisma.inspection.count({
      where: { inspectorId: user.id },
    }),
    prisma.inspection.count({
      where: {
        inspectorId: user.id,
        completedAt: { not: null },
      },
    }),
    prisma.inspection.count({
      where: {
        inspectorId: user.id,
        violationFound: true,
      },
    }),
  ]);

  return {
    id: user.id,
    name: user.name ?? user.email.split("@")[0],
    email: user.email,
    imageUrl: user.imageUrl,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    claimedCases,
    completedCases,
    violationsFound,
  };
}