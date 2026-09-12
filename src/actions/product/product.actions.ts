/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/prisma.client";
import { Prisma } from "@prisma/client";

type ProductFields = {
  product_name?: string | null;
  brand_name?: string | null;
  manufacturer?: string | null;
  packer?: string | null;
  importer?: string | null;
  net_quantity_value?: number | null;
  net_quantity_unit?: string | null;
  mrp?: number | null;
  country_of_origin?: string | null;
  manufacturing_date?: string | null;
  packing_date?: string | null;
  best_before?: string | null;
  use_by?: string | null;
  consumer_care_details?: string | null;
  [key: string]: unknown;
};

function normalizeValue(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function valuesMatch(
  first: string | null | undefined,
  second: string | null | undefined,
): boolean {
  const normalizedFirst =
    normalizeValue(first);

  const normalizedSecond =
    normalizeValue(second);

  if (
    !normalizedFirst ||
    !normalizedSecond
  ) {
    return false;
  }

  return (
    normalizedFirst ===
    normalizedSecond
  );
}

function parseProductDate(
  value: string | null | undefined,
): Date | null {
  if (!value) {
    return null;
  }

  const normalized =
    value.trim();

  const ddMmYyyyMatch =
    normalized.match(
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
    );

  if (ddMmYyyyMatch) {
    const day = Number(
      ddMmYyyyMatch[1],
    );

    const month =
      Number(ddMmYyyyMatch[2]) - 1;

    const year = Number(
      ddMmYyyyMatch[3],
    );

    const date = new Date(
      year,
      month,
      day,
    );

    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }

    return null;
  }

  const parsedDate =
    new Date(normalized);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return null;
  }

  return parsedDate;
}

function serializeProduct(
  product: any,
) {
  if (!product) {
    return null;
  }

  return {
    ...product,

    netQuantityValue:
      product.netQuantityValue !==
      null
        ? product.netQuantityValue.toString()
        : null,

    mrp:
      product.mrp !== null
        ? product.mrp.toString()
        : null,

    extractedData:
      product.extractedData ?? null,

    createdAt:
      product.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : product.createdAt,

    updatedAt:
      product.updatedAt instanceof Date
        ? product.updatedAt.toISOString()
        : product.updatedAt,
  };
}

function serializeScan(
  scan: any,
) {
  if (!scan) {
    return null;
  }

  return {
    ...scan,

    product:
      scan.product
        ? serializeProduct(
            scan.product,
          )
        : null,

    createdAt:
      scan.createdAt instanceof Date
        ? scan.createdAt.toISOString()
        : scan.createdAt,

    updatedAt:
      scan.updatedAt instanceof Date
        ? scan.updatedAt.toISOString()
        : scan.updatedAt,
  };
}

function calculateProductMatchScore(
  fields: ProductFields,
  product: {
    productName: string | null;
    brandName: string | null;
    manufacturer: string | null;
    netQuantityValue:
      Prisma.Decimal | null;
    netQuantityUnit:
      string | null;
    mrp: Prisma.Decimal | null;
  },
): number {
  let score = 0;
  let availableSignals = 0;

  if (
    fields.product_name &&
    product.productName
  ) {
    availableSignals += 35;

    if (
      valuesMatch(
        fields.product_name,
        product.productName,
      )
    ) {
      score += 35;
    }
  }

  if (
    fields.brand_name &&
    product.brandName
  ) {
    availableSignals += 25;

    if (
      valuesMatch(
        fields.brand_name,
        product.brandName,
      )
    ) {
      score += 25;
    }
  }

  if (
    fields.manufacturer &&
    product.manufacturer
  ) {
    availableSignals += 15;

    if (
      valuesMatch(
        fields.manufacturer,
        product.manufacturer,
      )
    ) {
      score += 15;
    }
  }

  if (
    fields.net_quantity_value !==
      null &&
    fields.net_quantity_value !==
      undefined &&
    product.netQuantityValue !==
      null
  ) {
    availableSignals += 15;

    const extractedQuantity =
      Number(
        fields.net_quantity_value,
      );

    const storedQuantity =
      Number(
        product.netQuantityValue,
      );

    if (
      Number.isFinite(
        extractedQuantity,
      ) &&
      Number.isFinite(
        storedQuantity,
      ) &&
      extractedQuantity ===
        storedQuantity
    ) {
      score += 15;
    }
  }

  if (
    fields.net_quantity_unit &&
    product.netQuantityUnit
  ) {
    availableSignals += 5;

    if (
      valuesMatch(
        fields.net_quantity_unit,
        product.netQuantityUnit,
      )
    ) {
      score += 5;
    }
  }

  if (
    fields.mrp !== null &&
    fields.mrp !== undefined &&
    product.mrp !== null
  ) {
    availableSignals += 5;

    const extractedMrp =
      Number(fields.mrp);

    const storedMrp =
      Number(product.mrp);

    if (
      Number.isFinite(
        extractedMrp,
      ) &&
      Number.isFinite(
        storedMrp,
      ) &&
      extractedMrp === storedMrp
    ) {
      score += 5;
    }
  }

  if (availableSignals === 0) {
    return 0;
  }

  return Math.round(
    (score / availableSignals) *
      100,
  );
}

