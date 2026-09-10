import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/utils/prisma.client";
import {
  deleteCloudinaryEvidence,
  uploadReportEvidence,
} from "@/lib/storage/report-storage";

export const runtime = "nodejs";

const MAX_EVIDENCE = 12;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const ISSUE_TYPES = new Set([
  "INCORRECT_MRP",
  "MISSING_MRP",
  "INCORRECT_NET_QUANTITY",
  "MISSING_MANUFACTURER_DETAILS",
  "MISSING_COUNTRY_OF_ORIGIN",
  "MISSING_DATE_DECLARATION",
  "MISSING_BEST_BEFORE_USE_BY",
  "MISSING_CONSUMER_CARE",
  "INCORRECT_DECLARATION",
  "UNREADABLE_INFORMATION",
  "OTHER",
]);

type JsonObject = Record<string, unknown>;

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

type EvidenceMeta = {
  imageType: string | null;
};

export async function POST(request: Request) {
  const uploadedPublicIds: string[] = [];
  let reportNumber: string | null = null;

  try {
    /*
     * ---------------------------------------------------------
     * 1. AUTHENTICATION
     * ---------------------------------------------------------
     */

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in to submit a report.",
        },
        { status: 401 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. VERIFY CLERK USER
     * ---------------------------------------------------------
     */

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to verify your account.",
        },
        { status: 401 },
      );
    }

    const email =
      clerkUser.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account does not have a valid email address.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. GET / CREATE DATABASE USER
     * ---------------------------------------------------------
     */

    const dbUser = await prisma.user.upsert({
      where: {
        clerkUserId: userId,
      },

      update: {
        name:
          `${clerkUser.firstName ?? ""} ${
            clerkUser.lastName ?? ""
          }`.trim() || null,

        email,

        imageUrl: clerkUser.imageUrl,
      },

      create: {
        clerkUserId: userId,

        name:
          `${clerkUser.firstName ?? ""} ${
            clerkUser.lastName ?? ""
          }`.trim() || null,

        email,

        imageUrl: clerkUser.imageUrl,

        role: "CONSUMER",

        status: "ACTIVE",
      },
    });

    /*
     * ---------------------------------------------------------
     * 4. ACCOUNT STATUS
     * ---------------------------------------------------------
     */

    if (dbUser.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is currently inactive.",
        },
        { status: 403 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. READ FORM DATA
     * ---------------------------------------------------------
     */

    const formData = await request.formData();

    const issueType = stringValue(
      formData.get("issueType"),
    );

    const description = stringValue(
      formData.get("description"),
    );

    const shopName = stringValue(
      formData.get("shopName"),
    );

    const shopkeeperName = stringValue(
      formData.get("shopkeeperName"),
    );

    const shopAddress = stringValue(
      formData.get("shopAddress"),
    );

    const shopCity = stringValue(
      formData.get("shopCity"),
    );

    const shopState = stringValue(
      formData.get("shopState"),
    );

    const shopPinCode = stringValue(
      formData.get("shopPinCode"),
    );

    const scanId = stringValue(
      formData.get("scanId"),
    );

    const productRaw = stringValue(
      formData.get("product"),
    );

    const analysisRaw = stringValue(
      formData.get("analysis"),
    );

    const locationRaw = stringValue(
      formData.get("location"),
    );

    const evidenceMetaRaw = stringValue(
      formData.get("evidenceMeta"),
    );

    /*
     * ---------------------------------------------------------
     * 6. VALIDATION
     * ---------------------------------------------------------
     */

    if (
      !issueType ||
      !ISSUE_TYPES.has(issueType)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a valid issue type.",
        },
        { status: 400 },
      );
    }

    if (
      !description ||
      description.length < 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide a short description of the issue.",
        },
        { status: 400 },
      );
    }

    if (!shopName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shop or store name is required.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 7. PARSE JSON DATA
     * ---------------------------------------------------------
     */

    const product = parseJsonObject(
      productRaw,
      "product",
    );

    const analysis = parseJsonObject(
      analysisRaw,
      "analysis",
    );

    const location = parseLocation(
      locationRaw,
    );

    const evidenceMeta = parseEvidenceMeta(
      evidenceMetaRaw,
    );

    /*
     * ---------------------------------------------------------
     * 8. GET EVIDENCE FILES
     * ---------------------------------------------------------
     */

    const evidenceFiles = formData
      .getAll("evidence")
      .filter(
        (value): value is File =>
          value instanceof File,
      );

    if (evidenceFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one evidence image is required.",
        },
        { status: 400 },
      );
    }

    if (
      evidenceFiles.length >
      MAX_EVIDENCE
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `You can submit up to ${MAX_EVIDENCE} evidence images.`,
        },
        { status: 400 },
      );
    }

    if (
      evidenceMeta.length !==
      evidenceFiles.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Evidence metadata does not match the uploaded images.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 9. SERVER-SIDE FILE VALIDATION
     * ---------------------------------------------------------
     */

    for (const file of evidenceFiles) {
      if (
        !ALLOWED_TYPES.has(file.type)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Unsupported evidence image type: ${
              file.type || "unknown"
            }.`,
          },
          { status: 400 },
        );
      }

      if (
        file.size <= 0 ||
        file.size > MAX_FILE_SIZE
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Each evidence image must be between 1 byte and 10 MB.",
          },
          { status: 400 },
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * 10. REQUEST-SCOPED EVIDENCE
     * ---------------------------------------------------------
     *
     * Evidence remains request-scoped in server memory until the
     * report has been successfully created. It is NOT written to
     * PostgreSQL or permanent storage during the scan/report draft.
     */

    /*
     * ---------------------------------------------------------
     * 11. CREATE REPORT
     * ---------------------------------------------------------
     *
     * Report ID is generated on the server.
     */

    const report =
      await createReportWithUniqueNumber({
        userId: dbUser.id,

        scanId,

        issueType,

        description,

        shopName,

        shopkeeperName,

        shopAddress,

        shopCity,

        shopState,

        shopPinCode,

        location,

        product,

        analysis,
      });

    reportNumber =
      report.reportNumber;

    /*
     * ---------------------------------------------------------
     * 12. UPLOAD EVIDENCE TO CLOUDINARY
     * ---------------------------------------------------------
     *
     * The report already exists at this point. Only now do the
     * evidence images become permanent. PostgreSQL receives only
     * the Cloudinary URL and metadata.
     */

    const permanentEvidence: Array<{
      storageKey: string;
      publicId: string;
      originalFileName: string | null;
      mimeType: string;
      sizeBytes: number;
      imageType: string | null;
    }> = [];

    try {
      for (
        let index = 0;
        index < evidenceFiles.length;
        index += 1
      ) {
        const file = evidenceFiles[index];
        const buffer = Buffer.from(await file.arrayBuffer());
        const meta = evidenceMeta[index];

        const uploaded = await uploadReportEvidence(
          buffer,
          file.type,
          report.reportNumber,
          index,
        );

        uploadedPublicIds.push(uploaded.publicId);

        permanentEvidence.push({
          storageKey: uploaded.secureUrl,
          publicId: uploaded.publicId,
          originalFileName: file.name || null,
          mimeType: file.type,
          sizeBytes: file.size,
          imageType: meta.imageType,
        });
      }

      /*
       * -------------------------------------------------------
       * 13. SAVE CLOUDINARY REFERENCES
       * -------------------------------------------------------
       *
       * PostgreSQL stores the Cloudinary URL and metadata only.
       * Image binary stays in Cloudinary.
       */

      await prisma.citizenReportEvidence.createMany({
        data: permanentEvidence.map((item) => ({
          reportId: report.id,
          storageKey: item.storageKey,
          originalFileName: item.originalFileName,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
          imageType: item.imageType,
        })),
      });

      /*
       * -------------------------------------------------------
       * 14. SUCCESS
       * -------------------------------------------------------
       */

      return NextResponse.json({
        success: true,
        report: {
          id: report.id,
          reportNumber: report.reportNumber,
          status: report.status,
          createdAt: report.createdAt,
          evidenceCount: permanentEvidence.length,
        },
      });
    } catch (error) {
      /*
       * If Cloudinary upload or evidence metadata persistence fails,
       * delete every Cloudinary asset uploaded during this request
       * and remove the report so a partial report is never retained.
       */

      await Promise.all(
        uploadedPublicIds.map((publicId) =>
          deleteCloudinaryEvidence(publicId).catch(() => undefined),
        ),
      );

      await prisma.citizenReport
        .delete({
          where: {
            id: report.id,
          },
        })
        .catch(() => undefined);

      throw error;
    }

  } catch (error) {
    /*
     * ---------------------------------------------------------
     * 15. CLEANUP
     * ---------------------------------------------------------
     */

    if (reportNumber && uploadedPublicIds.length > 0) {
      await Promise.all(
        uploadedPublicIds.map((publicId) =>
          deleteCloudinaryEvidence(publicId).catch(() => undefined),
        ),
      );
    }

    console.error(
      "REPORT SUBMISSION ERROR:",
      error instanceof Error
        ? error.message
        : error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "We could not submit your report. Please try again.",
      },
      { status: 500 },
    );
  }
}

/*
 * ============================================================
 * CREATE REPORT WITH UNIQUE SERVER-SIDE REPORT NUMBER
 * ============================================================
 */

async function createReportWithUniqueNumber(
  input: {
    userId: string;

    scanId: string | null;

    issueType: string;

    description: string;

    shopName: string;

    shopkeeperName:
      | string
      | null;

    shopAddress:
      | string
      | null;

    shopCity:
      | string
      | null;

    shopState:
      | string
      | null;

    shopPinCode:
      | string
      | null;

    location:
      | LocationData
      | null;

    product:
      | JsonObject
      | null;

    analysis:
      | JsonObject
      | null;
  },
) {
  for (
    let attempt = 0;
    attempt < 5;
    attempt += 1
  ) {
    const reportNumber =
      `LM-${new Date().getFullYear()}-${randomReportDigits()}`;

    try {
      return await prisma.citizenReport.create(
        {
          data: {
            reportNumber,

            userId:
              input.userId,

            scanId:
              input.scanId,

            issueType:
              input.issueType,

            description:
              input.description,

            status:
              "SUBMITTED",

            shopName:
              input.shopName,

            shopkeeperName:
              input.shopkeeperName,

            shopAddress:
              input.shopAddress,

            shopCity:
              input.shopCity,

            shopState:
              input.shopState,

            shopPinCode:
              input.shopPinCode,

            latitude:
              input.location
                ?.latitude ??
              null,

            longitude:
              input.location
                ?.longitude ??
              null,

            locationAccuracy:
              input.location
                ?.accuracy ??
              null,

            ...(input.product
              ? {
                  productSnapshot: JSON.parse(
                    JSON.stringify(input.product),
                  ),
                }
              : {}),

            ...(input.analysis
              ? {
                  analysisSnapshot: JSON.parse(
                    JSON.stringify(input.analysis),
                  ),
                }
              : {}),
          },
        },
      );
    } catch (error) {
      /*
       * We don't need Prisma's
       * PrismaClientKnownRequestError class here.
       *
       * If the generated report number happens
       * to collide, try another number.
       */

      if (
        isUniqueConstraintError(
          error,
        )
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Unable to generate a unique report number.",
  );
}

/*
 * ============================================================
 * REPORT NUMBER
 * ============================================================
 */

function randomReportDigits() {
  const value =
    Math.floor(
      100000 +
        Math.random() *
          900000,
    );

  return String(value);
}

/*
 * ============================================================
 * FORM VALUE
 * ============================================================
 */

function stringValue(
  value:
    | FormDataEntryValue
    | null,
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

/*
 * ============================================================
 * JSON OBJECT
 * ============================================================
 */

function parseJsonObject(
  value: string | null,
  name: string,
): JsonObject | null {
  if (!value) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(value);

    if (
      !parsed ||
      typeof parsed !==
        "object" ||
      Array.isArray(parsed)
    ) {
      throw new Error(
        `${name} must be an object.`,
      );
    }

    return parsed as JsonObject;
  } catch {
    throw new Error(
      `Invalid ${name} data.`,
    );
  }
}

/*
 * ============================================================
 * LOCATION
 * ============================================================
 */

function parseLocation(
  value: string | null,
): LocationData | null {
  if (!value) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(value) as {
        latitude?: unknown;
        longitude?: unknown;
        accuracy?: unknown;
      };

    const latitude =
      numberOrNull(
        parsed.latitude,
      );

    const longitude =
      numberOrNull(
        parsed.longitude,
      );

    const accuracy =
      numberOrNull(
        parsed.accuracy,
      );

    if (
      latitude === null ||
      longitude === null
    ) {
      return null;
    }

    if (
      latitude < -90 ||
      latitude > 90
    ) {
      return null;
    }

    if (
      longitude < -180 ||
      longitude > 180
    ) {
      return null;
    }

    return {
      latitude,

      longitude,

      accuracy,
    };
  } catch {
    return null;
  }
}

/*
 * ============================================================
 * EVIDENCE METADATA
 * ============================================================
 */

function parseEvidenceMeta(
  value: string | null,
): EvidenceMeta[] {
  if (!value) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(value);

    if (
      !Array.isArray(parsed)
    ) {
      throw new Error();
    }

    return parsed.map(
      (item) => ({
        imageType:
          item &&
          typeof item.imageType ===
            "string"
            ? item.imageType.slice(
                0,
                100,
              )
            : null,
      }),
    );
  } catch {
    throw new Error(
      "Invalid evidence metadata.",
    );
  }
}

/*
 * ============================================================
 * NUMBER
 * ============================================================
 */

function numberOrNull(
  value: unknown,
) {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

/*
 * ============================================================
 * PRISMA UNIQUE CONSTRAINT CHECK
 * ============================================================
 *
 * We intentionally don't import Prisma here.
 *
 * Prisma 5.22 generated clients can differ in
 * how these exported error types are exposed.
 *
 * P2002 = unique constraint violation.
 */

function isUniqueConstraintError(
  error: unknown,
) {
  if (
    !error ||
    typeof error !==
      "object"
  ) {
    return false;
  }

  const candidate =
    error as {
      code?: unknown;
    };

  return candidate.code ===
    "P2002";
}