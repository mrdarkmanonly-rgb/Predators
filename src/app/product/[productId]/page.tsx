/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  IndianRupee,
  Package,
  ScanLine,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import {
  getProductById,
  getProductScanHistory,
} from "@/actions/product/product.actions";

type PageProps = {
  params: Promise<{
    productId: string;
  }>;
};

function formatDate(
  value: string | Date | null | undefined,
) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function formatStatus(
  status: string | null | undefined,
) {
  if (!status) {
    return "UNKNOWN";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getStatusClasses(
  status: string | null | undefined,
) {
  switch (status) {
    case "COMPLIANT":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "POTENTIAL_VIOLATION":
      return "border-red-200 bg-red-50 text-red-700";

    case "NEEDS_REVIEW":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getStatusIcon(
  status: string | null | undefined,
) {
  if (status === "COMPLIANT") {
    return (
      <CheckCircle2 className="h-5 w-5" />
    );
  }

  if (
    status === "POTENTIAL_VIOLATION"
  ) {
    return (
      <TriangleAlert className="h-5 w-5" />
    );
  }

  return (
    <ClipboardCheck className="h-5 w-5" />
  );
}

function getComplianceData(
  analysisResult: any,
) {
  if (!analysisResult) {
    return {
      status: "NEEDS_REVIEW",
      score: null,
      passed: 0,
      failed: 0,
      notVerifiable: 0,
      total: 0,
    };
  }

  return {
    status:
      analysisResult.overall_status ??
      "NEEDS_REVIEW",

    score:
      analysisResult.compliance_score ??
      null,

    passed:
      analysisResult.summary?.passed ??
      0,

    failed:
      analysisResult.summary?.failed ??
      0,

    notVerifiable:
      analysisResult.summary
        ?.not_verifiable ?? 0,

    total:
      analysisResult.summary
        ?.total_rules ?? 0,
  };
}

export default async function ProductPage({
  params,
}: PageProps) {
  const { productId } =
    await params;

  const productResult =
    await getProductById(
      productId,
    );

  if (
    !productResult.success ||
    !productResult.product
  ) {
    return (
      <main className="min-h-screen bg-[#F7FAFC] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <TriangleAlert className="mx-auto mb-4 h-10 w-10 text-red-500" />

            <h1 className="text-2xl font-bold text-slate-900">
              Product not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {productResult.message ??
                "We could not find this product."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const product =
    productResult.product;

  const historyResult =
    await getProductScanHistory(
      productId,
    );

  const scans =
    historyResult.success &&
    historyResult.scans
      ? historyResult.scans
      : [];

  const latestScan =
    scans.length > 0
      ? scans[0]
      : null;

  const compliance =
    getComplianceData(
      latestScan?.analysisResult,
    );

  const extractedData =
    product.extractedData &&
    typeof product.extractedData ===
      "object"
      ? product.extractedData
      : {};

  const nutrition =
    (extractedData as any)
      ?.nutrition ?? null;

  return (
    <main className="min-h-screen bg-[#F7FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-white via-emerald-50/70 to-slate-50 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  Product Compliance Profile
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {product.productName ??
                    "Unnamed Product"}
                </h1>

                {product.brandName && (
                  <p className="mt-2 text-lg text-slate-600">
                    {product.brandName}
                  </p>
                )}
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${getStatusClasses(
                  compliance.status,
                )}`}
              >
                {getStatusIcon(
                  compliance.status,
                )}

                {formatStatus(
                  compliance.status,
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-slate-500">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Compliance Score
                </span>
              </div>

              <p className="text-3xl font-bold text-slate-900">
                {compliance.score !==
                null
                  ? `${compliance.score}%`
                  : "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-slate-500">
                <ScanLine className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Total Scans
                </span>
              </div>

              <p className="text-3xl font-bold text-slate-900">
                {scans.length}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Rules Passed
                </span>
              </div>

              <p className="text-3xl font-bold text-emerald-700">
                {compliance.passed}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-amber-600">
                <TriangleAlert className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Needs Review
                </span>
              </div>

              <p className="text-3xl font-bold text-amber-700">
                {compliance.notVerifiable}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Product Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Information identified from
                the product label.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                icon={
                  <Package className="h-5 w-5" />
                }
                label="Product Name"
                value={
                  product.productName
                }
              />

              <InfoItem
                icon={
                  <Package className="h-5 w-5" />
                }
                label="Brand"
                value={
                  product.brandName
                }
              />

              <InfoItem
                icon={
                  <IndianRupee className="h-5 w-5" />
                }
                label="MRP"
                value={
                  product.mrp
                    ? `₹${product.mrp}`
                    : null
                }
              />

              <InfoItem
                icon={
                  <Package className="h-5 w-5" />
                }
                label="Net Quantity"
                value={
                  product.netQuantityValue
                    ? `${product.netQuantityValue} ${
                        product.netQuantityUnit ??
                        ""
                      }`
                    : null
                }
              />

              <InfoItem
                icon={
                  <Factory className="h-5 w-5" />
                }
                label="Manufacturer"
                value={
                  product.manufacturer
                }
              />

              <InfoItem
                icon={
                  <Factory className="h-5 w-5" />
                }
                label="Packer"
                value={
                  product.packer
                }
              />

              <InfoItem
                icon={
                  <Factory className="h-5 w-5" />
                }
                label="Importer"
                value={
                  product.importer
                }
              />

              <InfoItem
                icon={
                  <Package className="h-5 w-5" />
                }
                label="Country of Origin"
                value={
                  product.countryOfOrigin
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Important Dates
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manufacturing and shelf-life
                information.
              </p>
            </div>

            <div className="space-y-4">
              <DateItem
                label="Manufacturing Date"
                value={formatDate(
                  product.manufacturingDate,
                )}
              />

              <DateItem
                label="Packing Date"
                value={formatDate(
                  product.packingDate,
                )}
              />

              <DateItem
                label="Best Before"
                value={
                  product.bestBefore ??
                  "Not available"
                }
              />

              <DateItem
                label="Use By"
                value={
                  product.useBy ??
                  "Not available"
                }
              />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Compliance Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest available compliance
              screening for this product.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ComplianceCard
              label="Overall Status"
              value={formatStatus(
                compliance.status,
              )}
              className={getStatusClasses(
                compliance.status,
              )}
            />

            <ComplianceCard
              label="Passed"
              value={String(
                compliance.passed,
              )}
              className="border-emerald-200 bg-emerald-50 text-emerald-700"
            />

            <ComplianceCard
              label="Potential Violations"
              value={String(
                compliance.failed,
              )}
              className="border-red-200 bg-red-50 text-red-700"
            />

            <ComplianceCard
              label="Not Verifiable"
              value={String(
                compliance.notVerifiable,
              )}
              className="border-amber-200 bg-amber-50 text-amber-700"
            />
          </div>

          {latestScan?.analysisResult
            ?.disclaimer && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {latestScan
                .analysisResult
                .disclaimer}
            </div>
          )}
        </section>

        {(product.consumerCareDetails ||
          nutrition) && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {product.consumerCareDetails && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-bold text-slate-900">
                  Consumer Care
                </h2>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {
                    product.consumerCareDetails
                  }
                </p>
              </section>
            )}

            {nutrition && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-bold text-slate-900">
                  Nutrition Information
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {Object.entries(
                    nutrition,
                  ).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {key.replaceAll(
                            "_",
                            " ",
                          )}
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {String(
                            value,
                          )}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Scan History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Previous scans associated with
                this product.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <ScanLine className="h-4 w-4" />
              {scans.length} scan
              {scans.length === 1
                ? ""
                : "s"}
            </div>
          </div>

          {scans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <ScanLine className="mx-auto mb-3 h-8 w-8 text-slate-400" />

              <p className="font-semibold text-slate-700">
                No scan history found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Scan activity for this
                product will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {scans.map(
                (
                  scan: any,
                  index: number,
                ) => {
                  const scanCompliance =
                    getComplianceData(
                      scan.analysisResult,
                    );

                  return (
                    <div
                      key={scan.id}
                      className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <ScanLine className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-bold text-slate-900">
                              Scan #
                              {scans.length -
                                index}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" />
                                {formatDate(
                                  scan.createdAt,
                                )}
                              </span>

                              {scan.ocrEngine && (
                                <>
                                  <span>
                                    •
                                  </span>

                                  <span>
                                    {
                                      scan.ocrEngine
                                    }
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {scanCompliance.score !==
                            null && (
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                              {
                                scanCompliance.score
                              }
                              %
                            </span>
                          )}

                          <span
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                              scanCompliance.status,
                            )}`}
                          >
                            {formatStatus(
                              scanCompliance.status,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <div>
              <h3 className="font-bold text-amber-900">
                Compliance Screening Notice
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                Product compliance results are
                AI-assisted screening results.
                They do not constitute a final
                legal determination.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="break-words font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}

function DateItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <CalendarDays className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ComplianceCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}