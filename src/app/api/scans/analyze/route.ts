import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prisma from "@/utils/prisma.client";

import type { ScanMode } from "@/lib/scanning/types";
import type { OCRScanResult } from "@/lib/ocr/types";
import { runMockOCR } from "@/lib/ocr/mock-ocr";

import type { AIExtractionResult } from "@/lib/ai/types";
import { runMockExtraction } from "@/lib/ai/mock-extractor";
import { analyzePreliminaryCompliance } from "@/lib/scanning/preliminary-compliance";

export const runtime = "nodejs";

const MAX_IMAGES = 12;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    /*
     * The scan mode is resolved on the server.
     *
     * We intentionally do NOT trust a mode sent by the browser.
     */
    const mode = await resolveScanMode();

    const formData = await request.formData();
    const imageEntries = formData.getAll("images");

    if (imageEntries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one product image is required.",
        },
        { status: 400 },
      );
    }

    if (imageEntries.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          success: false,
          message: `A maximum of ${MAX_IMAGES} images can be analyzed at once.`,
        },
        { status: 400 },
      );
    }

    const imageFiles: File[] = [];

    for (const entry of imageEntries) {
      if (!(entry instanceof File)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid image data received.",
          },
          { status: 400 },
        );
      }

      if (!entry.type.startsWith("image/")) {
        return NextResponse.json(
          {
            success: false,
            message: `"${entry.name}" is not a supported image.`,
          },
          { status: 400 },
        );
      }

      if (entry.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: `"${entry.name}" exceeds the 10 MB image limit.`,
          },
          { status: 400 },
        );
      }

      imageFiles.push(entry);
    }

    /*
     * Images are processed only for the duration of this request.
     *
     * We intentionally do NOT:
     * - save image binaries to PostgreSQL
     * - create permanent image records
     * - upload images to permanent storage
     * - expose uploaded images publicly
     *
     * Permanent evidence storage will be introduced only for
     * an authenticated, successfully submitted report.
     */

    const scanImages = imageFiles.map((file, index) => ({
      id: `request-image-${index + 1}`,
      file,
      previewUrl: "",
      type: getImageType(formData, index),
      quality: "NEEDS_REVIEW" as const,
      width: null,
      height: null,
      size: file.size,
      createdAt: Date.now(),
    }));

    const ocrResult: OCRScanResult =
      await runMockOCR(scanImages);

    const extractionResult: AIExtractionResult =
      await runMockExtraction(ocrResult);

    const preliminaryAnalysis = analyzePreliminaryCompliance(
      extractionResult.product,
    );

    const scanId = crypto.randomUUID();

    return NextResponse.json({
      success: true,

      scan: {
        scanId,
        mode,

        providerStatus: {
          ocr: ocrResult.status,
          ai: extractionResult.status,
        },

        ocr: ocrResult,

        extraction: extractionResult,

        preliminary: {
          result: preliminaryAnalysis.result,
          score: preliminaryAnalysis.score,
          checks: preliminaryAnalysis.checks,
          warnings: preliminaryAnalysis.warnings,

          message:
            "This is a preliminary evidence assessment based on the information extracted from the submitted images. It is not a legal compliance determination.",

          disclaimer:
            "This result is not a legal determination. Final compliance decisions must be made by the Legal Metrology rule engine using verified evidence.",
        },

        lifecycle: {
          imageStorage: "TEMPORARY_REQUEST_ONLY",
          permanentEvidenceCreated: false,
        },
      },
    });
  } catch (error) {
    console.error("SCAN ANALYSIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process the product images.",
      },
      { status: 500 },
    );
  }
}

async function resolveScanMode(): Promise<ScanMode> {
  const { userId } = await auth();

  /*
   * No Clerk session means this is a guest scan.
   */
  if (!userId) {
    return "guest";
  }

  try {
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
     * A signed-in Clerk user who has not yet been synchronized
     * into the application database is treated as a consumer.
     */
    if (!user) {
      return "consumer";
    }

    /*
     * Inactive users never receive inspector capabilities.
     */
    if (
      user.status === "ACTIVE" &&
      user.role === "INSPECTOR"
    ) {
      return "inspector";
    }

    return "consumer";
  } catch (error) {
    /*
     * Fail closed.
     *
     * If role lookup fails, never grant inspector privileges.
     */
    console.error(
      "SCAN ROLE RESOLUTION ERROR:",
      error,
    );

    return "consumer";
  }
}

function getImageType(
  formData: FormData,
  index: number,
) {
  const value = formData.get(`imageType-${index}`);

  const allowedTypes = [
    "front",
    "back",
    "side",
    "mrp",
    "net-quantity",
    "manufacturer",
    "other",
  ] as const;

  if (
    typeof value === "string" &&
    allowedTypes.includes(
      value as (typeof allowedTypes)[number],
    )
  ) {
    return value as (typeof allowedTypes)[number];
  }

  return "other" as const;
}
