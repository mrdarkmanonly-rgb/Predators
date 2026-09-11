import type {
  ExtractedField,
  ProductLabelData,
  ScanImage,
} from "@/lib/scanning/types";

import type { OCRScanResult } from "@/lib/ocr/types";

import type {
  AIExtractionResult,
  ExtractedProductField,
  StructuredProductData,
} from "./types";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const DEFAULT_OPENROUTER_MODEL = "openai/gpt-oss-20b:free";

// Removed "openrouter/free". That's a wildcard/auto-router alias, not a
// specific model — OpenRouter can route it to ANY free model, including
// safety/moderation-classifier models that were never meant to do
// structured JSON extraction. That's what produced the
// `"User Safety: safe"` garbage response instead of JSON. Only concrete,
// known-suitable instruct models belong in this list.
const DEFAULT_OPENROUTER_FALLBACK_MODELS = [
  "openai/gpt-oss-20b:free",
  "google/gemma-4-31b-it:free",
];

const DEFAULT_GEMINI_FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash-lite",
];

const PRODUCT_FIELDS: Array<keyof ProductLabelData> = [
  "productName",
  "brandName",
  "manufacturer",
  "packer",
  "importer",
  "netQuantity",
  "mrp",
  "manufacturingDate",
  "expiryDate",
  "consumerCare",
  "countryOfOrigin",
  "batchNumber",
];

type GeminiField = {
  value?: unknown;
  rawValue?: unknown;
  confidence?: unknown;
  sourceImageId?: unknown;
};

type GeminiExtraction = Partial<
  Record<keyof ProductLabelData, GeminiField | string | null>
>;

type OCRSource = {
  imageId: string;
  imageType: ScanImage["type"];
  text: string;
};

export async function runMockExtraction(
  ocrResult: OCRScanResult,
): Promise<AIExtractionResult> {
  const usableSources = getUsableOCRSources(ocrResult);

  if (usableSources.length === 0) {
    return {
      provider: "OCR",
      status: "NOT_CONFIGURED",
      product: createEmptyProduct(),
      warnings: [
        "No usable OCR text was available for structured product extraction.",
      ],
      sourceOCRStatus: ocrResult.status,
    };
  }

  const combinedText = usableSources
    .map(
      (source) =>
        `[IMAGE_ID: ${source.imageId}]\n[IMAGE_TYPE: ${source.imageType}]\n${source.text}`,
    )
    .join("\n\n--- NEXT IMAGE ---\n\n");

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openRouterKey =
    process.env.OPENROUTER_API_KEY?.trim();

  let openRouterError: string | null = null;

  // Primary provider: OpenRouter using the exact requested model.
  // The model is text-only, so it receives OCR text and never raw image bytes.
  if (openRouterKey) {
    try {
      const openRouterResult =
        await extractWithOpenRouter(
          combinedText,
          usableSources,
          openRouterKey,
        );

      const detectedCount = countDetectedFields(
        openRouterResult.product,
      );

      if (detectedCount > 0) {
        return openRouterResult;
      }

      openRouterError =
        "OpenRouter returned no usable product fields.";

      console.warn(
        "OpenRouter returned no usable product fields. Trying Gemini fallback.",
      );
    } catch (error) {
      openRouterError =
        error instanceof Error
          ? error.message
          : "Unknown OpenRouter extraction error.";

      console.warn(
        "OpenRouter extraction failed. Trying Gemini fallback.",
        error,
      );
    }
  }

  // Optional secondary provider. This keeps existing Gemini support without
  // making it the primary AI provider.
  if (geminiKey) {
    try {
      const geminiResult = await extractWithGemini(
        combinedText,
        usableSources,
        geminiKey,
      );

      const detectedCount = countDetectedFields(
        geminiResult.product,
      );

      if (detectedCount > 0) {
        return {
          ...geminiResult,
          warnings: [
            ...(openRouterError
              ? [
                  `OpenRouter was unavailable; Gemini fallback was used: ${openRouterError}`,
                ]
              : []),
            ...geminiResult.warnings,
          ],
        };
      }

      return createFallbackResult(
        ocrResult,
        [
          ...(openRouterError
            ? [`OpenRouter failed: ${openRouterError}`]
            : []),
          "Gemini returned no usable product fields.",
          ...geminiResult.warnings,
          "AI providers did not return usable structured data. Fields were extracted directly from OCR evidence and should be reviewed.",
        ].join(" "),
      );
    } catch (error) {
      const geminiError =
        error instanceof Error
          ? error.message
          : "Unknown Gemini extraction error.";

      console.error(
        "GEMINI EXTRACTION ERROR:",
        error,
      );

      return createFallbackResult(
        ocrResult,
        [
          ...(openRouterError
            ? [`OpenRouter failed: ${openRouterError}`]
            : []),
          `Gemini failed: ${geminiError}`,
          "AI structured extraction was unavailable. Fields were extracted directly from OCR evidence and should be reviewed.",
        ].join(" "),
      );
    }
  }

  // No cloud AI provider configured/available: preserve deterministic OCR
  // extraction so the scan remains usable.
  return createFallbackResult(
    ocrResult,
    openRouterError
      ? `OpenRouter extraction was unavailable (${openRouterError}). Fields were extracted directly from OCR evidence and should be reviewed.`
      : "No AI extraction provider is configured. Fields were extracted directly from OCR evidence and should be reviewed.",
  );
}

