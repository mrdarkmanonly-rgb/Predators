"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/prisma.client";

const OCR_SERVICE_URL = "http://localhost:8000";

type QualityApiResponse = {
  passed: boolean;
  score: number;
  width: number;
  height: number;
  blur_score: number;
  brightness_score: number;
  issues: string[];
  recommendations: string[];
};

export async function checkAndSaveImageQuality(
  scanImageId: string
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        message: "User is not authenticated",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found in database",
      };
    }

    const scanImage = await prisma.scanImage.findUnique({
      where: {
        id: scanImageId,
      },
      include: {
        scan: true,
      },
    });

    if (!scanImage) {
      return {
        success: false,
        message: "Scan image not found",
      };
    }

    if (scanImage.scan.userId !== user.id) {
      return {
        success: false,
        message: "You are not allowed to process this image",
      };
    }

    const response = await fetch(
      `${OCR_SERVICE_URL}/quality/check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: scanImage.secureUrl,
        }),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: "Quality service failed",
      };
    }

    const quality: QualityApiResponse = await response.json();

    const updatedImage = await prisma.scanImage.update({
      where: {
        id: scanImageId,
      },
      data: {
        qualityScore: quality.score,
        qualityPassed: quality.passed,
      },
    });

    return {
      success: true,
      quality,
      scanImage: updatedImage,
    };
  } catch (error) {
    console.error("IMAGE QUALITY CHECK ERROR:", error);

    return {
      success: false,
      message: "Failed to check image quality",
    };
  }
}