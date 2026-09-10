import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prisma from "@/utils/prisma.client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();

    // No Clerk session = Guest scanner
    if (!userId) {
      return NextResponse.json({
        success: true,
        mode: "guest",
        authenticated: false,
      });
    }

    /*
     * The role is resolved on the server.
     * We never trust a role supplied by the browser.
     */
    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        role: true,
        status: true,
      },
    });

    /*
     * If the authenticated Clerk user has not been
     * synchronized into our database yet, treat the
     * scanner as a normal consumer rather than granting
     * any privileged inspector capability.
     */
    if (!user) {
      return NextResponse.json({
        success: true,
        mode: "consumer",
        authenticated: true,
      });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({
        success: true,
        mode: "consumer",
        authenticated: true,
        active: false,
      });
    }

    if (user.role === "INSPECTOR") {
      return NextResponse.json({
        success: true,
        mode: "inspector",
        authenticated: true,
        active: true,
      });
    }

    return NextResponse.json({
      success: true,
      mode: "consumer",
      authenticated: true,
      active: true,
    });
  } catch (error) {
    console.error(
      "SCAN CONTEXT ERROR:",
      error,
    );

    /*
     * Fail closed.
     *
     * If role resolution fails, we never grant
     * inspector access accidentally.
     */
    return NextResponse.json({
      success: true,
      mode: "consumer",
      authenticated: true,
      roleResolutionFailed: true,
    });
  }
}