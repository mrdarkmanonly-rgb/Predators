import type {
  OCRImageResult,
  OCRRegion,
  OCRScanResult,
} from "./types";
import type { ScanImage } from "@/lib/scanning/types";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

const OCR_SPACE_ENDPOINT = "https://api.ocr.space/parse/image";

// First attempt: enough time for a normal, slightly slow OCR.space call to
// finish rather than aborting a request that would have succeeded.
const OCR_REQUEST_TIMEOUT_MS = 30_000;

// Retry attempt (harsher compression, smaller image): if OCR.space hasn't
// responded in this much less time, it's not worth waiting further before
// moving on to the local Tesseract fallback.
const OCR_RETRY_TIMEOUT_MS = 15_000;

/**
 * OCR adapter.
 *
 * Primary provider: OCR.space.
 * Fallback: local Tesseract.js OCR when OCR.space is unavailable, errors, or
 * returns no usable text. This intentionally does NOT call out to Gemini
 * Vision for transcription — that added a second network round trip on top
 * of OCR.space on every failure, which was the main source of slow scans.
 * Gemini is still used later, but only as a structured-extraction fallback
 * that reads the OCR text produced here — never raw image bytes.
 *
 * API keys remain server-side.
 */
export async function runMockOCR(
  images: ScanImage[],
): Promise<OCRScanResult> {
  const ocrSpaceKey = process.env.OCR_SPACE_API_KEY?.trim();

  const results: OCRImageResult[] = [];

  for (const image of images) {
    let result: OCRImageResult | null = null;

    // 1. Primary: OCR.space.
    if (ocrSpaceKey) {
      try {
        result = await runOCRSpace(image, ocrSpaceKey);
      } catch (error) {
        console.error(
          `OCR.SPACE ERROR FOR IMAGE ${image.id}:`,
          error,
        );

        result = {
          imageId: image.id,
          imageType: image.type,
          status: "ERROR",
          text: null,
          confidence: null,
          regions: [],
          warnings: [
            "OCR.space failed for this image.",
            error instanceof Error
              ? error.message
              : "Unknown OCR.space error.",
          ],
        };
      }
    }

    // 2. Local fallback. This does not require an API key and runs whenever
    // OCR.space is unavailable, not configured, or produced no usable text.
    if (!result?.text?.trim()) {
      try {
        const localFallback =
          await runTesseractOCR(image);

        if (localFallback.text?.trim()) {
          result = {
            ...localFallback,
            warnings: [
              ...(result?.warnings ?? []),
              "Local Tesseract OCR was used as the fallback.",
            ],
          };
        }
      } catch (error) {
        console.error(
          `TESSERACT OCR ERROR FOR IMAGE ${image.id}:`,
          error,
        );

        if (!result) {
          result = {
            imageId: image.id,
            imageType: image.type,
            status: "ERROR",
            text: null,
            confidence: null,
            regions: [],
            warnings: [],
          };
        }

        result.warnings.push(
          error instanceof Error
            ? `Local Tesseract OCR fallback failed: ${error.message}`
            : "Local Tesseract OCR fallback failed.",
        );
      }
    }

    if (!result) {
      result = {
        imageId: image.id,
        imageType: image.type,
        status: "NOT_CONFIGURED",
        text: null,
        confidence: null,
        regions: [],
        warnings: [
          "No OCR provider is configured and local OCR was unavailable.",
          "Set OCR_SPACE_API_KEY to enable cloud OCR.",
        ],
      };
    }

    results.push(result);
  }

  const hasLiveResult = results.some(
    (result) =>
      result.status === "LIVE" &&
      Boolean(result.text?.trim()),
  );

  const hasError = results.some(
    (result) => result.status === "ERROR",
  );

  return {
    provider: [
      ocrSpaceKey ? "OCR.space" : null,
      "Tesseract.js local fallback",
    ]
      .filter(Boolean)
      .join(" + "),
    status: hasLiveResult
      ? "LIVE"
      : hasError
        ? "ERROR"
        : ocrSpaceKey
          ? "ERROR"
          : "NOT_CONFIGURED",
    images: results,
    warnings: [
      "OCR output is raw text evidence extracted from the supplied product images.",
      "OCR output must not be treated as a legal determination.",
      "Large images are resized and compressed before OCR.space upload.",
      "Local Tesseract OCR is used as a fallback when OCR.space does not produce usable text.",
    ],
  };
}

