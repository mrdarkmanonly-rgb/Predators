"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/utils/prisma.client";

export async function syncUserWithDatabase() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "User is not authenticated",
      };
    }

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return {
        success: false,
        message: "Clerk user not found",
      };
    }

    const email = clerkUser.primaryEmailAddress?.emailAddress;

    if (!email) {
      return {
        success: false,
        message: "User email not found",
      };
    }

    const user = await prisma.user.upsert({
      where: {
        clerkUserId: userId,
      },

      update: {
        name:
          `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
          null,
        email,
        imageUrl: clerkUser.imageUrl,
      },

      create: {
        clerkUserId: userId,
        name:
          `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
          null,
        email,
        imageUrl: clerkUser.imageUrl,
        role: "CONSUMER",
        status: "ACTIVE",
      },
    });

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("USER DATABASE SYNC ERROR:", error);

    return {
      success: false,
      message: "Failed to sync user with database",
    };
  }
}



export async function getCurrentUserFromDatabase() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    return user;
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);

    return null;
  }
}