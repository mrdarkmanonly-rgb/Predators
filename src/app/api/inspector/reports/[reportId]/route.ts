import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/prisma.client";

type RouteContext = {
  params: Promise<{
    reportId: string;
  }>;
};

/**
 * GET /api/inspector/reports/[reportId]
 *
 * Secure inspector-only endpoint for loading a submitted citizen report.
 *
 * Important:
 * - Authentication is checked on the server.
 * - Inspector role is checked against the database, not the client.
 * - Inactive users are rejected.
 * - Evidence binaries are not stored in PostgreSQL; this endpoint only
 *   returns the storage references saved in CitizenReportEvidence.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
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
          message: "Authentication required.",
        },
        { status: 401 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. RESOLVE DATABASE USER + AUTHORITATIVE ROLE
     * ---------------------------------------------------------
     */
    const dbUser = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User account is not registered in the application.",
        },
        { status: 403 },
      );
    }

    if (dbUser.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is inactive.",
        },
        { status: 403 },
      );
    }

    if (dbUser.role !== "INSPECTOR") {
      return NextResponse.json(
        {
          success: false,
          message: "Inspector access is required.",
        },
        { status: 403 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. VALIDATE ROUTE PARAMETER
     * ---------------------------------------------------------
     */
    const { reportId } = await params;
    const normalizedReportId = reportId?.trim();

    if (!normalizedReportId) {
      return NextResponse.json(
        {
          success: false,
          message: "Report ID is required.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. LOAD REPORT
     * ---------------------------------------------------------
     *
     * The inspector is intentionally allowed to load submitted
     * citizen reports without needing the report's userId to
     * match the inspector.
     */
    const report = await prisma.citizenReport.findUnique({
      where: {
        id: normalizedReportId,
      },
      include: {
        evidence: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            storageKey: true,
            originalFileName: true,
            mimeType: true,
            sizeBytes: true,
            imageType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message: "Inspector report not found.",
        },
        { status: 404 },
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. RETURN INSPECTOR-SAFE REPORT DATA
     * ---------------------------------------------------------
     *
     * No Clerk secrets, database internals, or unrelated user
     * information are exposed.
     */
    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        reportNumber: report.reportNumber,
        issueType: report.issueType,
        description: report.description,
        status: report.status,

        shopName: report.shopName,
        shopkeeperName: report.shopkeeperName,
        shopAddress: report.shopAddress,
        shopCity: report.shopCity,
        shopState: report.shopState,
        shopPinCode: report.shopPinCode,

        latitude: report.latitude,
        longitude: report.longitude,
        locationAccuracy: report.locationAccuracy,

        productSnapshot: report.productSnapshot,
        analysisSnapshot: report.analysisSnapshot,

        evidence: report.evidence.map((item: {
  id: string;
  storageKey: string;
  originalFileName: string | null;
  mimeType: string;
  sizeBytes: number;
  imageType: string | null;
  createdAt: Date;
}) => ({
          id: item.id,
          storageKey: item.storageKey,
          originalFileName: item.originalFileName,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
          imageType: item.imageType,
          createdAt: item.createdAt,
        })),

        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    });
  } catch (error) {
    console.error("INSPECTOR REPORT GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load the inspector report.",
      },
      { status: 500 },
    );
  }
}