let tesseractWorkerPromise: ReturnType<
  typeof createWorker
> | null = null;

async function getTesseractWorker() {
  if (!tesseractWorkerPromise) {
    tesseractWorkerPromise = createWorker("eng");
  }

  return tesseractWorkerPromise;
}

async function runTesseractOCR(
  image: ScanImage,
): Promise<OCRImageResult> {
  const originalBytes = Buffer.from(
    await image.file.arrayBuffer(),
  );

  // Keep the large-file protection here too. Tesseract does not need the
  // original full-resolution upload to read normal package-label text.
  const processedBytes = await preprocessForLocalOCR(
    originalBytes,
  );

  const worker = await getTesseractWorker();

  const result = await worker.recognize(
    processedBytes,
  );

  const text =
    result.data.text?.trim() || null;

  const confidence =
    typeof result.data.confidence === "number"
      ? Math.max(
          0,
          Math.min(1, result.data.confidence / 100),
        )
      : null;

  return {
    imageId: image.id,
    imageType: image.type,
    status: "LIVE",
    text,
    confidence,
    regions: [],
    warnings: text
      ? []
      : [
          "Tesseract processed the image but detected no readable text.",
        ],
  };
}

async function preprocessForLocalOCR(
  originalBytes: Buffer,
): Promise<Buffer> {
  return sharp(originalBytes)
    .rotate()
    .resize({
      width: 1800,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .grayscale()
    .normalize()
    .jpeg({
      quality: 82,
      mozjpeg: true,
    })
    .toBuffer();
}

/**
 * Compresses the source image for OCR.space upload.
 *
 * `strength` selects how aggressive the compression is. The retry path uses
 * "strong" so a second attempt is both smaller and faster to process after a
 * timeout, without changing the default (first-attempt) quality.
 */
async function compressForOCRSpace(
  originalBytes: Buffer,
  strength: "default" | "strong",
): Promise<Buffer> {
  const targets =
    strength === "default"
      ? { width: 1800, height: 1800, quality: 80 }
      : { width: 1400, height: 1400, quality: 60 };

  let processedBytes = await sharp(originalBytes)
    .rotate()
    .resize({
      width: targets.width,
      height: targets.height,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: targets.quality,
      mozjpeg: true,
    })
    .toBuffer();

  // Keep the existing large-file fix and make it more defensive. URL-
  // encoded base64 can be considerably larger than the binary JPEG.
  if (processedBytes.length > 1_500_000) {
    processedBytes = await sharp(processedBytes)
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 65,
        mozjpeg: true,
      })
      .toBuffer();
  }

  return processedBytes;
}

async function callOCRSpace(
  image: ScanImage,
  apiKey: string,
  processedBytes: Buffer,
  timeoutMs: number,
): Promise<OCRImageResult> {
  const base64Image = processedBytes.toString("base64");

  const formBody = new URLSearchParams();

  formBody.append("apikey", apiKey);

  formBody.append(
    "base64Image",
    `data:image/jpeg;base64,${base64Image}`,
  );

  formBody.append("language", "eng");
  formBody.append("OCREngine", "2");
  formBody.append("scale", "true");
  formBody.append("detectOrientation", "true");
  formBody.append("isOverlayRequired", "true");

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs,
  );

  let response: Response;

  try {
    response = await fetch(OCR_SPACE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody.toString(),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error(
        "OCR.space rejected the image as too large (HTTP 413) even after image compression.",
      );
    }

    if (response.status >= 500) {
      throw new Error(
        `OCR.space is temporarily unavailable (HTTP ${response.status}).`,
      );
    }

    throw new Error(
      `OCR.space request failed with status ${response.status}.`,
    );
  }

  const data = (await response.json()) as {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string | string[];
    ParsedResults?: Array<{
      ParsedText?: string;
      TextOverlay?: {
        Lines?: Array<{
          LineText?: string;
          Words?: Array<{
            WordText?: string;
            Left?: number;
            Top?: number;
            Width?: number;
            Height?: number;
          }>;
        }>;
      };
    }>;
  };

  if (data.IsErroredOnProcessing) {
    const message = Array.isArray(data.ErrorMessage)
      ? data.ErrorMessage.join(", ")
      : data.ErrorMessage;

    throw new Error(
      message || "OCR.space could not process the image.",
    );
  }

  const parsedResult = data.ParsedResults?.[0];

  const text =
    parsedResult?.ParsedText?.trim() || null;

  return {
    imageId: image.id,
    imageType: image.type,
    status: "LIVE",
    text,
    confidence: null,
    regions: extractRegions(
      image.id,
      parsedResult?.TextOverlay,
    ),
    warnings: text
      ? []
      : [
          "OCR.space processed the image but detected no readable text.",
        ],
  };
}

