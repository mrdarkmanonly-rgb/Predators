import type {
  ExtractedField,
  ProductLabelData,
  ScanCheck,
  PreliminaryResult,
} from "./types";

export interface PreliminaryComplianceResult {
  score: number | null;
  result: PreliminaryResult;
  checks: ScanCheck[];
  warnings: string[];
}

const REQUIRED_FIELDS: Array<{
  key: keyof ProductLabelData;
  label: string;
}> = [
  {
    key: "productName",
    label: "Product name",
  },
  {
    key: "netQuantity",
    label: "Net quantity",
  },
  {
    key: "mrp",
    label: "Maximum Retail Price (MRP)",
  },
  {
    key: "manufacturer",
    label: "Manufacturer / packer",
  },
  {
    key: "consumerCare",
    label: "Consumer care information",
  },
];

const ADDITIONAL_FIELDS: Array<{
  key: keyof ProductLabelData;
  label: string;
}> = [
  {
    key: "brandName",
    label: "Brand name",
  },
  {
    key: "importer",
    label: "Importer",
  },
  {
    key: "manufacturingDate",
    label: "Manufacturing / packing date",
  },
  {
    key: "expiryDate",
    label: "Expiry / use-by date",
  },
  {
    key: "countryOfOrigin",
    label: "Country of origin",
  },
  {
    key: "batchNumber",
    label: "Batch / lot number",
  },
];

export function analyzePreliminaryCompliance(
  product: ProductLabelData,
): PreliminaryComplianceResult {
  const checks: ScanCheck[] = [];
  const warnings: string[] = [];

  let earnedWeight = 0;
  let totalWeight = 0;

  for (const field of REQUIRED_FIELDS) {
    const extracted = product[field.key];

    totalWeight += 15;

    const check = createFieldCheck(
      field.key,
      field.label,
      extracted,
      15,
    );

    checks.push(check);

    if (check.status === "PASS") {
      earnedWeight += 15;
    } else if (check.status === "NEEDS_REVIEW") {
      earnedWeight += 7.5;
    }
  }

  for (const field of ADDITIONAL_FIELDS) {
    const extracted = product[field.key];

    totalWeight += 5;

    const check = createFieldCheck(
      field.key,
      field.label,
      extracted,
      5,
    );

    checks.push(check);

    if (check.status === "PASS") {
      earnedWeight += 5;
    } else if (check.status === "NEEDS_REVIEW") {
      earnedWeight += 2.5;
    }
  }

  const score = Math.round((earnedWeight / totalWeight) * 100);

  const requiredChecks = checks.slice(0, REQUIRED_FIELDS.length);

  const missingRequired = requiredChecks.filter(
    (check) => check.status === "NOT_AVAILABLE",
  );

  const reviewRequired = checks.filter(
    (check) => check.status === "NEEDS_REVIEW",
  );

  let result: PreliminaryResult;

  if (missingRequired.length >= 2) {
    result = "INCOMPLETE";
    warnings.push(
      "Multiple required label fields could not be extracted. More evidence is recommended.",
    );
  } else if (missingRequired.length > 0 || reviewRequired.length > 0) {
    result = "NEEDS_REVIEW";
    warnings.push(
      "Some label evidence is missing or has limited confidence. Manual verification is recommended.",
    );
  } else {
    result = "COMPLIANT";
  }

  warnings.push(
    "This is a preliminary evidence assessment, not a legal compliance determination.",
  );

  return {
    score,
    result,
    checks,
    warnings,
  };
}

function createFieldCheck(
  key: keyof ProductLabelData,
  label: string,
  field: ExtractedField | undefined,
  weight: number,
): ScanCheck {
  if (!field || !field.value) {
    return {
      id: `field-${String(key)}`,
      label,
      status: "NOT_AVAILABLE",
      message: `${label} could not be reliably extracted from the available images.`,
      evidenceImageId: null,
    };
  }

  const confidence = field.confidence;

  if (confidence !== null && confidence < 0.6) {
    return {
      id: `field-${String(key)}`,
      label,
      status: "NEEDS_REVIEW",
      message: `${label} was detected, but the extraction confidence is low (${formatConfidence(
        confidence,
      )}).`,
      evidenceImageId: field.sourceImageId,
    };
  }

  if (confidence !== null && confidence < 0.8) {
    return {
      id: `field-${String(key)}`,
      label,
      status: "NEEDS_REVIEW",
      message: `${label} was detected but should be manually verified (${formatConfidence(
        confidence,
      )} confidence).`,
      evidenceImageId: field.sourceImageId,
    };
  }

  return {
    id: `field-${String(key)}`,
    label,
    status: "PASS",
    message: `${label} was detected in the available evidence.`,
    evidenceImageId: field.sourceImageId,
  };
}

function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`;
}