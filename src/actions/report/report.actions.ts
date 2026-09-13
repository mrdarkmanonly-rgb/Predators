"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/prisma.client";
import { UserRole, ReportStatus } from "@prisma/client";

type CreateCitizenReportInput = {
  scanId: string;
  productId?: string | null;
  issueType: string;
  description: string;
  locationText: string;
  shopName: string;
  shopAddress: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
};

function generateReportCode() {
  const timestamp = Date.now().toString(36).toUpperCase();

  const random = Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();

  return `CR-${timestamp}-${random}`;
}

export async function createCitizenReport(
  input: CreateCitizenReportInput,
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to submit a report.",
      };
    }

    if (!input.scanId?.trim()) {
      return {
        success: false,
        message: "Scan ID is required.",
      };
    }

    if (!input.issueType?.trim()) {
      return {
        success: false,
        message: "Issue type is required.",
      };
    }

    if (!input.description?.trim()) {
      return {
        success: false,
        message: "Description is required.",
      };
    }

    if (!input.locationText?.trim()) {
      return {
        success: false,
        message: "Location is required.",
      };
    }

    if (!input.shopName?.trim()) {
      return {
        success: false,
        message: "Shop name is required.",
      };
    }

    if (!input.shopAddress?.trim()) {
      return {
        success: false,
        message: "Shop address is required.",
      };
    }

    if (!input.city?.trim()) {
      return {
        success: false,
        message: "City is required.",
      };
    }

    if (!input.state?.trim()) {
      return {
        success: false,
        message: "State is required.",
      };
    }

    if (!/^\d{6}$/.test(input.pincode?.trim() ?? "")) {
      return {
        success: false,
        message: "A valid 6-digit pincode is required.",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User account was not found.",
      };
    }

    if (user.status !== "ACTIVE") {
      return {
        success: false,
        message: "Your account is inactive.",
      };
    }

    const scan = await prisma.scan.findUnique({
      where: {
        id: input.scanId,
      },
      select: {
        id: true,
        userId: true,
        productId: true,
      },
    });

    if (!scan) {
      return {
        success: false,
        message: "Scan not found.",
      };
    }

    if (scan.userId !== user.id) {
      return {
        success: false,
        message:
          "You are not allowed to create a report for this scan.",
      };
    }

    const finalProductId =
      input.productId?.trim() || scan.productId || null;

    if (finalProductId) {
      const product = await prisma.product.findUnique({
        where: {
          id: finalProductId,
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
    }

    const issueType = input.issueType.trim();
    const description = input.description.trim();
    const locationText = input.locationText.trim();
    const shopName = input.shopName.trim();
    const shopAddress = input.shopAddress.trim();
    const city = input.city.trim();
    const state = input.state.trim();
    const pincode = input.pincode.trim();

    const duplicateSince = new Date(
      Date.now() - 2 * 60 * 1000,
    );

    const existingReport =
      await prisma.citizenReport.findFirst({
        where: {
          submittedById: user.id,
          scanId: scan.id,
          productId: finalProductId,
          issueType,
          description,
          locationText,
          shopName,
          shopAddress,
          city,
          state,
          pincode,
          createdAt: {
            gte: duplicateSince,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          reportCode: true,
          status: true,
          productId: true,
          scanId: true,
          createdAt: true,
        },
      });

    if (existingReport) {
      return {
        success: true,
        report: existingReport,
        message: "Report already submitted.",
      };
    }

    const reportStatus =
      user.role === UserRole.INSPECTOR
        ? ReportStatus.FORWARDED_TO_INSPECTOR
        : ReportStatus.SUBMITTED;

    let reportCode = generateReportCode();

    for (let attempt = 0; attempt < 5; attempt++) {
      const existingCode =
        await prisma.citizenReport.findUnique({
          where: {
            reportCode,
          },
          select: {
            id: true,
          },
        });

      if (!existingCode) {
        break;
      }

      reportCode = generateReportCode();
    }

    const report = await prisma.citizenReport.create({
      data: {
        reportCode,
        submittedById: user.id,
        productId: finalProductId,
        scanId: scan.id,
        status: reportStatus,
        issueType,
        description,
        locationText,
        shopName,
        shopAddress,
        city,
        state,
        pincode,
        latitude:
          typeof input.latitude === "number"
            ? input.latitude
            : null,
        longitude:
          typeof input.longitude === "number"
            ? input.longitude
            : null,
      },
      select: {
        id: true,
        reportCode: true,
        status: true,
        productId: true,
        scanId: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      report,
      message: "Report submitted successfully.",
    };
  } catch (error) {
    console.error(
      "CREATE CITIZEN REPORT ERROR:",
      error,
    );

    return {
      success: false,
      message: "Failed to create report.",
    };
  }
}