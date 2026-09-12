/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

"use server";

import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import prisma from "@/utils/prisma.client";
import { syncUserWithDatabase } from "@/actions/user/user.actions";
import { findOrCreateProduct } from "@/actions/product/product.actions";

const OCR_SERVICE_URL =
  "http://localhost:8000";

type OCRImageInput = {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

type OCRServiceResponse = {
  success: boolean;
  stage?: string;
  summary?: {
    total_images: number;
    successful_images: number;
    failed_images: number;
    total_detections: number;
  };
  images?: unknown[];
  ocr?: {
    text?: string;
    detections?: unknown[];
    detection_count?: number;
    average_confidence?: number;
    engine?: string;
    language?: string;
  };
  extracted_fields?: Record<
    string,
    unknown
  >;
  compliance?: Record<
    string,
    unknown
  >;
  message?: string;
};

function serializeData(
  value: any,
): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (
    typeof value === "object" &&
    typeof value.toJSON === "function"
  ) {
    return value.toJSON();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(
      (item) =>
        serializeData(item),
    );
  }

  if (
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, item]) => [
          key,
          serializeData(item),
        ],
      ),
    );
  }

  return value;
}

export async function processScanWithOCR(
  scanId: string,
  images: OCRImageInput[],
) {
  try {
    const { userId } =
      await auth();

    if (!userId) {
      return {
        success: false,
        message:
          "User is not authenticated",
      };
    }

    const syncResult =
      await syncUserWithDatabase();

    if (
      !syncResult.success ||
      !syncResult.user
    ) {
      return {
        success: false,
        message:
          syncResult.message ??
          "Failed to sync user",
      };
    }

    const user =
      syncResult.user;

    if (!images.length) {
      return {
        success: false,
        message:
          "No images provided",
      };
    }

    const scan =
      await prisma.scan.findUnique({
        where: {
          id: scanId,
        },
        include: {
          images: true,
        },
      });

    if (!scan) {
      return {
        success: false,
        message:
          "Scan not found",
      };
    }

    if (
      scan.userId !==
      user.id
    ) {
      return {
        success: false,
        message:
          "You are not allowed to process this scan",
      };
    }

    const imageUrls =
      images.map(
        (image) =>
          image.secureUrl,
      );

    console.log(
      "\n========== OCR SERVICE ==========",
    );

    console.log(
      "Scan ID:",
      scanId,
    );

    console.log(
      "Images:",
      imageUrls.length,
    );

    const ocrResponse =
      await fetch(
        `${OCR_SERVICE_URL}/ocr/extract`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            image_urls:
              imageUrls,
          }),
        },
      );

    if (!ocrResponse.ok) {
      const errorText =
        await ocrResponse.text();

      console.error(
        "OCR SERVICE ERROR:",
        errorText,
      );

      await prisma.scan.update({
        where: {
          id: scanId,
        },
        data: {
          status: "FAILED",
          errorMessage:
            `OCR service failed: ${errorText}`,
        },
      });

      return {
        success: false,
        message:
          "OCR service failed",
      };
    }

    const ocrResult =
      (await ocrResponse.json()) as OCRServiceResponse;

    if (!ocrResult.success) {
      await prisma.scan.update({
        where: {
          id: scanId,
        },
        data: {
          status: "FAILED",
          errorMessage:
            ocrResult.message ??
            "OCR processing failed",
        },
      });

      return {
        success: false,
        message:
          ocrResult.message ??
          "OCR processing failed",
      };
    }

    const rawOcrText =
      ocrResult.ocr?.text ??
      "";

    const ocrConfidence =
      ocrResult.ocr
        ?.average_confidence ??
      null;

    const ocrEngine =
      ocrResult.ocr?.engine ??
      "PaddleOCR";

    const extractedData =
      ocrResult.extracted_fields ??
      {};

    const complianceResult =
      ocrResult.compliance ??
      {};

    const updatedScan =
      await prisma.scan.update({
        where: {
          id: scanId,
        },
        data: {
          status: "COMPLETED",

          rawOcrText:
            rawOcrText || null,

          ocrConfidence,

          ocrEngine,

          ocrVersion:
            "PaddleOCR + FieldExtraction + RuleEngine",

          extractedData:
            extractedData as Prisma.InputJsonValue,

          analysisResult:
            complianceResult as Prisma.InputJsonValue,

          errorMessage: null,
        },

        include: {
          images: true,
        },
      });

    let productResult:
      | any
      | null = null;

    try {
      console.log(
        "\n========== PRODUCT IDENTIFICATION ==========",
      );

      productResult =
        await findOrCreateProduct(
          extractedData,
        );

      if (
        !productResult.success
      ) {
        console.error(
          "PRODUCT IDENTIFICATION FAILED:",
          productResult.message,
        );
      } else if (
        productResult.product
      ) {
        const linkedResult =
          await prisma.scan.update({
            where: {
              id: scanId,
            },

            data: {
              productId:
                productResult
                  .product.id,
            },

            include: {
              images: true,
              product: true,
            },
          });

        console.log(
          "Product:",
          productResult.created
            ? "NEW PRODUCT CREATED"
            : "EXISTING PRODUCT MATCHED",
        );

        console.log(
          "Product ID:",
          productResult
            .product.id,
        );

        console.log(
          "Match Score:",
          productResult.matchScore,
        );

        if (linkedResult) {
          Object.assign(
            updatedScan,
            linkedResult,
          );
        }
      }

      console.log(
        "============================================\n",
      );
    } catch (productError) {
      console.error(
        "PRODUCT IDENTIFICATION ERROR:",
        productError,
      );
    }

    if (
      ocrResult.images &&
      Array.isArray(
        ocrResult.images,
      )
    ) {
      for (
        const imageResult of
          ocrResult.images
      ) {
        const result =
          imageResult as {
            image_index?: number;
            quality?: {
              passed?: boolean;
              score?: number;
              width?: number;
              height?: number;
            };
          };

        const imageIndex =
          result.image_index;

        if (
          imageIndex ===
            undefined ||
          !result.quality
        ) {
          continue;
        }

        const dbImage =
          scan.images[
            imageIndex - 1
          ];

        if (!dbImage) {
          continue;
        }

        await prisma.scanImage.update({
          where: {
            id: dbImage.id,
          },

          data: {
            qualityScore:
              result.quality
                .score ?? null,

            qualityPassed:
              result.quality
                .passed ?? false,

            width:
              result.quality
                .width ??
              dbImage.width,

            height:
              result.quality
                .height ??
              dbImage.height,
          },
        });
      }
    }

    console.log(
      "OCR + RULE ENGINE SAVED",
    );

    console.log(
      "OCR confidence:",
      ocrConfidence,
    );

    console.log(
      "Compliance:",
      complianceResult,
    );

    console.log(
      "================================\n",
    );

    const serializedScan =
      serializeData(
        updatedScan,
      );

    const serializedProduct =
      serializeData(
        productResult?.product ??
          null,
      );

    return {
      success: true,

      scan:
        serializedScan,

      ocr:
        serializeData(
          ocrResult.ocr,
        ),

      extractedFields:
        serializeData(
          extractedData,
        ),

      compliance:
        serializeData(
          complianceResult,
        ),

      product:
        serializedProduct,

      productMatched:
        productResult?.matched ??
        false,

      productCreated:
        productResult?.created ??
        false,

      productMatchScore:
        productResult?.matchScore ??
        0,
    };
  } catch (error) {
    console.error(
      "PROCESS SCAN OCR ERROR:",
      error,
    );

    try {
      await prisma.scan.update({
        where: {
          id: scanId,
        },

        data: {
          status: "FAILED",

          errorMessage:
            error instanceof Error
              ? error.message
              : "Unknown OCR processing error",
        },
      });
    } catch (updateError) {
      console.error(
        "FAILED TO UPDATE SCAN STATUS:",
        updateError,
      );
    }

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to process scan",
    };
  }
}