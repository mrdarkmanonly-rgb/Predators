import "server-only";

import prisma from "@/utils/prisma.client";
import { getCurrentUser } from "@/lib/auth-guard";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: string;
  status: string;
  createdAt: string;
};

export async function getUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return {
    id: user.id,
    name: user.name ?? user.email.split("@")[0],
    email: user.email,
    imageUrl: user.imageUrl,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}