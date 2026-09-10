"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ExtractedField = {
  value: string | null;
  rawValue: string | null;
  confidence: number | null;
  sourceImageId: string | null;
};

type ProductLabelData = {
  productName?: ExtractedField;
  brandName?: ExtractedField;
  batchNumber?: ExtractedField;
  commonGenericName?: ExtractedField;
  manufacturerName?: ExtractedField;
  manufacturerAddress?: ExtractedField;
  packerName?: ExtractedField;
  packerAddress?: ExtractedField;
  importerName?: ExtractedField;
  importerAddress?: ExtractedField;
  countryOfOrigin?: ExtractedField;
  netQuantity?: ExtractedField;
  manufacturingPackingImportDate?: ExtractedField;
  mrp?: ExtractedField;
  unitSalePrice?: ExtractedField;
  consumerCareName?: ExtractedField;
  consumerCareAddress?: ExtractedField;
  consumerCarePhone?: ExtractedField;
  consumerCareEmail?: ExtractedField;
  bestBefore?: ExtractedField;
  useBy?: ExtractedField;
  dimensions?: ExtractedField;
};

type ScanCheck = {
  id: string;
  label: string;
  status: string;
  message: string;
  evidenceImageId: string | null;
};

type Evidence = {
  id: string;
  storageKey: string;
  originalFileName: string | null;
  mimeType: string;
  sizeBytes: number;
  imageType: string | null;
  createdAt: string;
};

type Report = {
  id: string;
  reportNumber: string;
  issueType: string;
  description: string;
  status: string;
  shopName: string;
  shopkeeperName: string | null;
  shopAddress: string | null;
  shopCity: string | null;
  shopState: string | null;
  shopPinCode: string | null;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  productSnapshot: ProductLabelData | null;
  analysisSnapshot: {
    result?: string;
    providerStatus?: string;
    disclaimer?: string;
    product?: ProductLabelData;
    checks?: ScanCheck[];
    warnings?: string[];
  } | null;
  evidence: Evidence[];
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  success: boolean;
  report?: Report;
  message?: string;
};

const statusClass: Record<string, string> = {
  PASS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAIL: "bg-red-50 text-red-700 border-red-200",
  NEEDS_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  NOT_AVAILABLE: "bg-gray-50 text-gray-600 border-gray-200",
  CONDITIONAL: "bg-blue-50 text-blue-700 border-blue-200",
};

function displayValue(field?: ExtractedField | null) {
  return field?.value || field?.rawValue || "Not detected";
}

function confidenceLabel(confidence: number | null | undefined) {
  if (confidence === null || confidence === undefined) {
    return null;
  }

  return `${Math.round(confidence * 100)}% confidence`;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value || "Not detected"}
      </p>
    </div>
  );
}

function InspectorTakeActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reportId = searchParams.get("reportId");
  const scanId = searchParams.get("scanId");

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const analysis = report?.analysisSnapshot;
  const product = report?.productSnapshot || analysis?.product;

  const checks = useMemo(
    () => analysis?.checks ?? [],
    [analysis?.checks],
  );

  useEffect(() => {
    if (!reportId) {
      setError("Report ID is missing.");
      setLoading(false);
      return;
    }

    const loadReport = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/inspector/reports/${encodeURIComponent(reportId)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data: ApiResponse = await response.json().catch(() => ({
          success: false,
          message: "Invalid server response.",
        }));

        if (!response.ok || !data.success || !data.report) {
          throw new Error(
            data.message || "Unable to load inspector report.",
          );
        }

        setReport(data.report);
      } catch (err) {
        console.error("INSPECTOR REPORT LOAD ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this report.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [reportId]);

  const handleAction = async (
    action: "ACCEPT" | "REJECT" | "NEEDS_REVIEW",
  ) => {
    if (!reportId || actionLoading) {
      return;
    }

    setActionLoading(true);

    try {
      /*
       * The action API will be connected to the inspector workflow.
       * For now this keeps the UI ready without pretending that
       * an enforcement action has already been recorded.
       */
      console.log("Inspector action:", {
        action,
        reportId,
        scanId,
      });

      alert(
        action === "ACCEPT"
          ? "Report marked for inspection action."
          : action === "REJECT"
            ? "Report rejected."
            : "Report sent for further review.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <div className="h-6 w-56 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 h-32 animate-pulse rounded-xl bg-gray-100" />
            <div className="mt-4 h-32 animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
              !
            </div>

            <h1 className="mt-4 text-xl font-bold text-gray-900">
              Unable to load report
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {error || "This inspector report could not be found."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/inspector")}
              className="mt-6 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Back to Inspector Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/inspector")}
            className="mb-4 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Inspector Dashboard
          </button>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Inspector Action
                </span>

                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                  {report.status}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
                Take Action on Report
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Report ID:{" "}
                <span className="font-semibold text-gray-700">
                  {report.reportNumber}
                </span>
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Submitted
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700">
                {formatDate(report.createdAt)}
              </p>
            </div>
          </div>
        </header>

        {/* Important disclaimer */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <div className="mt-0.5 text-amber-600">⚠</div>

            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Inspector Review Required
              </h2>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                OCR and AI analysis provide evidence and preliminary
                checks only. They do not establish a final legal
                violation. Any enforcement decision must be made by
                the authorized inspector using the applicable Legal
                Metrology rules and physical verification where
                required.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Shop details */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Shop / Business Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Details provided with the citizen report.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Shop / Store Name"
                  value={report.shopName}
                />

                <Field
                  label="Shopkeeper / Business Name"
                  value={report.shopkeeperName}
                />

                <Field
                  label="Address"
                  value={report.shopAddress}
                />

                <Field
                  label="City"
                  value={report.shopCity}
                />

                <Field
                  label="State"
                  value={report.shopState}
                />

                <Field
                  label="PIN Code"
                  value={report.shopPinCode}
                />
              </div>

              {(report.latitude !== null ||
                report.longitude !== null) && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    GPS Location
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {report.latitude?.toFixed(6)},{" "}
                    {report.longitude?.toFixed(6)}
                  </p>

                  {report.locationAccuracy !== null && (
                    <p className="mt-1 text-xs text-gray-500">
                      Accuracy: approximately{" "}
                      {Math.round(report.locationAccuracy)} m
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Reported issue */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Reported Issue
              </h2>

              <div className="mt-5">
                <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  {report.issueType.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Citizen Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                  {report.description}
                </p>
              </div>
            </section>

            {/* Product information */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Product Label Analysis
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Information extracted from the submitted product
                  images.
                </p>
              </div>

              {product ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Product Name"
                    value={displayValue(product.productName)}
                  />

                  <Field
                    label="Brand"
                    value={displayValue(product.brandName)}
                  />

                  <Field
                    label="Common / Generic Name"
                    value={displayValue(
                      product.commonGenericName,
                    )}
                  />

                  <Field
                    label="Batch Number"
                    value={displayValue(product.batchNumber)}
                  />

                  <Field
                    label="Net Quantity"
                    value={displayValue(product.netQuantity)}
                  />

                  <Field
                    label="MRP"
                    value={displayValue(product.mrp)}
                  />

                  <Field
                    label="Unit Sale Price"
                    value={displayValue(product.unitSalePrice)}
                  />

                  <Field
                    label="Manufacturing / Packing / Import Date"
                    value={displayValue(
                      product.manufacturingPackingImportDate,
                    )}
                  />

                  <Field
                    label="Manufacturer"
                    value={displayValue(
                      product.manufacturerName,
                    )}
                  />

                  <Field
                    label="Manufacturer Address"
                    value={displayValue(
                      product.manufacturerAddress,
                    )}
                  />

                  <Field
                    label="Packer"
                    value={displayValue(product.packerName)}
                  />

                  <Field
                    label="Packer Address"
                    value={displayValue(product.packerAddress)}
                  />

                  <Field
                    label="Importer"
                    value={displayValue(product.importerName)}
                  />

                  <Field
                    label="Importer Address"
                    value={displayValue(
                      product.importerAddress,
                    )}
                  />

                  <Field
                    label="Country of Origin"
                    value={displayValue(
                      product.countryOfOrigin,
                    )}
                  />

                  <Field
                    label="Consumer Care Name"
                    value={displayValue(
                      product.consumerCareName,
                    )}
                  />

                  <Field
                    label="Consumer Care Address"
                    value={displayValue(
                      product.consumerCareAddress,
                    )}
                  />

                  <Field
                    label="Consumer Care Phone"
                    value={displayValue(
                      product.consumerCarePhone,
                    )}
                  />

                  <Field
                    label="Consumer Care Email"
                    value={displayValue(
                      product.consumerCareEmail,
                    )}
                  />

                  <Field
                    label="Best Before"
                    value={displayValue(product.bestBefore)}
                  />

                  <Field
                    label="Use By"
                    value={displayValue(product.useBy)}
                  />

                  <Field
                    label="Dimensions"
                    value={displayValue(product.dimensions)}
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-600">
                  No structured product information is available.
                </div>
              )}
            </section>

            {/* Preliminary checks */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Preliminary Compliance Checks
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    AI/OCR evidence checks — not a final legal
                    determination.
                  </p>
                </div>

                {analysis?.result && (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      analysis.result === "COMPLIANT"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : analysis.result === "INCOMPLETE"
                          ? "border-gray-200 bg-gray-50 text-gray-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {analysis.result.replaceAll("_", " ")}
                  </span>
                )}
              </div>

              {checks.length > 0 ? (
                <div className="space-y-3">
                  {checks.map((check) => (
                    <div
                      key={check.id}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">
                            {check.label}
                          </h3>

                          <p className="mt-1 text-sm leading-5 text-gray-600">
                            {check.message}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${
                            statusClass[check.status] ||
                            "border-gray-200 bg-gray-50 text-gray-600"
                          }`}
                        >
                          {check.status.replaceAll("_", " ")}
                        </span>
                      </div>

                      {check.evidenceImageId && (
                        <p className="mt-3 text-xs text-gray-400">
                          Evidence image:{" "}
                          {check.evidenceImageId}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-600">
                  No preliminary checks are available.
                </div>
              )}

              {analysis?.warnings &&
                analysis.warnings.length > 0 && (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-bold text-amber-900">
                      Analysis Warnings
                    </p>

                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                      {analysis.warnings.map((warning, index) => (
                        <li key={`${warning}-${index}`}>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </section>

            {/* Evidence */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Submitted Evidence
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {report.evidence.length} image
                  {report.evidence.length === 1 ? "" : "s"} attached
                  to this report.
                </p>
              </div>

              {report.evidence.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {report.evidence.map((evidence, index) => (
                    <div
                      key={evidence.id}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                    >
                      <a
                        href={evidence.storageKey}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <img
                          src={evidence.storageKey}
                          alt={
                            evidence.originalFileName ||
                            `Report evidence ${index + 1}`
                          }
                          className="h-64 w-full object-contain bg-gray-100"
                        />
                      </a>

                      <div className="border-t border-gray-200 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {evidence.imageType ||
                            `Evidence ${index + 1}`}
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-gray-800">
                          {evidence.originalFileName ||
                            "Evidence image"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-600">
                  No evidence images are attached to this report.
                </div>
              )}
            </section>
          </div>

          {/* Action sidebar */}
          <aside className="space-y-6">
            <section className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Inspector Decision
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Review the evidence and preliminary analysis before
                deciding the next step.
              </p>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("ACCEPT")}
                  className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Proceed With Inspection
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("NEEDS_REVIEW")}
                  className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Needs Further Review
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("REJECT")}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject Report
                </button>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-5">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Report</dt>
                    <dd className="font-semibold text-gray-900">
                      {report.reportNumber}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Status</dt>
                    <dd className="font-semibold text-gray-900">
                      {report.status}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Evidence</dt>
                    <dd className="font-semibold text-gray-900">
                      {report.evidence.length}
                    </dd>
                  </div>

                  {scanId && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Scan</dt>
                      <dd className="max-w-[150px] truncate font-semibold text-gray-900">
                        {scanId}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </section>

            {/* AI provider information */}
            {analysis?.providerStatus && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900">
                  Analysis Source
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  {analysis.providerStatus === "MOCK_MODE"
                    ? "Mock extraction mode was used."
                    : analysis.providerStatus ===
                        "NOT_CONFIGURED"
                      ? "AI provider is not configured."
                      : "Live OCR/AI analysis was used."}
                </p>
              </section>
            )}

            {/* Disclaimer */}
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs leading-5 text-gray-500">
                {analysis?.disclaimer ||
                  "This report contains evidence-detection results. It is not by itself a verified violation or final legal determination."}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function InspectorTakeActionPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-4 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="h-6 w-56 animate-pulse rounded bg-gray-200" />
              <div className="mt-6 h-32 animate-pulse rounded-xl bg-gray-100" />
              <div className="mt-4 h-32 animate-pulse rounded-xl bg-gray-100" />
            </div>
          </div>
        </main>
      }
    >
      <InspectorTakeActionContent />
    </Suspense>
  );
}
