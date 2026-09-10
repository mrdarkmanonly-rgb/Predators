import type { ScanImageType } from "@/lib/scanning/types";

export type OCRProviderStatus =
  | "LIVE"
  | "MOCK_MODE"
  | "NOT_CONFIGURED"
  | "ERROR";

export interface OCRRegion {
  id: string;

  text: string;

  confidence: number | null;

  /**
   * Normalized coordinates within the source image.
   * Values are between 0 and 1 when available.
   */
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export interface OCRImageResult {
  imageId: string;

  imageType: ScanImageType;

  status: OCRProviderStatus;

  text: string | null;

  confidence: number | null;

  regions: OCRRegion[];

  warnings: string[];
}

export interface OCRScanResult {
  provider: string;

  status: OCRProviderStatus;

  images: OCRImageResult[];

  warnings: string[];
}