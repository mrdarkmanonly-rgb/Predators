import crypto from "node:crypto";
import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else if (cloudinaryUrl) {
  cloudinary.config({
    secure: true,
  });
}

function ensureConfigured() {
  if (!(cloudName && apiKey && apiSecret) && !cloudinaryUrl) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
}

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
}

/**
 * Upload a report evidence image to Cloudinary.
 *
 * This is intentionally called only after the CitizenReport has been
 * created successfully. PostgreSQL stores the returned secure URL;
 * Cloudinary stores the image binary.
 */
export async function uploadReportEvidence(
  buffer: Buffer,
  mimeType: string,
  reportNumber: string,
  index: number,
) {
  ensureConfigured();

  const folder = `checkitright/reports/${safeSegment(reportNumber)}`;
  const publicId = `${folder}/evidence-${index + 1}-${crypto.randomUUID()}`;

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        public_id: publicId,
        overwrite: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });

  if (!result.secure_url || !result.public_id) {
    throw new Error("Cloudinary returned an incomplete upload response.");
  }

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    mimeType,
  };
}

/**
 * Delete a Cloudinary evidence image during rollback.
 */
export async function deleteCloudinaryEvidence(publicId: string) {
  ensureConfigured();

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    type: "upload",
    invalidate: true,
  });
}
