"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Flag,
  Loader2,
  MapPin,
  Package,
  Plus,
  ScanLine,
  Trash2,
} from "lucide-react";
import { getScanById } from "@/actions/product/product.actions";

const issueTypes = [
  "MRP Issue",
  "Net Quantity Issue",
  "Manufacturer / Packer / Importer Issue",
  "Date Information Issue",
  "Consumer Care Issue",
  "Country of Origin Issue",
  "Missing Declaration",
  "Other",
];

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

type IssueEntry = {
  id: number;
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
    packer?: string | null;
    importer?: string | null;
    mrp?: string | null;
    netQuantityValue?: string | null;
    netQuantityUnit?: string | null;
  } | null;
  images?: {
    id: string;
    imageType: string;
    secureUrl: string;
  }[];
};

export default function ReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const scanId = searchParams.get("scanId");
  const productId = searchParams.get("productId");

  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [issues, setIssues] = useState<IssueEntry[]>([
    {
      id: 1,
      issueType: "",
      description: "",
    },
  ]);

  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [locationText, setLocationText] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [gettingLocation, setGettingLocation] = useState(false);
  const [formError, setFormError] = useState("");

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
        console.error("REPORT SCAN LOAD ERROR:", error);
        setError("Unable to load scan information.");
      } finally {
        setLoading(false);
      }
    }

    loadScan();
  }, [scanId]);

  const updateIssue = (
    id: number,
    field: keyof Omit<IssueEntry, "id">,
    value: string,
  ) => {
    setIssues((current) =>
      current.map((issue) =>
        issue.id === id ? { ...issue, [field]: value } : issue,
      ),
    );
  };

  const addIssue = () => {
    const newId =
      issues.length > 0
        ? Math.max(...issues.map((issue) => issue.id)) + 1
        : 1;

    setIssues((current) => [
      ...current,
      {
        id: newId,
        issueType: "",
        description: "",
      },
    ]);

    setFormError("");
  };

  const removeIssue = (id: number) => {
    if (issues.length === 1) {
      return;
    }

    setIssues((current) => current.filter((issue) => issue.id !== id));
    setFormError("");
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setFormError(
        "Geolocation is not supported by this browser.",
      );
      return;
    }

    setGettingLocation(true);
    setFormError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat.toString());
        setLongitude(lng.toString());

        setLocationText(
          `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        );

        setGettingLocation(false);
      },
      () => {
        setFormError(
          "Unable to access your location. Please allow location permission and try again.",
        );
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleContinue = () => {
    setFormError("");

    if (!scanId) {
      setFormError("Scan information is missing.");
      return;
    }

    if (!scan) {
      setFormError("Scan information could not be loaded.");
      return;
    }

    for (let index = 0; index < issues.length; index++) {
      const issue = issues[index];

      if (!issue.issueType) {
        setFormError(
          `Please select an issue type for Issue ${index + 1}.`,
        );
        return;
      }

      if (!issue.description.trim()) {
        setFormError(
          `Please describe the issue for Issue ${index + 1}.`,
        );
        return;
      }
    }

    if (!shopName.trim()) {
      setFormError("Please enter the shop name.");
      return;
    }

    if (!shopAddress.trim()) {
      setFormError("Please enter the shop address.");
      return;
    }

    if (!city.trim()) {
      setFormError("Please enter the city.");
      return;
    }

    if (!state) {
      setFormError("Please select the state.");
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setFormError("Please enter a valid 6-digit pincode.");
      return;
    }

    const params = new URLSearchParams();

    params.set("scanId", scanId);

    if (productId || scan.productId) {
      params.set(
        "productId",
        productId ?? scan.productId ?? "",
      );
    }

    params.set(
      "issues",
      JSON.stringify(
        issues.map((issue) => ({
          issueType: issue.issueType,
          description: issue.description.trim(),
        })),
      ),
    );

    params.set("shopName", shopName.trim());
    params.set("shopAddress", shopAddress.trim());
    params.set("city", city.trim());
    params.set("state", state);
    params.set("pincode", pincode.trim());

    const combinedLocation = [
      shopName.trim(),
      shopAddress.trim(),
      city.trim(),
      state,
      pincode.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    params.set(
      "locationText",
      locationText.trim() || combinedLocation,
    );

    if (latitude.trim()) {
      params.set("latitude", latitude.trim());
    }

    if (longitude.trim()) {
      params.set("longitude", longitude.trim());
    }

    router.push(`/report/preview?${params.toString()}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7FAFC] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#15803D]" />
            <span className="text-sm font-semibold text-slate-700">
              Loading scan information...
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

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Unable to load report
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
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600">
              <Flag className="h-3.5 w-3.5" />
              Report Issue
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Report a Product Issue
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              You can report multiple issues found on the same
              product in a single report.
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
                    Product / Scan
                  </h2>

                  <p className="text-sm text-slate-500">
                    Product associated with this scan
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
                    Scan ID
                  </p>

                  <p className="mt-2 break-all font-mono text-xs font-semibold text-slate-700">
                    {scan.id}
                  </p>
                </div>

                {product?.brandName && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Brand
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {product.brandName}
                    </p>
                  </div>
                )}

                {product?.category && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {product.category}
                    </p>
                  </div>
                )}
              </div>

              {scan.images && scan.images.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <ScanLine className="h-4 w-4 text-slate-400" />

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Scan Evidence
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {scan.images.map((image) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                      >
                        <div className="aspect-video bg-slate-100">
                          <img
                            src={image.secureUrl}
                            alt="Scanned product"
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {image.imageType}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                      Add all issues found on this product.
                    </p>
                  </div>
                </div>

                <div className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 sm:block">
                  {issues.length}{" "}
                  {issues.length === 1 ? "Issue" : "Issues"}
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {issues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-red-600">
                          Issue {index + 1}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Describe one specific problem with the product.
                        </p>
                      </div>

                      {issues.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIssue(issue.id)}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Issue Type
                      </label>

                      <select
                        value={issue.issueType}
                        onChange={(event) =>
                          updateIssue(
                            issue.id,
                            "issueType",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      >
                        <option value="">
                          Select an issue type
                        </option>

                        {issueTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Description
                      </label>

                      <textarea
                        value={issue.description}
                        onChange={(event) =>
                          updateIssue(
                            issue.id,
                            "description",
                            event.target.value,
                          )
                        }
                        rows={5}
                        placeholder="Describe the issue found on the product..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />

                      <p className="mt-2 text-right text-xs text-slate-400">
                        {issue.description.length} characters
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                type="button"
                onClick={addIssue}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
              >
                <Plus className="h-4 w-4" />
                Add Another Issue
              </button>
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
                    Provide where the product was observed.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Shop Name
                  </label>

                  <input
                    value={shopName}
                    onChange={(event) =>
                      setShopName(event.target.value)
                    }
                    placeholder="Enter shop / store name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Shop Address
                  </label>

                  <textarea
                    value={shopAddress}
                    onChange={(event) =>
                      setShopAddress(event.target.value)
                    }
                    rows={3}
                    placeholder="Enter complete shop address"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      City
                    </label>

                    <input
                      value={city}
                      onChange={(event) =>
                        setCity(event.target.value)
                      }
                      placeholder="Enter city"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      State
                    </label>

                    <select
                      value={state}
                      onChange={(event) =>
                        setState(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    >
                      <option value="">
                        Select state
                      </option>

                      {states.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Pincode
                  </label>

                  <input
                    value={pincode}
                    onChange={(event) =>
                      setPincode(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6),
                      )
                    }
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit pincode"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        GPS Location
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Optional but recommended for accurate
                        inspection location.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {gettingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}

                      {gettingLocation
                        ? "Getting Location..."
                        : "Use GPS"}
                    </button>
                  </div>

                  {(latitude || longitude) && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                  )}
                </div>
              </div>
            </section>

            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                <p className="text-sm font-semibold leading-6 text-red-700">
                  {formError}
                </p>
              </motion.div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/scan")}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                Continue to Preview
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <p className="text-xs leading-5 text-emerald-800">
                Your scanned product images will remain linked
                to this report as evidence. You do not need to
                upload the same images again.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}