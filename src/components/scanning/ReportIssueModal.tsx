"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ScanAnalysis,
  ScanImage,
  ScanMode,
} from "@/lib/scanning/types";
import styles from "./scanning.module.css";

type ReportIssueModalProps = {
  analysis: ScanAnalysis;
  images: ScanImage[];
  mode?: ScanMode;
  onClose: () => void;
  /**
   * Called once the report flow has genuinely finished — i.e. when the
   * user leaves the "success" screen via "Back to Scan", or right before
   * redirecting an inspector to the take-action page. Use this (rather
   * than onClose) to reset/clear the underlying scan, since onClose alone
   * is also used for plain Cancel/× on the form and preview steps, where
   * the in-progress scan should NOT be thrown away.
   */
  onSubmitted?: () => void;
};

type ReportStep = "form" | "preview" | "success";

type ReportDraft = {
  issueType: string;
  description: string;
  shopName: string;
  shopkeeperName: string;
  shopAddress: string;
  shopCity: string;
  shopState: string;
  shopPinCode: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null;
};

// NOTE: previously this was a single fixed key shared by every scan/report,
// which meant an unsubmitted draft from one product/report would silently
// reappear when opening the form for a completely different scan. The key is
// now scoped per scanId so each report gets its own isolated draft.
const LEGACY_STORAGE_KEY = "checkitright:report-draft:v1";

function getStorageKey(scanId: string) {
  return `checkitright:report-draft:${scanId}`;
}

const ISSUE_TYPES = [
  ["INCORRECT_MRP", "Incorrect MRP"],
  ["MISSING_MRP", "Missing MRP"],
  ["INCORRECT_NET_QUANTITY", "Incorrect Net Quantity"],
  ["MISSING_MANUFACTURER_DETAILS", "Missing Manufacturer/Packer/Importer Details"],
  ["MISSING_COUNTRY_OF_ORIGIN", "Missing Country of Origin"],
  ["MISSING_DATE_DECLARATION", "Missing Date Declaration"],
  ["MISSING_BEST_BEFORE_USE_BY", "Missing Best Before / Use By"],
  ["MISSING_CONSUMER_CARE", "Missing Consumer Care Details"],
  ["INCORRECT_DECLARATION", "Misleading / Incorrect Declaration"],
  ["UNREADABLE_INFORMATION", "Unreadable Mandatory Information"],
  ["OTHER", "Other"],
] as const;

const EMPTY_DRAFT: ReportDraft = {
  issueType: "",
  description: "",
  shopName: "",
  shopkeeperName: "",
  shopAddress: "",
  shopCity: "",
  shopState: "",
  shopPinCode: "",
  location: null,
};

