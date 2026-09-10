import type {
  OCRImageResult,
  OCRRegion,
  OCRScanResult,
} from "./types";
import type { ScanImage } from "@/lib/scanning/types";
import sharp from "sharp";

const OCR_SPACE_ENDPOINT = "https://api.ocr.space/parse/image";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/**
 * OCR adapter.
 *
 * Primary provider: OCR.space.
 * Fallback: Gemini Vision transcription when OCR.space returns no usable text.
 * The fallback is still treated as OCR/transcription evidence; structured
 * field extraction remains a separate AI step.
 *
 * API keys remain server-side.
 */
export async function runMockOCR(
  images: ScanImage[],
): Promise<OCRScanResult> {
  const ocrSpaceKey = process.env.OCR_SPACE_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const results: OCRImageResult[] = [];

  for (const image of images) {
    let result: OCRImageResult | null = null;

    if (ocrSpaceKey) {
      try {
        result = await runOCRSpace(image, ocrSpaceKey);
      } catch (error) {
        console.error(`OCR.SPACE ERROR FOR IMAGE ${image.id}:`, error);

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

    // OCR.space can return a successful response with no readable text.
    // In that case, use Gemini Vision as a transcription fallback when available.
    if (!result?.text?.trim() && geminiKey) {
      try {
        const fallback = await runGeminiVisionOCR(
          image,
          geminiKey,
        );

        if (fallback.text?.trim()) {
          result = {
            ...fallback,
            warnings: [
              ...(result?.warnings ?? []),
              "OCR.space returned no usable text; Gemini Vision transcription was used as the OCR fallback.",
            ],
          };
        }
      } catch (error) {
        console.error(`GEMINI VISION OCR ERROR FOR IMAGE ${image.id}:`, error);

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
            ? `Gemini Vision OCR fallback failed: ${error.message}`
            : "Gemini Vision OCR fallback failed.",
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
          "No OCR provider is configured.",
          "Set OCR_SPACE_API_KEY or GEMINI_API_KEY to enable OCR.",
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

  const hasConfiguredProvider = Boolean(
    ocrSpaceKey || geminiKey,
  );

  return {
    provider: ocrSpaceKey
      ? geminiKey
        ? "OCR.space + Gemini Vision fallback"
        : "OCR.space"
      : geminiKey
        ? "Gemini Vision OCR"
        : "No OCR provider",
    status: hasLiveResult
      ? "LIVE"
      : hasError
        ? "ERROR"
        : hasConfiguredProvider
          ? "ERROR"
          : "NOT_CONFIGURED",
    images: results,
    warnings: [
      "OCR output is raw text evidence extracted from the supplied product images.",
      "OCR output must not be treated as a legal determination.",
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

  // Resize and compress the image before sending it to OCR.space.
  // This helps prevent HTTP 413 "Payload Too Large" errors.
  const processedBytes = await sharp(originalBytes)
    .rotate()
    .resize({
      width: 1800,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
      mozjpeg: true,
    })
    .toBuffer();

  console.log(
    `OCR image ${image.id}: ${Math.round(originalBytes.length / 1024)} KB → ${Math.round(processedBytes.length / 1024)} KB`,
  );

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

  const response = await fetch(OCR_SPACE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody.toString(),
  });

  if (!response.ok) {
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

async function runGeminiVisionOCR(
  image: ScanImage,
  apiKey: string,
): Promise<OCRImageResult> {
  const model =
    process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  const bytes = Buffer.from(await image.file.arrayBuffer());
  const base64Image = bytes.toString("base64");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: [
                  "Transcribe the visible printed text from this packaged-product label.",
                  "Return only the text that is visibly present in the image.",
                  "Preserve numbers, punctuation, units, currency symbols and line breaks as accurately as possible.",
                  "Do not infer missing words or product information.",
                  "Do not summarize and do not analyze legal compliance.",
                ].join("\\n"),
              },
              {
                inlineData: {
                  mimeType: image.file.type || "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
        },
      }),
    },
  );

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
    error?: {
      message?: string;
    };
  };

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
        `Gemini Vision OCR request failed with status ${response.status}.`,
    );
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Gemini Vision OCR returned no readable text.");
  }

  return {
    imageId: image.id,
    imageType: image.type,
    status: "LIVE",
    text,
    confidence: null,
    regions: [],
    warnings: [],
  };
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
