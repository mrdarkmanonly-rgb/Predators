import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import type { ScanMode, ProductLabelData } from "@/lib/scanning/types";
import { analyzePreliminaryCompliance } from "@/lib/scanning/preliminary-compliance";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      product?: ProductLabelData;
    };

    if (!body.product || typeof body.product !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Reviewed product details are required.",
        },
        { status: 400 },
      );
    }

    const mode = await resolveScanMode();
    const preliminary = analyzePreliminaryCompliance(body.product);

    return NextResponse.json({
      success: true,
      scan: {
        scanId: crypto.randomUUID(),
        mode,
        product: body.product,
        providerStatus: {
          /*
           * The final analysis uses already-reviewed OCR/AI fields.
           * It does not call OCR or Gemini again.
           */
          ocr: "LIVE",
          ai: "LIVE",
        },
        preliminary: {
          result: preliminary.result,
          score: preliminary.score,
          checks: preliminary.checks,
          warnings: preliminary.warnings,
          disclaimer:
            "This result is not a legal determination. Final compliance decisions must be made by the Legal Metrology rule engine using verified evidence.",
        },
      },
    });
  } catch (error) {
    console.error("EDITED PRODUCT ANALYSIS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to analyze the reviewed product details.",
      },
      { status: 500 },
    );
  }
}

async function resolveScanMode(): Promise<ScanMode> {
  const { userId } = await auth();

  if (!userId) {
    return "guest";
  }

  /*
   * This route does not grant privileged actions.
   * Inspector-specific permissions are resolved by the scanner
   * context/report APIs when those workflows are implemented.
   */
  return "consumer";
}
