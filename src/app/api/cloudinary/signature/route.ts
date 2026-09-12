import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { paramsToSign } = body;

    if (!paramsToSign) {
      return NextResponse.json(
        {
          error: "Missing paramsToSign",
        },
        {
          status: 400,
        }
      );
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
    });
  } catch (error) {
    console.error("CLOUDINARY SIGNATURE ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to generate Cloudinary signature",
      },
      {
        status: 500,
      }
    );
  }
}