export async function findMatchingProduct(
  fields: ProductFields,
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

    const productName =
      normalizeValue(
        fields.product_name,
      );

    const brandName =
      normalizeValue(
        fields.brand_name,
      );

    const manufacturer =
      normalizeValue(
        fields.manufacturer,
      );

    if (
      !productName &&
      !brandName &&
      !manufacturer
    ) {
      return {
        success: true,
        matched: false,
        product: null,
        matchScore: 0,
        message:
          "Insufficient product information for reliable matching.",
      };
    }

    const candidates =
      await prisma.product.findMany({
        where: {
          OR: [
            productName
              ? {
                  productName: {
                    contains:
                      productName,
                    mode: "insensitive",
                  },
                }
              : undefined,

            brandName
              ? {
                  brandName: {
                    contains:
                      brandName,
                    mode: "insensitive",
                  },
                }
              : undefined,

            manufacturer
              ? {
                  manufacturer: {
                    contains:
                      manufacturer,
                    mode: "insensitive",
                  },
                }
              : undefined,
          ].filter(
            Boolean,
          ) as Prisma.ProductWhereInput[],
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 20,
      });

    let bestProduct =
      null;

    let bestScore = 0;

    for (
      const product of candidates
    ) {
      const score =
        calculateProductMatchScore(
          fields,
          product,
        );

      if (
        score > bestScore
      ) {
        bestScore = score;
        bestProduct =
          product;
      }
    }

    if (
      !bestProduct ||
      bestScore < 80
    ) {
      return {
        success: true,
        matched: false,
        product: null,
        matchScore: bestScore,
        message:
          "No sufficiently reliable existing product match found.",
      };
    }

    return {
      success: true,
      matched: true,

      product:
        serializeProduct(
          bestProduct,
        ),

      matchScore:
        bestScore,

      message:
        "Existing product matched successfully.",
    };
  } catch (error) {
    console.error(
      "FIND MATCHING PRODUCT ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "Failed to find matching product.",
    };
  }
}

export async function createProductFromExtractedFields(
  fields: ProductFields,
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

    const product =
      await prisma.product.create({
        data: {
          productName:
            fields.product_name ??
            null,

          brandName:
            fields.brand_name ??
            null,

          category:
            typeof fields.category ===
            "string"
              ? fields.category
              : null,

          commonGenericName:
            typeof fields.common_generic_name ===
            "string"
              ? fields.common_generic_name
              : null,

          manufacturer:
            fields.manufacturer ??
            null,

          packer:
            fields.packer ??
            null,

          importer:
            fields.importer ??
            null,

          netQuantityValue:
            fields.net_quantity_value !==
              null &&
            fields.net_quantity_value !==
              undefined
              ? new Prisma.Decimal(
                  fields.net_quantity_value,
                )
              : null,

          netQuantityUnit:
            fields.net_quantity_unit ??
            null,

          mrp:
            fields.mrp !== null &&
            fields.mrp !== undefined
              ? new Prisma.Decimal(
                  fields.mrp,
                )
              : null,

          countryOfOrigin:
            fields.country_of_origin ??
            null,

          manufacturingDate:
            parseProductDate(
              fields.manufacturing_date,
            ),

          packingDate:
            parseProductDate(
              fields.packing_date,
            ),

          bestBefore:
            fields.best_before ??
            null,

          useBy:
            fields.use_by ??
            null,

          consumerCareDetails:
            fields.consumer_care_details ??
            null,

          extractedData:
            fields as Prisma.InputJsonValue,
        },
      });

    return {
      success: true,

      product:
        serializeProduct(
          product,
        ),

      message:
        "New product created successfully.",
    };
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "Failed to create product.",
    };
  }
}

