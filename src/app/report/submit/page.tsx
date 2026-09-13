"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Store,
} from "lucide-react";
import { createCitizenReport } from "@/actions/report/report.actions";

type IssueEntry = {
  issueType: string;
  description: string;
};

export default function ReportSubmitPage() {
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
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  const [submitting, setSubmitting] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [reportCode, setReportCode] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function submitReport() {
      if (!scanId) {
        setError("Scan information is missing.");
        setSubmitting(false);
        return;
      }

      if (!locationText.trim()) {
        setError("Location information is missing.");
        setSubmitting(false);
        return;
      }

      let issues: IssueEntry[] = [];

      try {
        const parsed = JSON.parse(issuesParam);

        if (!Array.isArray(parsed)) {
          setError("Invalid report issue data.");
          setSubmitting(false);
          return;
        }

        issues = parsed.filter(
          (issue): issue is IssueEntry =>
            !!issue &&
            typeof issue.issueType === "string" &&
            typeof issue.description === "string" &&
            issue.issueType.trim().length > 0 &&
            issue.description.trim().length > 0,
        );
      } catch {
        setError("Invalid report issue data.");
        setSubmitting(false);
        return;
      }

      if (issues.length === 0) {
        setError("At least one valid issue is required.");
        setSubmitting(false);
        return;
      }

      if (!shopName.trim()) {
        setError("Shop name is missing.");
        setSubmitting(false);
        return;
      }

      if (!shopAddress.trim()) {
        setError("Shop address is missing.");
        setSubmitting(false);
        return;
      }

      if (!city.trim()) {
        setError("City is missing.");
        setSubmitting(false);
        return;
      }

      if (!state.trim()) {
        setError("State is missing.");
        setSubmitting(false);
        return;
      }

      if (!/^\d{6}$/.test(pincode.trim())) {
        setError("Invalid 6-digit pincode.");
        setSubmitting(false);
        return;
      }

      const latitudeValue =
        latitude && latitude.trim()
          ? Number(latitude)
          : null;

      const longitudeValue =
        longitude && longitude.trim()
          ? Number(longitude)
          : null;

      if (
        (latitudeValue !== null &&
          Number.isNaN(latitudeValue)) ||
        (longitudeValue !== null &&
          Number.isNaN(longitudeValue))
      ) {
        setError("Invalid location coordinates.");
        setSubmitting(false);
        return;
      }

      const combinedIssueType = issues
        .map((issue) => issue.issueType.trim())
        .join(", ");

      const combinedDescription = issues
        .map(
          (issue, index) =>
            `Issue ${index + 1}: ${issue.issueType.trim()}\n${issue.description.trim()}`,
        )
        .join("\n\n");

      try {
        const result = await createCitizenReport({
          scanId,
          productId,
          issueType: combinedIssueType,
          description: combinedDescription,
          locationText: locationText.trim(),
          shopName: shopName.trim(),
          shopAddress: shopAddress.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          latitude: latitudeValue,
          longitude: longitudeValue,
        });

        if (cancelled) {
          return;
        }

        if (!result.success || !result.report) {
          setError(
            result.message ?? "Failed to submit report.",
          );
          setSubmitting(false);
          return;
        }

        setReportCode(result.report.reportCode);
        setSuccess(true);
        setSubmitting(false);

        setTimeout(() => {
          router.push(
            `/consumer/reports/${result.report.id}`,
          );
        }, 1800);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "REPORT SUBMISSION ERROR:",
          error,
        );

        setError(
          "Something went wrong while submitting the report.",
        );

        setSubmitting(false);
      }
    }

    submitReport();

    return () => {
      cancelled = true;
    };
  }, [
    scanId,
    productId,
    issuesParam,
    locationText,
    shopName,
    shopAddress,
    city,
    state,
    pincode,
    latitude,
    longitude,
    router,
  ]);

  return (
    <main className="min-h-screen bg-[#F7FAFC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          {submitting && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>

              <h1 className="mt-6 text-2xl font-black text-slate-900">
                Submitting Your Report
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Your report is being securely submitted with
                all reported issues, shop details and scanned
                product evidence.
              </p>
            </>
          )}

          {!submitting && error && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              <h1 className="mt-6 text-2xl font-black text-slate-900">
                Submission Failed
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-600">
                {error}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/scan")}
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Back to Scanner
                </button>
              </div>
            </>
          )}

          {!submitting && success && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>

              <h1 className="mt-6 text-2xl font-black text-slate-900">
                Report Submitted Successfully
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Your report has been submitted successfully.
                All selected issues, shop details, GPS
                information and scanned product images are
                linked to this report.
              </p>

              <div className="mx-auto mt-6 flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Report ID
                  </p>

                  <p className="mt-1 break-all font-mono text-sm font-bold text-emerald-900">
                    {reportCode}
                  </p>
                </div>
              </div>

              <div className="mx-auto mt-4 flex max-w-sm items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                  <Store className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    Report Location
                  </p>

                  <p className="mt-1 text-sm font-bold text-blue-900">
                    {shopName}
                  </p>

                  <p className="mt-0.5 text-xs text-blue-700">
                    {city}, {state}
                  </p>
                </div>
              </div>

              <p className="mt-6 text-xs font-semibold text-slate-400">
                Opening your report details...
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}