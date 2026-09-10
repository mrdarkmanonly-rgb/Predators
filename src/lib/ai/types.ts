import type {
  ExtractedField,
  ProductLabelData,
  ScanImage,
} from "@/lib/scanning/types";
import type { OCRScanResult } from "@/lib/ocr/types";

export type AIProviderStatus =
  | "LIVE"
  | "MOCK_MODE"
  | "NOT_CONFIGURED"
  | "ERROR";

export interface ExtractionEvidence {
  imageId: string | null;

  imageType: ScanImage["type"] | null;

  /**
   * Optional OCR region identifier that supports this field.
   */
  regionId: string | null;
}

export interface ExtractedProductField
  extends ExtractedField {
  evidence?: ExtractionEvidence;
}

export interface StructuredProductData
  extends Omit<
    ProductLabelData,
    | "productName"
    | "brandName"
    | "manufacturer"
    | "packer"
    | "importer"
    | "netQuantity"
    | "mrp"
    | "manufacturingDate"
    | "expiryDate"
    | "consumerCare"
    | "countryOfOrigin"
    | "batchNumber"
  > {
  productName: ExtractedProductField;
  brandName: ExtractedProductField;
  manufacturer: ExtractedProductField;
  packer: ExtractedProductField;
  importer: ExtractedProductField;
  netQuantity: ExtractedProductField;
  mrp: ExtractedProductField;
  manufacturingDate: ExtractedProductField;
  expiryDate: ExtractedProductField;
  consumerCare: ExtractedProductField;
  countryOfOrigin: ExtractedProductField;
  batchNumber: ExtractedProductField;
}

export interface AIExtractionResult {
  provider: string;

  status: AIProviderStatus;

  product: StructuredProductData;

  warnings: string[];

  sourceOCRStatus: OCRScanResult["status"];
}