export async function findOrCreateProduct(
  fields: ProductFields,
) {
  try {
    const matchingResult =
      await findMatchingProduct(
        fields,
      );

    if (
      !matchingResult.success
    ) {
      return matchingResult;
    }

    if (
      matchingResult.matched &&
      matchingResult.product
    ) {
      return {
        success: true,
        created: false,
        matched: true,

        product:
          matchingResult.product,

        matchScore:
          matchingResult.matchScore,

        message:
          "Existing product found and selected.",
      };
    }

    const createResult =
      await createProductFromExtractedFields(
        fields,
      );

    if (
      !createResult.success ||
      !createResult.product
    ) {
      return createResult;
    }

    return {
      success: true,
      created: true,
      matched: false,

      product:
        createResult.product,

      matchScore: 0,

      message:
        "No reliable existing product found. New product created.",
    };
  } catch (error) {
    console.error(
      "FIND OR CREATE PRODUCT ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "Failed to find or create product.",
    };
  }
}



export async function getProductById(
  productId: string,
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "User is not authenticated",
      };
    }

    if (!productId?.trim()) {
      return {
        success: false,
        message: "Product ID is required.",
      };
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    return {
      success: true,
      product: serializeProduct(product),
      message: "Product fetched successfully.",
    };
  } catch (error) {
    console.error(
      "GET PRODUCT BY ID ERROR:",
      error,
    );

    return {
      success: false,
      message: "Failed to fetch product.",
    };
  }
}

export async function getProductScanHistory(
  productId: string,
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "User is not authenticated",
      };
    }

    if (!productId?.trim()) {
      return {
        success: false,
        message: "Product ID is required.",
      };
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
        },
      });

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    const scans =
      await prisma.scan.findMany({
        where: {
          productId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          rawOcrText: true,
          ocrConfidence: true,
          ocrEngine: true,
          ocrVersion: true,
          extractedData: true,
          analysisResult: true,
          createdAt: true,
          updatedAt: true,
          images: {
            select: {
              id: true,
              imageType: true,
              secureUrl: true,
            },
          },
        },
      });

    return {
      success: true,
      scans: scans.map((scan) =>
        serializeScan(scan),
      ),
      totalScans: scans.length,
      message:
        "Product scan history fetched successfully.",
    };
  } catch (error) {
    console.error(
      "GET PRODUCT SCAN HISTORY ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "Failed to fetch product scan history.",
    };
  }
}

export async function linkScanToProduct(
  scanId: string,
  productId: string,
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

    const user =
      await prisma.user.findUnique({
        where: {
          clerkUserId:
            userId,
        },
      });

    if (!user) {
      return {
        success: false,
        message:
          "User not found",
      };
    }

    const scan =
      await prisma.scan.findUnique({
        where: {
          id: scanId,
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
          "You are not allowed to modify this scan.",
      };
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product) {
      return {
        success: false,
        message:
          "Product not found",
      };
    }

    const updatedScan =
      await prisma.scan.update({
        where: {
          id: scanId,
        },

        data: {
          productId,
        },

        include: {
          product: true,
          images: true,
        },
      });

    return {
      success: true,

      scan:
        serializeScan(
          updatedScan,
        ),

      product:
        serializeProduct(
          product,
        ),

      message:
        "Scan linked to product successfully.",
    };
  } catch (error) {
    console.error(
      "LINK SCAN TO PRODUCT ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "Failed to link scan to product.",
    };
  }
}