export default function ReportIssueModal({
  analysis,
  images,
  mode = "consumer",
  onClose,
  onSubmitted,
}: ReportIssueModalProps) {
  const router = useRouter();
  const storageKey = useMemo(
    () => getStorageKey(analysis.scanId),
    [analysis.scanId],
  );

  const [step, setStep] = useState<ReportStep>("form");
  const [draft, setDraft] = useState<ReportDraft>(EMPTY_DRAFT);
  const [additionalEvidence, setAdditionalEvidence] = useState<File[]>([]);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [submittedReportNumber, setSubmittedReportNumber] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  // Load the draft that belongs to THIS scan only. Any draft saved under the
  // old, unscoped key is discarded (and removed) rather than restored, since
  // there's no way to know which scan it originally belonged to.
  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Best-effort cleanup only.
    }

    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) {
        setDraft(EMPTY_DRAFT);
        return;
      }

      const parsed = JSON.parse(saved) as Partial<ReportDraft>;
      setDraft({
        ...EMPTY_DRAFT,
        ...parsed,
        location:
          parsed.location &&
          typeof parsed.location.latitude === "number" &&
          typeof parsed.location.longitude === "number"
            ? parsed.location
            : null,
      });
    } catch {
      window.localStorage.removeItem(storageKey);
      setDraft(EMPTY_DRAFT);
    }
    // Re-run whenever the modal is pointed at a different scan.
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // localStorage is only a convenience draft cache. Submission still uses the
      // in-memory form and the server remains the source of truth.
    }
  }, [draft, storageKey]);

  const product = analysis.product;
  const evidenceCount = images.length + additionalEvidence.length;
  const [additionalEvidencePreviews, setAdditionalEvidencePreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = additionalEvidence.map((file) => URL.createObjectURL(file));
    setAdditionalEvidencePreviews(urls);

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [additionalEvidence]);

  const selectedIssueLabel = useMemo(
    () => ISSUE_TYPES.find(([value]) => value === draft.issueType)?.[1] ?? "Not selected",
    [draft.issueType],
  );

  const updateDraft = <K extends keyof ReportDraft>(
    key: K,
    value: ReportDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setReportError(null);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setReportError("Location services are not supported by this browser. You can enter the location manually.");
      return;
    }

    setLocationLoading(true);
    setReportError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDraft((current) => ({
          ...current,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Number.isFinite(position.coords.accuracy)
              ? position.coords.accuracy
              : null,
          },
        }));
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        setReportError("We could not access your location. You can continue and enter the shop address manually.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const handleAdditionalEvidence = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    const available = Math.max(0, 12 - images.length - additionalEvidence.length);
    setAdditionalEvidence((current) => [...current, ...files.slice(0, available)]);
    event.target.value = "";
  };

  const removeAdditionalEvidence = (index: number) => {
    setAdditionalEvidence((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const validateForm = () => {
    if (!draft.shopName.trim()) {
      setReportError("Please enter the shop or store name.");
      return false;
    }

    if (!draft.issueType) {
      setReportError("Please select the issue type.");
      return false;
    }

    if (draft.description.trim().length < 5) {
      setReportError("Please describe the issue in at least a few words.");
      return false;
    }

    if (evidenceCount === 0) {
      setReportError("At least one evidence image is required.");
      return false;
    }

    return true;
  };

  const goToPreview = () => {
    if (!validateForm()) return;
    setReportError(null);
    setStep("preview");
  };

  const submitReport = async () => {
    if (!validateForm() || reportSubmitting) return;

    setReportSubmitting(true);
    setReportError(null);

    try {
      const formData = new FormData();

      formData.append("issueType", draft.issueType);
      formData.append("description", draft.description.trim());
      formData.append("shopName", draft.shopName.trim());
      formData.append("shopkeeperName", draft.shopkeeperName.trim());
      formData.append("shopAddress", draft.shopAddress.trim());
      formData.append("shopCity", draft.shopCity.trim());
      formData.append("shopState", draft.shopState.trim());
      formData.append("shopPinCode", draft.shopPinCode.trim());
      formData.append("scanId", analysis.scanId);
      formData.append("product", JSON.stringify(product));
      formData.append("analysis", JSON.stringify(analysis));
      formData.append("location", JSON.stringify(draft.location));

      const evidenceMeta: Array<{ imageType: string }> = [];

      images.forEach((image) => {
        formData.append("evidence", image.file, image.file.name);
        evidenceMeta.push({ imageType: image.type });
      });

      additionalEvidence.forEach((file) => {
        formData.append("evidence", file, file.name);
        evidenceMeta.push({ imageType: "additional" });
      });

      formData.append("evidenceMeta", JSON.stringify(evidenceMeta));

      const response = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to submit the report.");
      }

      setSubmittedReportNumber(data.report.reportNumber);
      window.localStorage.removeItem(storageKey);

      if (mode === "inspector") {
        // Inspector flow leaves this component entirely for the
        // take-action page. Let the parent clear/reset the scan before
        // we navigate away, rather than leaving stale scan state behind
        // if the inspector navigates back.
        onSubmitted?.();

        router.push(
          `/inspector/take-action?scanId=${encodeURIComponent(
            analysis.scanId,
          )}&reportId=${encodeURIComponent(data.report.id)}`,
        );
        return;
      }

      setStep("success");
    } catch (error) {
      console.error("REPORT SUBMISSION ERROR:", error);
      setReportError(
        error instanceof Error
          ? error.message
          : "Unable to submit the report. Please try again.",
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  // Used by the "Back to Scan" button on the success screen. The report
  // has already been submitted at this point, so this is the moment the
  // parent should actually reset the scan — as opposed to onClose, which
  // is also wired to Cancel/× on the form and preview steps, where the
  // in-progress scan must be preserved.
  const handleDone = () => {
    if (onSubmitted) {
      onSubmitted();
    } else {
      onClose();
    }
  };

  const renderProductSummary = () => (
    <div className={styles.reportProductCard}>
      <div>
        <span className={styles.reportLabel}>Product</span>
        <strong>{product.productName.value || "Not detected"}</strong>
      </div>
      <div>
        <span className={styles.reportLabel}>Brand</span>
        <strong>{product.brandName.value || "Not detected"}</strong>
      </div>
      <div>
        <span className={styles.reportLabel}>MRP</span>
        <strong>{product.mrp.value || "Not detected"}</strong>
      </div>
      <div>
        <span className={styles.reportLabel}>Net Quantity</span>
        <strong>{product.netQuantity.value || "Not detected"}</strong>
      </div>
    </div>
  );

  return (
    <div className={styles.reportModal} role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className={styles.reportDialog}>
        <header className={styles.reportHeader}>
          <div>
            <span className={styles.reportEyebrow}>
              {mode === "inspector" ? "Inspector Report" : "Citizen Report"}
            </span>
            <h2 id="report-title" className={styles.reportTitle}>
              {step === "success" ? "Report submitted" : step === "preview" ? "Review your report" : "Report an Issue"}
            </h2>
            <p className={styles.reportSubtitle}>
              {step === "success"
                ? "Your report has been recorded successfully."
                : "Tell us what you found and attach the scan evidence."}
            </p>
          </div>
          {step !== "success" && (
            <button type="button" className={styles.reportClose} onClick={onClose} aria-label="Close report form">
              ×
            </button>
          )}
        </header>

        {step === "form" && (
          <div className={styles.reportBody}>
            {renderProductSummary()}

            <section className={styles.reportSection}>
              <h3 className={styles.reportSectionTitle}>Shop / Business Details</h3>
              <div className={styles.reportGrid}>
                <label className={styles.reportField}>
                  <span>Shop / Store Name *</span>
                  <input value={draft.shopName} onChange={(e) => updateDraft("shopName", e.target.value)} placeholder="e.g. ABC General Store" />
                </label>
                <label className={styles.reportField}>
                  <span>Shopkeeper / Business Name</span>
                  <input value={draft.shopkeeperName} onChange={(e) => updateDraft("shopkeeperName", e.target.value)} placeholder="If known" />
                </label>
                <label className={`${styles.reportField} ${styles.reportFieldFull}`}>
                  <span>Shop Address</span>
                  <textarea value={draft.shopAddress} onChange={(e) => updateDraft("shopAddress", e.target.value)} rows={2} placeholder="Street, market, landmark..." />
                </label>
                <label className={styles.reportField}>
                  <span>City</span>
                  <input value={draft.shopCity} onChange={(e) => updateDraft("shopCity", e.target.value)} placeholder="City" />
                </label>
                <label className={styles.reportField}>
                  <span>State</span>
                  <input value={draft.shopState} onChange={(e) => updateDraft("shopState", e.target.value)} placeholder="State" />
                </label>
                <label className={styles.reportField}>
                  <span>PIN Code</span>
                  <input inputMode="numeric" value={draft.shopPinCode} onChange={(e) => updateDraft("shopPinCode", e.target.value)} placeholder="PIN code" maxLength={10} />
                </label>
              </div>
            </section>

            <section className={styles.reportSection}>
              <h3 className={styles.reportSectionTitle}>Location</h3>
              <div className={styles.reportLocationRow}>
                <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={requestLocation} disabled={locationLoading}>
                  {locationLoading ? "Getting location..." : "Use Current GPS Location"}
                </button>
                {draft.location && (
                  <span className={styles.reportLocationSuccess}>
                    ✓ Location captured ({draft.location.latitude.toFixed(5)}, {draft.location.longitude.toFixed(5)})
                  </span>
                )}
              </div>
            </section>

            <section className={styles.reportSection}>
              <h3 className={styles.reportSectionTitle}>Issue</h3>
              <div className={styles.reportGrid}>
                <label className={`${styles.reportField} ${styles.reportFieldFull}`}>
                  <span>Issue Type *</span>
                  <select value={draft.issueType} onChange={(e) => updateDraft("issueType", e.target.value)}>
                    <option value="">Select an issue</option>
                    {ISSUE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className={`${styles.reportField} ${styles.reportFieldFull}`}>
                  <span>Description / User Notes *</span>
                  <textarea value={draft.description} onChange={(e) => updateDraft("description", e.target.value)} rows={4} placeholder="Describe what appears incorrect, missing or unreadable..." maxLength={2000} />
                </label>
              </div>
            </section>

            <section className={styles.reportSection}>
              <div className={styles.reportSectionHeadingRow}>
                <div>
                  <h3 className={styles.reportSectionTitle}>Evidence</h3>
                  <p className={styles.reportSectionHint}>{evidenceCount} image{evidenceCount === 1 ? "" : "s"} will be submitted with this report.</p>
                </div>
                <input ref={additionalInputRef} className={styles.hiddenInput} type="file" accept="image/*" multiple onChange={handleAdditionalEvidence} />
                <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => additionalInputRef.current?.click()} disabled={evidenceCount >= 12}>
                  + Add Evidence
                </button>
              </div>

              <div className={styles.reportEvidenceGrid}>
                {images.map((image, index) => (
                  <div key={image.id} className={styles.reportEvidenceItem}>
                    <img src={image.previewUrl} alt={`Scan evidence ${index + 1}`} />
                    <span>{image.type}</span>
                  </div>
                ))}
                {additionalEvidence.map((file, index) => (
                  <div key={`${file.name}-${index}`} className={styles.reportEvidenceItem}>
                    <img src={additionalEvidencePreviews[index]} alt={`Additional evidence ${index + 1}`} />
                    <button type="button" className={styles.reportEvidenceRemove} onClick={() => removeAdditionalEvidence(index)} aria-label={`Remove additional evidence ${index + 1}`}>×</button>
                    <span>Additional</span>
                  </div>
                ))}
              </div>
            </section>

            {reportError && <div className={styles.reportError} role="alert">{reportError}</div>}

            <div className={styles.reportActions}>
              <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>Cancel</button>
              <button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={goToPreview}>Review Report</button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className={styles.reportBody}>
            <div className={styles.reportPreviewCard}>
              <div><span>Product</span><strong>{product.productName.value || "Not detected"}</strong></div>
              <div><span>Brand</span><strong>{product.brandName.value || "Not detected"}</strong></div>
              <div><span>Issue</span><strong>{selectedIssueLabel}</strong></div>
              <div><span>Shop</span><strong>{draft.shopName}</strong></div>
              <div><span>Location</span><strong>{[draft.shopCity, draft.shopState].filter(Boolean).join(", ") || "Manual address only"}</strong></div>
              <div><span>Evidence</span><strong>{evidenceCount} image{evidenceCount === 1 ? "" : "s"}</strong></div>
            </div>

            <div className={styles.reportPreviewDescription}>
              <span>Description</span>
              <p>{draft.description}</p>
            </div>

            <div className={styles.reportEvidenceGrid}>
              {images.map((image, index) => <div key={image.id} className={styles.reportEvidenceItem}><img src={image.previewUrl} alt={`Evidence ${index + 1}`} /><span>{image.type}</span></div>)}
              {additionalEvidence.map((file, index) => <div key={`${file.name}-${index}`} className={styles.reportEvidenceItem}><img src={additionalEvidencePreviews[index]} alt={`Additional evidence ${index + 1}`} /><span>Additional</span></div>)}
            </div>

            {reportError && <div className={styles.reportError} role="alert">{reportError}</div>}

            <p className={styles.reportDisclaimer}>
              Submitting creates a citizen report. It does not by itself establish a verified legal violation.
            </p>

            <div className={styles.reportActions}>
              <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setStep("form")} disabled={reportSubmitting}>← Edit</button>
              <button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={submitReport} disabled={reportSubmitting}>
                {reportSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className={styles.reportBody}>
            <div className={styles.reportSuccess}>
              <div className={styles.reportSuccessIcon}>✓</div>
              <h3>Report submitted successfully</h3>
              <p>Your information and evidence have been saved and linked to your report.</p>
              <div className={styles.reportIdCard}>
                <span>Report ID</span>
                <strong>{submittedReportNumber}</strong>
              </div>
              <p className={styles.reportDisclaimer}>
                This is a citizen report for review. It is not a verified violation or final legal determination.
              </p>
              <button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={handleDone}>Back to Scan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}