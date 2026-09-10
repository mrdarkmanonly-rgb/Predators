export type ScanMode = "guest" | "consumer" | "inspector";

export type ScanImageType =
  | "front"
  | "back"
  | "side"
  | "mrp"
  | "net-quantity"
  | "manufacturer"
  | "other";

export type ImageQualityStatus = "GOOD" | "NEEDS_REVIEW" | "POOR";

export type ScanStage =
  | "idle"
  | "uploading"
  | "quality-check"
  | "preprocessing"
  | "ocr"
  | "extraction"
  | "review"
  | "analysis"
  | "complete"
  | "error";

export type PreliminaryResult =
  | "COMPLIANT"
  | "NEEDS_REVIEW"
  | "INCOMPLETE";

export interface ScanImage {
  id: string;
  file: File;
  previewUrl: string;
  type: ScanImageType;
  quality: ImageQualityStatus;
  width: number | null;
  height: number | null;
  size: number;
  createdAt: number;
}

export interface ImageQualityResult {
  status: ImageQualityStatus;
  width: number;
  height: number;
  reasons: string[];
}

export interface ExtractedField<T = string> {
  value: T | null;
  rawValue: string | null;
  confidence: number | null;
  sourceImageId: string | null;
}

export interface ProductLabelData {
  productName: ExtractedField;
  brandName: ExtractedField;
  manufacturer: ExtractedField;
  packer: ExtractedField;
  importer: ExtractedField;
  netQuantity: ExtractedField;
  mrp: ExtractedField;
  manufacturingDate: ExtractedField;
  expiryDate: ExtractedField;
  consumerCare: ExtractedField;
  countryOfOrigin: ExtractedField;
  batchNumber: ExtractedField;
}

export interface ScanCheck {
  id: string;
  label: string;
  status: "PASS" | "FAIL" | "NEEDS_REVIEW" | "NOT_AVAILABLE";
  message: string;
  evidenceImageId: string | null;
}

export interface ScanAnalysis {
  scanId: string;
  mode: ScanMode;
  result: PreliminaryResult;
  score: number | null;
  providerStatus: "LIVE" | "MOCK_MODE" | "NOT_CONFIGURED";
  disclaimer: string;
  product: ProductLabelData;
  checks: ScanCheck[];
  warnings: string[];
}

export interface ScanProgress {
  stage: ScanStage;
  progress: number;
  message: string;
}