async function extractWithOpenRouter(
  combinedText: string,
  sources: OCRSource[],
  apiKey: string,
): Promise<AIExtractionResult> {
  const configuredModel =
    process.env.OPENROUTER_MODEL?.trim() ||
    DEFAULT_OPENROUTER_MODEL;

  const fallbackModels = Array.from(
    new Set([
      configuredModel,
      ...DEFAULT_OPENROUTER_FALLBACK_MODELS,
    ]),
  );

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    45_000,
  );

  const prompt = `
You are the structured product-label extraction layer for CheckItRight.

Extract packaged-product label information ONLY from the supplied OCR evidence.

IMPORTANT RULES:
1. Use ONLY information explicitly present in the OCR text.
2. Never invent missing information.
3. Never guess a value.
4. If a field is not present, return null for value, rawValue, confidence, and sourceImageId.
5. Preserve the original wording in rawValue.
6. value may contain a lightly normalized version of rawValue.
7. Confidence must be between 0 and 1.
8. sourceImageId MUST be one of the IMAGE_ID values supplied below.
9. Never create an image ID.
10. Do not make legal compliance decisions.
11. Do not say whether a declaration is legally required.
12. Return ONLY valid JSON.
13. Do not wrap the JSON in markdown fences.
14. Every non-null field must be supported by the OCR evidence.
15. If the evidence is ambiguous, use a lower confidence instead of guessing.

Available image IDs:
${sources
  .map(
    (source) =>
      `- ${source.imageId} (${source.imageType})`,
  )
  .join("\n")}

Return exactly this JSON shape:

{
  "productName": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "brandName": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "manufacturer": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "packer": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "importer": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "netQuantity": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "mrp": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "manufacturingDate": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "expiryDate": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "consumerCare": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "countryOfOrigin": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "batchNumber": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  }
}

OCR TEXT:
${combinedText}
`.trim();

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...(process.env.OPENROUTER_SITE_URL
            ? {
                "HTTP-Referer":
                  process.env.OPENROUTER_SITE_URL,
              }
            : {}),
          "X-Title":
            process.env.OPENROUTER_APP_NAME ||
            "CheckItRight",
        },
        body: JSON.stringify({
          model: fallbackModels[0],
          models: fallbackModels,
          messages: [
            {
              role: "system",
              content:
                "You extract structured product-label information from OCR evidence. Do not invent values and do not make legal compliance decisions. Return only valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0,
          max_tokens: 4096,
        }),
        signal: controller.signal,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          `OpenRouter extraction request failed with status ${response.status}.`,
      );
    }

    const responseText =
      extractOpenRouterText(data);

    if (!responseText) {
      const finishReason =
        data?.choices?.[0]?.finish_reason;

      const refusal =
        data?.choices?.[0]?.message?.refusal;

      throw new Error(
        refusal
          ? `OpenRouter refused the extraction request: ${String(refusal)}`
          : finishReason
            ? `OpenRouter returned no extraction content (finish reason: ${String(finishReason)}).`
            : "OpenRouter returned an empty extraction response.",
      );
    }

    const parsed = parseGeminiJSON(responseText);

    if (!parsed || typeof parsed !== "object") {
      const finishReason =
        data?.choices?.[0]?.finish_reason;

      const snippet = responseText
        .slice(0, 300)
        .replace(/\s+/g, " ")
        .trim();

      throw new Error(
        `OpenRouter returned invalid structured extraction data${
          finishReason ? ` (finish reason: ${finishReason})` : ""
        }. Response started with: "${snippet}${
          responseText.length > 300 ? "..." : ""
        }"`,
      );
    }

    const product = mapExtraction(
      parsed as GeminiExtraction,
      sources,
    );

    return {
      provider: `OpenRouter ${data?.model || fallbackModels[0]}`,
      status: "LIVE",
      product,
      warnings: [],
      sourceOCRStatus: "LIVE",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function extractOpenRouterText(data: any): string | null {
  const message = data?.choices?.[0]?.message;
  const content = message?.content;

  if (typeof content === "string") {
    return content.trim() || null;
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part: any) => {
        // Reasoning-model responses can include hidden chain-of-thought
        // parts alongside the final answer. Skip anything explicitly typed
        // as reasoning so it never gets concatenated into the JSON we parse.
        if (
          part?.type === "reasoning" ||
          part?.type === "thinking"
        ) {
          return "";
        }

        if (typeof part === "string") {
          return part;
        }

        if (typeof part?.text === "string") {
          return part.text;
        }

        if (
          typeof part?.content === "string"
        ) {
          return part.content;
        }

        return "";
      })
      .filter(Boolean)
      .join("\n")
      .trim();

    if (text) {
      return text;
    }
  }

  // Some OpenRouter-compatible responses expose generated text through
  // output/message-like fields instead of message.content. Support those
  // variants without treating internal reasoning as extraction output.
  const alternatives = [
    message?.output_text,
    data?.output_text,
    data?.choices?.[0]?.text,
  ];

  for (const candidate of alternatives) {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();

      if (trimmed) {
        return trimmed;
      }
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Gemini extraction                                                          */
/* -------------------------------------------------------------------------- */

async function extractWithGemini(
  combinedText: string,
  sources: OCRSource[],
  apiKey: string,
): Promise<AIExtractionResult> {
  const configuredModel =
    process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  const models = Array.from(
    new Set([
      configuredModel,
      ...DEFAULT_GEMINI_FALLBACK_MODELS,
    ]),
  );

  const prompt = `
You are extracting structured product-label information from OCR text.

IMPORTANT RULES:

1. Use ONLY information explicitly present in the OCR text.
2. Never invent missing information.
3. Never guess a value.
4. If a field is not present, return null.
5. Preserve the original wording in rawValue.
6. value may contain a lightly normalized version.
7. Confidence must be between 0 and 1.
8. sourceImageId MUST be one of the IMAGE_ID values provided in the OCR.
9. Do not create image IDs.
10. Do not make legal compliance decisions.
11. Do not say whether a declaration is legally required.
12. Return ONLY valid JSON.
13. Do not wrap the JSON in markdown fences.
14. Every non-null field must be supported by the OCR evidence.
15. If the evidence is ambiguous, use a lower confidence instead of guessing.

Available image IDs:

${sources
  .map(
    (source) =>
      `- ${source.imageId} (${source.imageType})`,
  )
  .join("\n")}

Return exactly this JSON shape:

{
  "productName": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "brandName": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "manufacturer": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "packer": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "importer": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "netQuantity": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "mrp": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "manufacturingDate": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "expiryDate": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "consumerCare": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "countryOfOrigin": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  },
  "batchNumber": {
    "value": null,
    "rawValue": null,
    "confidence": null,
    "sourceImageId": null
  }
}

OCR TEXT:

${combinedText}
`.trim();

  const errors: string[] = [];

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      20_000,
    );

    try {
      const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent` +
        `?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            `Gemini extraction request failed with status ${response.status}.`,
        );
      }

      const responseText = extractGeminiText(data);

      if (!responseText) {
        throw new Error(
          "Gemini returned an empty extraction response.",
        );
      }

      const parsed = parseGeminiJSON(responseText);

      if (!parsed || typeof parsed !== "object") {
        throw new Error(
          "Gemini returned invalid structured extraction data.",
        );
      }

      const product = mapExtraction(
        parsed as GeminiExtraction,
        sources,
      );

      if (countDetectedFields(product) === 0) {
        throw new Error(
          "Gemini returned no usable product fields.",
        );
      }

      return {
        provider: `Gemini ${model}`,
        status: "LIVE",
        product,
        warnings:
          errors.length > 0
            ? [
                `Earlier Gemini model attempts failed: ${errors.join(" | ")}`,
              ]
            : [],
        sourceOCRStatus: "LIVE",
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.name === "AbortError"
            ? `Gemini ${model} timed out after 20 seconds.`
            : error.message
          : `Unknown Gemini error for ${model}.`;

      errors.push(`${model}: ${message}`);

      console.warn(
        `Gemini extraction failed for model ${model}. Trying next fallback if available.`,
        error,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(
    `All Gemini extraction models failed. ${errors.join(" | ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Gemini response parsing                                                    */
/* -------------------------------------------------------------------------- */

function extractGeminiText(data: any): string | null {
  const candidates = data?.candidates;

  if (!Array.isArray(candidates)) {
    return null;
  }

  const parts = candidates[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return null;
  }

  const text = parts
    .map((part: any) =>
      typeof part?.text === "string"
        ? part.text
        : "",
    )
    .filter(Boolean)
    .join("\n")
    .trim();

  return text || null;
}

function parseGeminiJSON(text: string): unknown {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // First try the complete response.
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue with extraction from surrounding model text.
  }

  // Find the first balanced JSON object. This is safer than simply taking
  // indexOf("{") through lastIndexOf("}") because model text can contain
  // additional braces after the actual JSON.
  for (let start = 0; start < cleaned.length; start += 1) {
    if (cleaned[start] !== "{") continue;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < cleaned.length; index += 1) {
      const character = cleaned[index];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (character === "\\") {
          escaped = true;
        } else if (character === '"') {
          inString = false;
        }
        continue;
      }

      if (character === '"') {
        inString = true;
        continue;
      }

      if (character === "{") {
        depth += 1;
      } else if (character === "}") {
        depth -= 1;

        if (depth === 0) {
          const candidate = cleaned.slice(start, index + 1);

          try {
            return JSON.parse(candidate);
          } catch {
            const repaired = candidate.replace(/,\s*([}\]])/g, "$1");

            try {
              return JSON.parse(repaired);
            } catch {
              break;
            }
          }
        }
      }
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Gemini → application model                                                 */
/* -------------------------------------------------------------------------- */

function mapExtraction(
  extraction: GeminiExtraction,
  sources: OCRSource[],
): StructuredProductData {
  const result = createEmptyProduct();

  for (const key of PRODUCT_FIELDS) {
    const rawField = extraction[key];

    if (rawField === undefined || rawField === null) {
      continue;
    }

    const normalized = normalizeGeminiField(rawField);

    if (!normalized.value) {
      continue;
    }

    const source = resolveSource(
      normalized.sourceImageId,
      normalized.rawValue,
      normalized.value,
      sources,
    );

    result[key] = {
      value: normalized.value,
      rawValue:
        normalized.rawValue || normalized.value,
      confidence:
        normalized.confidence ??
        0.85,
      sourceImageId:
        source?.imageId ?? null,
      evidence: {
        imageId:
          source?.imageId ?? null,
        imageType:
          source?.imageType ?? null,
        regionId: null,
      },
    };
  }

  return result;
}

function normalizeGeminiField(
  field: GeminiField | string,
): {
  value: string | null;
  rawValue: string | null;
  confidence: number | null;
  sourceImageId: string | null;
} {
  if (typeof field === "string") {
    return {
      value: cleanValue(field),
      rawValue: cleanValue(field),
      confidence: 0.8,
      sourceImageId: null,
    };
  }

  const value =
    typeof field.value === "string"
      ? cleanValue(field.value)
      : null;

  const rawValue =
    typeof field.rawValue === "string"
      ? cleanValue(field.rawValue)
      : value;

  const numericConfidence =
    typeof field.confidence === "number"
      ? field.confidence
      : typeof field.confidence === "string"
        ? Number(field.confidence)
        : null;

  return {
    value,
    rawValue,
    confidence:
      numericConfidence !== null &&
      Number.isFinite(numericConfidence)
        ? clamp(numericConfidence, 0, 1)
        : null,
    sourceImageId:
      typeof field.sourceImageId === "string"
        ? field.sourceImageId
        : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Source matching                                                            */
/* -------------------------------------------------------------------------- */

function resolveSource(
  sourceImageId: string | null,
  rawValue: string | null,
  value: string | null,
  sources: OCRSource[],
): OCRSource | null {
  if (sourceImageId) {
    const exact = sources.find(
      (source) =>
        source.imageId === sourceImageId,
    );

    if (exact) {
      return exact;
    }
  }

  const searchValues = [
    rawValue,
    value,
  ]
    .filter(
      (item): item is string =>
        Boolean(item),
    )
    .map(normalizeSearchText);

  if (searchValues.length > 0) {
    const matched = sources.find((source) => {
      const sourceText =
        normalizeSearchText(source.text);

      return searchValues.some((searchValue) =>
        searchValue.length > 2 &&
        sourceText.includes(searchValue),
      );
    });

    if (matched) {
      return matched;
    }
  }

  if (sources.length === 1) {
    return sources[0];
  }

  return null;
}

function getUsableOCRSources(
  ocrResult: OCRScanResult,
): OCRSource[] {
  return ocrResult.images
    .filter(
      (image) =>
        typeof image.text === "string" &&
        image.text.trim().length > 0,
    )
    .map((image) => ({
      imageId: image.imageId,
      imageType: image.imageType,
      text: image.text!.trim(),
    }));
}

/* -------------------------------------------------------------------------- */
/* OCR deterministic fallback                                                 */
/* -------------------------------------------------------------------------- */

function createFallbackResult(
  ocrResult: OCRScanResult,
  warning: string,
): AIExtractionResult {
  const sources = getUsableOCRSources(
    ocrResult,
  );

  if (sources.length === 0) {
    return {
      provider: "OCR fallback",
      status: "NOT_CONFIGURED",
      product: createEmptyProduct(),
      warnings: [
        warning,
        "No OCR text was available.",
      ],
      sourceOCRStatus: ocrResult.status,
    };
  }

  const product = createEmptyProduct();

  for (const source of sources) {
    const extracted =
      extractFieldsFromOCRText(source);

    mergeProductFields(
      product,
      extracted,
    );
  }

  return {
    provider: "OCR deterministic fallback",
    status: "MOCK_MODE",
    product,
    warnings: [
      warning,
      "Please review extracted values before relying on them.",
    ],
    sourceOCRStatus: ocrResult.status,
  };
}

function extractFieldsFromOCRText(
  source: OCRSource,
): StructuredProductData {
  const text = source.text.replace(
    /\r/g,
    "",
  );

  const normalized = text
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const product = createEmptyProduct();

  /* ----------------------------- Product name ---------------------------- */

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) => line.length > 2,
    );

  const productNameLine = lines.find(
    (line) =>
      !isDeclarationLine(line),
  );

  if (productNameLine) {
    setFallbackField(
      product,
      "productName",
      productNameLine,
      productNameLine,
      source,
      0.82,
    );
  }

  /* ---------------------------------- MRP --------------------------------- */

  const mrpMatch = normalized.match(
    /(?:MRP|MAXIMUM\s+RETAIL\s+PRICE)\s*[:.]?\s*(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d{1,2})?)/i,
  );

  if (mrpMatch) {
    setFallbackField(
      product,
      "mrp",
      mrpMatch[1],
      mrpMatch[0],
      source,
      0.94,
    );
  }

  /* ---------------------------- Net quantity ----------------------------- */

  const quantityMatch = normalized.match(
    /(?:NET\s*(?:WT|WEIGHT|QTY|QUANTITY)?\.?\s*)?(\d+(?:\.\d+)?)\s*(kg|kgs|g|gm|gms|ml|l|ltr|litre|liter)\b/i,
  );

  if (quantityMatch) {
    const quantity =
      `${quantityMatch[1]}${quantityMatch[2]}`;

    setFallbackField(
      product,
      "netQuantity",
      quantity,
      quantityMatch[0],
      source,
      0.92,
    );
  }

  /* ---------------------------- Manufacturer ----------------------------- */

  const manufacturerMatch =
    normalized.match(
      /(?:MFG\.?\s*BY|MANUFACTURED\s*BY|MANUFACTURER)\s*[:.]?\s*(.{3,180}?)(?=\s+(?:CONSUMER|CUSTOMER|MRP|NET|BATCH|LOT|MFD|EXP|BEST\s+BEFORE|USE\s+BY)\b|$)/i,
    );

  if (manufacturerMatch) {
    setFallbackField(
      product,
      "manufacturer",
      manufacturerMatch[1].trim(),
      manufacturerMatch[0],
      source,
      0.9,
    );
  }

  /* -------------------------------- Packer -------------------------------- */

  const packerMatch = normalized.match(
    /(?:PACKED\s*BY|PACKER)\s*[:.]?\s*(.{3,180}?)(?=\s+(?:CONSUMER|CUSTOMER|MRP|NET|BATCH|LOT|MFG|MANUFACTURED|EXP|BEST\s+BEFORE)\b|$)/i,
  );

  if (packerMatch) {
    setFallbackField(
      product,
      "packer",
      packerMatch[1].trim(),
      packerMatch[0],
      source,
      0.88,
    );
  }

  /* ------------------------------- Importer -------------------------------- */

  const importerMatch =
    normalized.match(
      /(?:IMPORTED\s*BY|IMPORTER)\s*[:.]?\s*(.{3,180}?)(?=\s+(?:CONSUMER|CUSTOMER|MRP|NET|BATCH|LOT|MFG|MANUFACTURED|PACKED|EXP)\b|$)/i,
    );

  if (importerMatch) {
    setFallbackField(
      product,
      "importer",
      importerMatch[1].trim(),
      importerMatch[0],
      source,
      0.88,
    );
  }

  /* ---------------------------- Consumer care ---------------------------- */

  const consumerCareMatch =
    normalized.match(
      /(?:CONSUMER\s*CARE|CUSTOMER\s*CARE|HELPLINE|TOLL[- ]?FREE)\s*[:.]?\s*(.{3,120})/i,
    );

  if (consumerCareMatch) {
    setFallbackField(
      product,
      "consumerCare",
      consumerCareMatch[1].trim(),
      consumerCareMatch[0],
      source,
      0.9,
    );
  }

  /* -------------------------- Country of origin -------------------------- */

  const countryMatch = normalized.match(
    /(?:COUNTRY\s*OF\s*ORIGIN|MADE\s*IN)\s*[:.]?\s*([A-Za-z][A-Za-z .'-]{2,60})/i,
  );

  if (countryMatch) {
    setFallbackField(
      product,
      "countryOfOrigin",
      countryMatch[1].trim(),
      countryMatch[0],
      source,
      0.9,
    );
  }

  /* ------------------------------ Batch number --------------------------- */

  const batchMatch = normalized.match(
    /(?:BATCH\s*(?:NO|NUMBER)?|LOT\s*(?:NO|NUMBER)?)\s*[:.]?\s*([A-Za-z0-9./_-]{2,60})/i,
  );

  if (batchMatch) {
    setFallbackField(
      product,
      "batchNumber",
      batchMatch[1].trim(),
      batchMatch[0],
      source,
      0.88,
    );
  }

  /* ------------------------- Manufacturing date -------------------------- */

  const manufacturingDateMatch =
    normalized.match(
      /(?:MFG|MFD|MANUFACTURING|MANUFACTURED|PACKED|PACKING)\s*(?:DATE|DT)?\s*[:.]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}[/-]\d{2,4}|[A-Za-z]{3,12}\s+\d{4})/i,
    );

  if (manufacturingDateMatch) {
    setFallbackField(
      product,
      "manufacturingDate",
      manufacturingDateMatch[1].trim(),
      manufacturingDateMatch[0],
      source,
      0.86,
    );
  }

  /* ------------------------------- Expiry -------------------------------- */

  const expiryMatch = normalized.match(
    /(?:EXP|EXPIRY|EXPIRES|BEST\s*BEFORE|USE\s*BY)\s*[:.]?\s*([A-Za-z0-9 ./-]{2,50})/i,
  );

  if (expiryMatch) {
    setFallbackField(
      product,
      "expiryDate",
      expiryMatch[1].trim(),
      expiryMatch[0],
      source,
      0.84,
    );
  }

  /* -------------------------------- Brand --------------------------------- */

  const brandMatch = normalized.match(
    /(?:BRAND)\s*[:.]?\s*([A-Za-z0-9][A-Za-z0-9 &'.,-]{2,80})/i,
  );

  if (brandMatch) {
    setFallbackField(
      product,
      "brandName",
      brandMatch[1].trim(),
      brandMatch[0],
      source,
      0.86,
    );
  }

  return product;
}

/* -------------------------------------------------------------------------- */
/* Field helpers                                                              */
/* -------------------------------------------------------------------------- */

function setFallbackField(
  product: StructuredProductData,
  key: keyof ProductLabelData,
  value: string,
  rawValue: string,
  source: OCRSource,
  confidence: number,
) {
  const current = product[key];

  if (
    current &&
    typeof current.value === "string" &&
    current.value.trim()
  ) {
    return;
  }

  const field: ExtractedProductField = {
    value: value.trim(),
    rawValue: rawValue.trim(),
    confidence,
    sourceImageId: source.imageId,
    evidence: {
      imageId: source.imageId,
      imageType: source.imageType,
      regionId: null,
    },
  };

  product[key] = field;
}

function mergeProductFields(
  target: StructuredProductData,
  source: StructuredProductData,
) {
  for (const key of PRODUCT_FIELDS) {
    const sourceField = source[key];

    if (
      !sourceField ||
      !sourceField.value
    ) {
      continue;
    }

    const targetField = target[key];

    if (
      !targetField ||
      !targetField.value
    ) {
      target[key] = sourceField;
    }
  }
}

function createEmptyField(): ExtractedProductField {
  return {
    value: null,
    rawValue: null,
    confidence: null,
    sourceImageId: null,
    evidence: {
      imageId: null,
      imageType: null,
      regionId: null,
    },
  };
}

function createEmptyProduct(): StructuredProductData {
  return {
    productName: createEmptyField(),
    brandName: createEmptyField(),
    manufacturer: createEmptyField(),
    packer: createEmptyField(),
    importer: createEmptyField(),
    netQuantity: createEmptyField(),
    mrp: createEmptyField(),
    manufacturingDate: createEmptyField(),
    expiryDate: createEmptyField(),
    consumerCare: createEmptyField(),
    countryOfOrigin: createEmptyField(),
    batchNumber: createEmptyField(),
  };
}

function countDetectedFields(
  product: StructuredProductData,
): number {
  return PRODUCT_FIELDS.filter(
    (key) => {
      const field = product[key];

      return Boolean(
        field &&
          typeof field.value === "string" &&
          field.value.trim(),
      );
    },
  ).length;
}

function cleanValue(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const cleaned = value
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || null;
}

function normalizeSearchText(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(/[₹]/g, "rs")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(
    max,
    Math.max(min, value),
  );
}

function isDeclarationLine(
  line: string,
): boolean {
  return /^(?:mrp|maximum retail price|net|net wt|net weight|net qty|net quantity|mfg|mfd|manufactured|manufactured by|packed|packed by|packer|importer|imported by|consumer care|customer care|helpline|toll[- ]?free|batch|batch no|lot|expiry|exp|best before|use by|country of origin|made in|brand)\b/i.test(
    line,
  );
}