async function runOCRSpace(
  image: ScanImage,
  apiKey: string,
): Promise<OCRImageResult> {
  const originalBytes = Buffer.from(
    await image.file.arrayBuffer(),
  );

  const processedBytes = await compressForOCRSpace(
    originalBytes,
    "default",
  );

  console.log(
    `OCR image ${image.id}: ${Math.round(originalBytes.length / 1024)} KB → ${Math.round(processedBytes.length / 1024)} KB`,
  );

  try {
    return await callOCRSpace(
      image,
      apiKey,
      processedBytes,
      OCR_REQUEST_TIMEOUT_MS,
    );
  } catch (error) {
    // Only retry on an actual timeout. A real server error (e.g. OCR.space
    // returning 5xx, as opposed to us aborting) means retrying against the
    // same degraded service rarely helps and just delays falling back to
    // Tesseract, so those are thrown straight through.
    const isAbort =
      error instanceof Error && error.name === "AbortError";

    if (!isAbort) {
      throw error;
    }

    console.warn(
      `OCR.space timed out for image ${image.id} after ${OCR_REQUEST_TIMEOUT_MS / 1000}s. Retrying once with stronger compression...`,
    );

    const retryBytes = await compressForOCRSpace(
      originalBytes,
      "strong",
    );

    console.log(
      `OCR image ${image.id} retry: ${Math.round(originalBytes.length / 1024)} KB → ${Math.round(retryBytes.length / 1024)} KB`,
    );

    return await callOCRSpace(
      image,
      apiKey,
      retryBytes,
      OCR_RETRY_TIMEOUT_MS,
    );
  }
}

function extractRegions(
  imageId: string,
  overlay:
    | {
        Lines?: Array<{
          LineText?: string;
          Words?: Array<{
            WordText?: string;
            Left?: number;
            Top?: number;
            Width?: number;
            Height?: number;
          }>;
        }>;
      }
    | undefined,
): OCRRegion[] {
  if (!overlay?.Lines) return [];

  const regions: OCRRegion[] = [];

  overlay.Lines.forEach((line, lineIndex) => {
    const words = line.Words ?? [];

    if (words.length === 0) {
      const text = line.LineText?.trim();
      if (!text) return;

      regions.push({
        id: `${imageId}-line-${lineIndex + 1}`,
        text,
        confidence: null,
        boundingBox: null,
      });
      return;
    }

    const text = words
      .map((word) => word.WordText ?? "")
      .join(" ")
      .trim();

    if (!text) return;

    const left = Math.min(...words.map((word) => word.Left ?? 0));
    const top = Math.min(...words.map((word) => word.Top ?? 0));
    const right = Math.max(
      ...words.map(
        (word) => (word.Left ?? 0) + (word.Width ?? 0),
      ),
    );
    const bottom = Math.max(
      ...words.map(
        (word) => (word.Top ?? 0) + (word.Height ?? 0),
      ),
    );

    regions.push({
      id: `${imageId}-line-${lineIndex + 1}`,
      text,
      confidence: null,
      boundingBox: {
        x: left,
        y: top,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
      },
    });
  });

  return regions;
}