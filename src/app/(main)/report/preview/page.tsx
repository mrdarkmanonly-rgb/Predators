"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Flag,
  Loader2,
  MapPin,
  Package,
  ScanLine,
} from "lucide-react";
import { getScanById } from "@/actions/product/product.actions";

type IssueEntry = {
  issueType: string;
  description: string;
};

type ScanData = {
  id: string;
  status: string;
  productId?: string | null;
  product?: {
    id: string;
    productName?: string | null;
    brandName?: string | null;
    category?: string | null;
    manufacturer?: string | null;
  } | null;
  images?: {
    id: string;
    imageType: string;
    secureUrl: string;
  }[];
};

export default function ReportPreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const scanId = searchParams.get("scanId");
  const productId = searchParams.get("productId");
  const issuesParam = searchParams.get("issues") ?? "[]";

  const shopName = searchParams.get("shopName") ?? "";
  const shopAddress = searchParams.get("shopAddress") ?? "";
  const city = searchParams.get("city") ?? "";
  const state = searchParams.get("state") ?? "";
  const pincode = searchParams.get("pincode") ?? "";

  const locationText = searchParams.get("locationText") ?? "";
  const latitude = searchParams.get("latitude") ?? "";
  const longitude = searchParams.get("longitude") ?? "";

  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const issues: IssueEntry[] = (() => {
    try {
      const parsed = JSON.parse(issuesParam);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (issue): issue is IssueEntry =>
          !!issue &&
          typeof issue.issueType === "string" &&
          typeof issue.description === "string",
      );
    } catch {
      return [];
    }
  })();

  useEffect(() => {
    async function loadScan() {
      if (!scanId) {
        setError("Scan information is missing.");
        setLoading(false);
        return;
      }

      try {
        const result = await getScanById(scanId);

        if (!result.success || !result.scan) {
          setError(result.message ?? "Unable to load scan.");
          setLoading(false);
          return;
        }

        setScan(result.scan as ScanData);
      } catch (error) {
        console.error("REPORT PREVIEW LOAD ERROR:", error);
        setError("Unable to load scan information.");
      } finally {
        setLoading(false);
      }
    }

    loadScan();
  }, [scanId]);

  const handleEdit = () => {
    const params = new URLSearchParams();

    if (scanId) {
      params.set("scanId", scanId);
    }

    if (productId) {
      params.set("productId", productId);
    }

    router.push(`/report?${params.toString()}`);
  };

  const handleSubmit = () => {
    if (!scanId) {
      setError("Scan information is missing.");
      return;
    }

    if (issues.length === 0) {
      setError("No report issues were provided.");
      return;
    }

    if (!shopName.trim()) {
      setError("Shop name is missing.");
      return;
    }

    if (!shopAddress.trim()) {
      setError("Shop address is missing.");
      return;
    }

    if (!city.trim()) {
      setError("City is missing.");
      return;
    }

    if (!state.trim()) {
      setError("State is missing.");
      return;
    }

    if (!pincode.trim()) {
      setError("Pincode is missing.");
      return;
    }

    const params = new URLSearchParams();

    params.set("scanId", scanId);

    if (productId) {
      params.set("productId", productId);
    }

    params.set("issues", JSON.stringify(issues));
    params.set("shopName", shopName);
    params.set("shopAddress", shopAddress);
    params.set("city", city);
    params.set("state", state);
    params.set("pincode", pincode);
    params.set("locationText", locationText);

    if (latitude) {
      params.set("latitude", latitude);
    }

    if (longitude) {
      params.set("longitude", longitude);
    }

    router.push(`/report/submit?${params.toString()}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7FAFC] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />

            <span className="text-sm font-semibold text-slate-700">
              Preparing report preview...
            </span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !scan) {
    return (
      <main className="min-h-screen bg-[#F7FAFC] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />

            <h1 className="mt-4 text-2xl font-black text-slate-900">
              Unable to load preview
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error || "Scan information is unavailable."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/scan")}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Back to Scanner
            </button>
          </div>
        </div>
      </main>
    );
  }

  const product = scan.product;

  return (
    <main className="min-h-screen bg-[#F7FAFC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            type="button"
            onClick={handleEdit}
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </button>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Flag className="h-3.5 w-3.5" />
              Review Before Submission
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Report Preview
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Check all information before submitting your report.
            </p>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Package className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Product & Scan
                  </h2>

                  <p className="text-sm text-slate-500">
                    Product connected to this report
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Product
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {product?.productName ||
                      product?.brandName ||
                      "Product information unavailable"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Brand
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {product?.brandName || "Not available"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Scan ID
                  </p>

                  <p className="mt-2 break-all font-mono text-xs font-semibold text-slate-700">
                    {scan.id}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Flag className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Report Details
                    </h2>

                    <p className="text-sm text-slate-500">
                      Information you entered
                    </p>
                  </div>
                </div>

                <div className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                  {issues.length}{" "}
                  {issues.length === 1 ? "Issue" : "Issues"}
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {issues.length > 0 ? (
                  issues.map((issue, index) => (
                    <motion.div
                      key={`${issue.issueType}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-xs font-black text-red-600">
                          {index + 1}
                        </span>

                        <p className="text-sm font-black text-slate-900">
                          Issue {index + 1}
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Issue Type
                        </p>

                        <div className="mt-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                          <p className="text-sm font-bold text-red-700">
                            {issue.issueType}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Description
                        </p>

                        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4">
                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {issue.description ||
                              "No description provided."}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-700">
                      No issues were provided.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Shop & Location
                  </h2>

                  <p className="text-sm text-slate-500">
                    Location information attached to this report
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Shop Name
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {shopName || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Shop Address
                  </p>

                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                    {shopAddress || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    City
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {city || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    State
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {state || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pincode
                  </p>

                  <p className="mt-2 font-mono text-sm font-semibold text-slate-800">
                    {pincode || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Location
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {locationText || "Shop location"}
                  </p>
                </div>
              </div>

              {(latitude || longitude) && (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />

                    <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                      GPS Coordinates
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-blue-100 bg-white p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Latitude
                      </p>

                      <p className="mt-1 font-mono text-xs font-semibold text-slate-700">
                        {latitude || "Not available"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-white p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Longitude
                      </p>

                      <p className="mt-1 font-mono text-xs font-semibold text-slate-700">
                        {longitude || "Not available"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <ScanLine className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Evidence
                  </h2>

                  <p className="text-sm text-slate-500">
                    Existing scan images will be used as evidence
                  </p>
                </div>
              </div>

              {scan.images && scan.images.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {scan.images.map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      <div className="aspect-video bg-slate-100">
                        <img
                          src={image.secureUrl}
                          alt="Report evidence"
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {image.imageType}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-700">
                    No scan images were found for this report.
                  </p>
                </div>
              )}
            </section>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                <div>
                  <p className="text-sm font-bold text-emerald-900">
                    Ready to submit
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                    Please make sure the information above is correct.
                    Your shop details, GPS coordinates and existing scan
                    images will be attached to this report.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Submit Report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}