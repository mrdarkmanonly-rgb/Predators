"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/prisma.client";
import { syncUserWithDatabase } from "@/actions/user/user.actions";

type ScanImageInput = {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

export async function createScanWithImages(images: ScanImageInput[]) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "User is not authenticated",
      };
    }

    if (!images.length) {
      return {
        success: false,
        message: "No images provided",
      };
    }

    const syncResult = await syncUserWithDatabase();

    if (!syncResult.success || !syncResult.user) {
      return {
        success: false,
        message: syncResult.message ?? "Failed to sync user",
      };
    }

    const user = syncResult.user;

    const scan = await prisma.scan.create({
      data: {
        userId: user.id,
        status: "PROCESSING",

        images: {
          create: images.map((image, index) => ({
            imageType:
              index === 0
                ? "FRONT"
                : index === 1
                  ? "BACK"
                  : index === 2
                    ? "SIDE"
                    : "ADDITIONAL",

            cloudinaryPublicId: image.publicId,
            secureUrl: image.secureUrl,
            width: image.width,
            height: image.height,
            format: image.format,
            bytes: image.bytes,
          })),
        },
      },

      include: {
        images: true,
      },
    });

    return {
      success: true,
      scan,
    };
  } catch (error) {
    console.error("CREATE SCAN ERROR:", error);

    return {
      success: false,
      message: "Failed to create scan",
    };
  }
}

export async function getScanResult(scanId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "User is not authenticated",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const scan = await prisma.scan.findUnique({
      where: {
        id: scanId,
      },
      include: {
        images: true,
        product: true,
      },
    });

    if (!scan) {
      return {
        success: false,
        message: "Scan not found",
      };
    }

    if (scan.userId !== user.id) {
      return {
        success: false,
        message: "You are not allowed to view this scan",
      };
    }

    return {
      success: true,
      scan,
    };
  } catch (error) {
    console.error(
      "GET SCAN RESULT ERROR:",
      error,
    );

    return {
      success: false,
      message: "Failed to fetch scan result",
    };
  }
}