"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { checkImageQuality } from "@/lib/scanning/image-quality";
import type {
  ImageQualityStatus,
  ScanAnalysis,
  ScanImage,
  ScanImageType,
  ScanMode,
  ScanProgress,
} from "@/lib/scanning/types";
import styles from "./scanning.module.css";
import ReportIssueModal from "./ReportIssueModal";

const IMAGE_TYPE_LABELS: Record<ScanImageType, string> = {
  front: "Front Label",
  back: "Back Label",
  side: "Side Label",
  mrp: "MRP",
  "net-quantity": "Net Quantity",
  manufacturer: "Manufacturer Details",
  other: "Other",
};

const PROCESSING_STAGES: {
  key: ScanProgress["stage"];
  label: string;
}[] = [
  { key: "quality-check", label: "Quality Check" },
  { key: "preprocessing", label: "Preprocessing" },
  { key: "ocr", label: "OCR" },
  { key: "extraction", label: "Extraction" },
  { key: "analysis", label: "Analysis" },
];

type ResultTone = "success" | "warning" | "danger";

function getQualityClass(status: ImageQualityStatus) {
  if (status === "GOOD") return styles.good;
  if (status === "POOR") return styles.poor;

  return styles.review;
}

function getQualityLabel(status: ImageQualityStatus) {
  if (status === "GOOD") return "Good";
  if (status === "POOR") return "Poor";

  return "Review";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Decides the red / amber / green "tone" of a scan result.
 *
 * - COMPLIANT with a decent score -> success (green)
 * - INCOMPLETE (required fields missing) -> danger (red)
 * - NEEDS_REVIEW, or anything else -> driven by the numeric score,
 *   falling back to warning (amber) if no score is available.
 *
 * Thresholds (>=80 green, >=50 amber, below danger) are a sensible
 * default — tune them here if the backend's scoring scale differs.
 */
function getResultTone(analysis: ScanAnalysis): ResultTone {
  if (analysis.result === "INCOMPLETE") {
    return "danger";
  }

  if (typeof analysis.score === "number") {
    if (analysis.score >= 80) return "success";
    if (analysis.score >= 50) return "warning";
    return "danger";
  }

  if (analysis.result === "COMPLIANT") {
    return "success";
  }

  return "warning";
}

function getResultStatusCopy(tone: ResultTone) {
  if (tone === "success") {
    return { icon: "✓", label: "Preliminary Pass" };
  }

  if (tone === "danger") {
    return { icon: "✕", label: "Potential Violation" };
  }

  return { icon: "⚠", label: "Needs Review" };
}

/** Combines a base module-css class with its `<Base><Tone>` variant. */
function toneClass(base: string, tone: ResultTone) {
  const variantKey = `${base}${tone[0].toUpperCase()}${tone.slice(1)}`;
  const variant = (styles as Record<string, string>)[variantKey];

  return variant ? `${styles[base]} ${variant}` : styles[base];
}

function getApiResultMessage(
  result: {
    ocr?: {
      status?: string;
    };
    extraction?: {
      status?: string;
    };
  },
) {
  if (
    result.ocr?.status === "NOT_CONFIGURED" ||
    result.extraction?.status === "NOT_CONFIGURED"
  ) {
    return "OCR and AI extraction are not configured yet. The images were successfully received and processed without generating fabricated product information.";
  }

  return "Product analysis completed.";
}

export default function ScanWorkspace() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [reportOpen, setReportOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cameraVideoRef =
    useRef<HTMLVideoElement>(null);

  const cameraStreamRef =
    useRef<MediaStream | null>(null);

  const [images, setImages] = useState<ScanImage[]>(
    [],
  );

  const [mode, setMode] =
    useState<ScanMode>("guest");

  const [contextLoading, setContextLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraError, setCameraError] =
    useState<string | null>(null);

  const [analysis, setAnalysis] =
    useState<ScanAnalysis | null>(null);

  const [analysisMessage, setAnalysisMessage] =
    useState<string | null>(null);

  const [progress, setProgress] =
    useState<ScanProgress>({
      stage: "idle",
      progress: 0,
      message: "Add product images to begin.",
    });

  useEffect(() => {
    let cancelled = false;

    const loadScanContext = async () => {
      try {
        setContextLoading(true);

        const response = await fetch(
          "/api/scans/context",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (
          !cancelled &&
          data.success &&
          (data.mode === "guest" ||
            data.mode === "consumer" ||
            data.mode === "inspector")
        ) {
          setMode(data.mode);
        }
      } catch (error) {
        console.error(
          "FAILED TO LOAD SCAN CONTEXT:",
          error,
        );
      } finally {
        if (!cancelled) {
          setContextLoading(false);
        }
      }
    };

    loadScanContext();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();

      images.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [images]);

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      cameraStreamRef.current = null;
    }
  };

  const openCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is not supported by this browser. Please use Add Images instead.",
      );

      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1920,
            },
            height: {
              ideal: 1080,
            },
          },
          audio: false,
        });

      cameraStreamRef.current = stream;

      setCameraOpen(true);

      requestAnimationFrame(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject =
            stream;
        }
      });
    } catch (error) {
      console.error(
        "CAMERA ERROR:",
        error,
      );

      setCameraError(
        "Camera permission was denied or the camera is unavailable. Please allow camera access and try again.",
      );
    }
  };

  const closeCamera = () => {
    stopCamera();

    setCameraOpen(false);
    setCameraError(null);
  };

  const addFiles = async (
    files: FileList | File[],
  ) => {
    const fileArray = Array.from(files);

    const newImages: ScanImage[] = [];

    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      const quality =
        await checkImageQuality(file);

      const image: ScanImage = {
        id: crypto.randomUUID(),
        file,
        previewUrl:
          URL.createObjectURL(file),
        type: "other",
        quality: quality.status,
        width: quality.width || null,
        height: quality.height || null,
        size: file.size,
        createdAt: Date.now(),
      };

      newImages.push(image);
    }

    if (newImages.length > 0) {
      setImages((current) => [
        ...current,
        ...newImages,
      ]);
    }
  };

  const capturePhoto = async () => {
    const video = cameraVideoRef.current;

    if (
      !video ||
      video.readyState < 2
    ) {
      setCameraError(
        "Camera is not ready yet. Please try again.",
      );

      return;
    }

    const canvas =
      document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setCameraError(
        "Unable to capture the camera image.",
      );

      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setCameraError(
            "Unable to create the captured image.",
          );

          return;
        }

        const file = new File(
          [blob],
          `camera-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
            lastModified: Date.now(),
          },
        );

        await addFiles([file]);

        closeCamera();
      },
      "image/jpeg",
      0.92,
    );
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files) {
      return;
    }

    await addFiles(event.target.files);

    event.target.value = "";
  };

  const removeImage = (id: string) => {
    setImages((current) => {
      const image = current.find(
        (item) => item.id === id,
      );

      if (image) {
        URL.revokeObjectURL(
          image.previewUrl,
        );
      }

      return current.filter(
        (item) => item.id !== id,
      );
    });
  };

  const changeImageType = (
    id: string,
    type: ScanImageType,
  ) => {
    setImages((current) =>
      current.map((image) =>
        image.id === id
          ? {
              ...image,
              type,
            }
          : image,
      ),
    );
  };

  const moveImage = (
    index: number,
    direction: -1 | 1,
  ) => {
    setImages((current) => {
      const targetIndex =
        index + direction;

      if (
        targetIndex < 0 ||
        targetIndex >= current.length
      ) {
        return current;
      }

      const updated = [...current];

      [
        updated[index],
        updated[targetIndex],
      ] = [
        updated[targetIndex],
        updated[index],
      ];

      return updated;
    });
  };

  const clearImages = () => {
    images.forEach((image) => {
      URL.revokeObjectURL(
        image.previewUrl,
      );
    });

    setImages([]);

    setAnalysis(null);
    setAnalysisMessage(null);

    setProgress({
      stage: "idle",
      progress: 0,
      message:
        "Add product images to begin.",
    });
  };

  const startAnalysis = async () => {
    if (
      images.length === 0 ||
      processing
    ) {
      return;
    }

    setProcessing(true);
    setAnalysis(null);
    setAnalysisMessage(null);

    setProgress({
      stage: "quality-check",
      progress: 15,
      message:
        "Checking image quality and available evidence...",
    });

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 300),
      );

      setProgress({
        stage: "preprocessing",
        progress: 30,
        message:
          "Preparing captured images for server-side processing...",
      });

      const formData = new FormData();

      images.forEach((image, index) => {
        formData.append(
          "images",
          image.file,
          image.file.name,
        );

        formData.append(
          `imageType-${index}`,
          image.type,
        );
      });

      setProgress({
        stage: "ocr",
        progress: 50,
        message:
          "Sending product images to the OCR pipeline...",
      });

      const response = await fetch(
        "/api/scans/analyze",
        {
          method: "POST",
          body: formData,
        },
      );

      setProgress({
        stage: "extraction",
        progress: 70,
        message:
          "Processing structured product information...",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Product analysis failed.",
        );
      }

      setProgress({
        stage: "analysis",
        progress: 90,
        message:
          "Preparing preliminary compliance analysis...",
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 250),
      );

      const serverAnalysis =
        data.scan;

      const mappedAnalysis: ScanAnalysis = {
        scanId:
          serverAnalysis.scanId,

        mode:
          serverAnalysis.mode,

        result:
          serverAnalysis.preliminary
            ?.result ?? "NEEDS_REVIEW",

        providerStatus:
          serverAnalysis.providerStatus
            ?.ocr === "LIVE" &&
          serverAnalysis.providerStatus
            ?.ai === "LIVE"
            ? "LIVE"
            : "NOT_CONFIGURED",

        disclaimer:
          serverAnalysis.preliminary
            ?.disclaimer ??
          "This result is not a legal determination.",

        product:
          serverAnalysis.extraction
            ?.product,

        checks:
          serverAnalysis.preliminary
            ?.checks ?? [],

        score:
          typeof serverAnalysis.preliminary
            ?.score === "number"
            ? serverAnalysis.preliminary.score
            : null,

        warnings: [
          ...(serverAnalysis.ocr
            ?.warnings ?? []),

          ...(serverAnalysis.extraction
            ?.warnings ?? []),

          ...(serverAnalysis.preliminary
            ?.warnings ?? []),
        ],
      };

      setAnalysis(mappedAnalysis);

      setAnalysisMessage(
        getApiResultMessage(
          serverAnalysis,
        ),
      );

      setProgress({
        stage: "complete",
        progress: 100,
        message:
          "Server-side scan processing completed.",
      });
    } catch (error) {
      console.error(
        "SCAN ANALYSIS ERROR:",
        error,
      );

      setProgress({
        stage: "error",
        progress: 0,
        message:
          error instanceof Error
            ? error.message
            : "Unable to analyze the product.",
      });

      setAnalysisMessage(
        error instanceof Error
          ? error.message
          : "Unable to analyze the product.",
      );
    } finally {
      setProcessing(false);
    }
  };

  /*
   * ----------------------------------------------------------
   * REPORT ISSUE
   * ----------------------------------------------------------
   *
   * Guest:
   *   -> login
   *
   * Signed-in consumer/inspector:
   *   -> open report modal
   *
   * The scanned images remain in React state and are passed
   * directly to the report modal. They are not permanently
   * stored just because a scan was performed.
   */

  const handleReportIssue = () => {
    if (!analysis) {
      return;
    }

    if (!isSignedIn) {
      router.push(
        "/login?redirect_url=/scan",
      );

      return;
    }

    setReportOpen(true);
  };

  const resetScan = () => {
    clearImages();

    setProgress({
      stage: "idle",
      progress: 0,
      message:
        "Add product images to begin.",
    });
  };

  /**
   * Called by ReportIssueModal once a report has actually been
   * submitted successfully (not on a plain cancel/close). Clears the
   * scan so stale images/analysis don't linger behind the new report.
   */
  const handleReportSubmitted = () => {
    setReportOpen(false);
    resetScan();
  };

  const tone = analysis ? getResultTone(analysis) : "warning";
  const statusCopy = getResultStatusCopy(tone);

  // While the report form is open, the scan workspace is not
  // rendered at all — the report form fully replaces it instead of
  // layering on top as a modal over stale scan data. This applies
  // the same way regardless of scan mode (guest/consumer/inspector).
  if (reportOpen && analysis) {
    return (
      <main className={styles.container}>
        <ReportIssueModal
          analysis={analysis}
          images={images}
          mode={mode}
          onClose={() => setReportOpen(false)}
          onSubmitted={handleReportSubmitted}
        />
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.workspace}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>
            <span>✓</span>
            CheckItRight Scanner
          </div>

          <h1 className={styles.title}>
            Scan a packaged product
          </h1>

          <p
            className={
              styles.description
            }
          >
            Capture clear images of the
            product label. CheckItRight will
            use the available evidence for
            OCR, structured extraction and
            preliminary compliance analysis.
          </p>

          <div className={styles.modeBadge}>
            {contextLoading
              ? "Detecting scan mode..."
              : `Scan mode: ${
                  mode === "guest"
                    ? "Guest"
                    : mode === "consumer"
                      ? "Consumer"
                      : "Inspector"
                }`}
          </div>
        </header>

        {!processing &&
          progress.stage !==
            "complete" &&
          progress.stage !== "error" && (
            <section
              className={`${styles.card} ${styles.captureCard}`}
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <h2
                    className={
                      styles.sectionTitle
                    }
                  >
                    Product images
                  </h2>

                  <p
                    className={
                      styles.sectionDescription
                    }
                  >
                    Add the front, back and
                    relevant side panels. You
                    can add multiple images and
                    arrange them before
                    analysis.
                  </p>
                </div>

                <div
                  className={styles.actions}
                >
                  <button
                    type="button"
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={openCamera}
                  >
                    📷 Camera
                  </button>

                  <button
                    type="button"
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    + Add Images
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                className={
                  styles.hiddenInput
                }
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleFileChange
                }
              />

              {images.length === 0 ? (
                <div
                  className={
                    styles.dropZone
                  }
                >
                  <div
                    className={
                      styles.cameraIcon
                    }
                  >
                    📷
                  </div>

                  <h3
                    className={
                      styles.dropTitle
                    }
                  >
                    Capture or upload
                    product images
                  </h3>

                  <p
                    className={
                      styles.dropDescription
                    }
                  >
                    Include areas containing
                    MRP, net quantity,
                    manufacturer,
                    packer, importer and
                    other declarations
                    whenever available.
                  </p>

                  <div
                    className={
                      styles.actions
                    }
                  >
                    <button
                      type="button"
                      className={`${styles.button} ${styles.primaryButton}`}
                      onClick={
                        openCamera
                      }
                    >
                      Open Camera
                    </button>

                    <button
                      type="button"
                      className={`${styles.button} ${styles.secondaryButton}`}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >
                      Choose From Device
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={
                    styles.imageGrid
                  }
                >
                  {images.map(
                    (
                      image,
                      index,
                    ) => (
                      <article
                        key={
                          image.id
                        }
                        className={
                          styles.imageCard
                        }
                      >
                        <div
                          className={
                            styles.imagePreview
                          }
                        >
                          <img
                            src={
                              image.previewUrl
                            }
                            alt={`Product image ${
                              index +
                              1
                            }`}
                          />

                          <span
                            className={
                              styles.imageNumber
                            }
                          >
                            {index +
                              1}
                          </span>

                          <button
                            type="button"
                            className={
                              styles.removeImage
                            }
                            onClick={() =>
                              removeImage(
                                image.id,
                              )
                            }
                            aria-label={`Remove image ${
                              index +
                              1
                            }`}
                          >
                            ×
                          </button>
                        </div>

                        <div
                          className={
                            styles.imageInfo
                          }
                        >
                          <div
                            className={
                              styles.imageTopRow
                            }
                          >
                            <span
                              className={
                                styles.imageName
                              }
                            >
                              {
                                image
                                  .file
                                  .name
                              }
                            </span>

                            <span
                              className={`${styles.qualityBadge} ${getQualityClass(
                                image.quality,
                              )}`}
                            >
                              {getQualityLabel(
                                image.quality,
                              )}
                            </span>
                          </div>

                          <div
                            className={
                              styles.imageMeta
                            }
                          >
                            {image.width &&
                            image.height
                              ? `${image.width} × ${image.height}`
                              : "Dimensions unavailable"}{" "}
                            ·{" "}
                            {formatFileSize(
                              image.size,
                            )}
                          </div>

                          <div
                            className={
                              styles.selectWrapper
                            }
                          >
                            <label
                              className={
                                styles.selectLabel
                              }
                              htmlFor={`image-type-${image.id}`}
                            >
                              Image
                              purpose
                            </label>

                            <select
                              id={`image-type-${image.id}`}
                              className={
                                styles.select
                              }
                              value={
                                image.type
                              }
                              onChange={(
                                event,
                              ) =>
                                changeImageType(
                                  image.id,
                                  event
                                    .target
                                    .value as ScanImageType,
                                )
                              }
                            >
                              {Object.entries(
                                IMAGE_TYPE_LABELS,
                              ).map(
                                ([
                                  value,
                                  label,
                                ]) => (
                                  <option
                                    key={
                                      value
                                    }
                                    value={
                                      value
                                    }
                                  >
                                    {
                                      label
                                    }
                                  </option>
                                ),
                              )}
                            </select>
                          </div>

                          {image.quality !==
                            "GOOD" && (
                            <div
                              className={
                                styles.qualityWarning
                              }
                            >
                              This image
                              may need
                              review. It
                              will not
                              automatically
                              be treated as
                              missing
                              evidence.
                            </div>
                          )}

                          <div
                            className={
                              styles.reorderActions
                            }
                          >
                            <button
                              type="button"
                              className={
                                styles.smallButton
                              }
                              disabled={
                                index ===
                                0
                              }
                              onClick={() =>
                                moveImage(
                                  index,
                                  -1,
                                )
                              }
                            >
                              ← Move
                            </button>

                            <button
                              type="button"
                              className={
                                styles.smallButton
                              }
                              disabled={
                                index ===
                                images.length -
                                  1
                              }
                              onClick={() =>
                                moveImage(
                                  index,
                                  1,
                                )
                              }
                            >
                              Move →
                            </button>
                          </div>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              )}

              <div
                className={
                  styles.infoBox
                }
              >
                <span
                  className={
                    styles.infoIcon
                  }
                >
                  i
                </span>

                <span>
                  Images used for a normal
                  scan are processed
                  temporarily. Permanent
                  evidence storage will only
                  be introduced when it is
                  required for a successfully
                  submitted report.
                </span>
              </div>

              {images.length > 0 && (
                <div
                  className={
                    styles.bottomActions
                  }
                >
                  <span
                    className={
                      styles.imageCount
                    }
                  >
                    {images.length}{" "}
                    {images.length === 1
                      ? "image"
                      : "images"}{" "}
                    added
                  </span>

                  <div
                    className={
                      styles.actions
                    }
                  >
                    <button
                      type="button"
                      className={`${styles.button} ${styles.dangerButton}`}
                      onClick={
                        clearImages
                      }
                    >
                      Clear All
                    </button>

                    <button
                      type="button"
                      className={`${styles.button} ${styles.primaryButton}`}
                      onClick={
                        startAnalysis
                      }
                    >
                      Analyze Product
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

        {processing && (
          <section
            className={`${styles.card} ${styles.processingCard}`}
          >
            <div
              className={
                styles.processingIcon
              }
            />

            <h2
              className={
                styles.processingTitle
              }
            >
              Analyzing product
            </h2>

            <p
              className={
                styles.processingMessage
              }
            >
              {progress.message}
            </p>

            <div
              className={
                styles.progressTrack
              }
              role="progressbar"
              aria-valuenow={
                progress.progress
              }
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={
                  styles.progressBar
                }
                style={{
                  width: `${progress.progress}%`,
                }}
              />
            </div>

            <div
              className={
                styles.stageList
              }
            >
              {PROCESSING_STAGES.map(
                (stage) => {
                  const currentIndex =
                    PROCESSING_STAGES.findIndex(
                      (item) =>
                        item.key ===
                        progress.stage,
                    );

                  const stageIndex =
                    PROCESSING_STAGES.findIndex(
                      (item) =>
                        item.key ===
                        stage.key,
                    );

                  const active =
                    stageIndex <=
                    currentIndex;

                  return (
                    <div
                      key={stage.key}
                      className={`${styles.stage} ${
                        active
                          ? styles.activeStage
                          : ""
                      }`}
                    >
                      {stage.label}
                    </div>
                  );
                },
              )}
            </div>
          </section>
        )}

        {!processing &&
          progress.stage ===
            "error" && (
            <section
              className={`${styles.card} ${styles.resultCard}`}
            >
              <div
                className={
                  styles.resultHeader
                }
              >
                <div>
                  <div
                    className={
                      styles.resultStatus
                    }
                  >
                    ⚠ Analysis Failed
                  </div>

                  <h2
                    className={
                      styles.sectionTitle
                    }
                  >
                    We could not analyze
                    this product
                  </h2>

                  <p
                    className={
                      styles.sectionDescription
                    }
                  >
                    {analysisMessage}
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.bottomActions
                }
              >
                <button
                  type="button"
                  className={`${styles.button} ${styles.secondaryButton}`}
                  onClick={() => {
                    setProgress({
                      stage: "idle",
                      progress: 0,
                      message:
                        "Add product images to begin.",
                    });

                    setAnalysisMessage(
                      null,
                    );
                  }}
                >
                  Back to Images
                </button>

                <button
                  type="button"
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={
                    startAnalysis
                  }
                >
                  Try Again
                </button>
              </div>
            </section>
          )}

        {!processing &&
          progress.stage ===
            "complete" &&
          analysis && (
            <section
              className={`${styles.card} ${styles.resultCard}`}
            >
              <div
                className={
                  styles.resultHeader
                }
              >
                <div>
                  <div
                    className={toneClass(
                      "resultStatus",
                      tone,
                    )}
                  >
                    {statusCopy.icon}{" "}
                    {statusCopy.label}
                  </div>

                  <h2
                    className={
                      styles.sectionTitle
                    }
                  >
                    Scan processed
                    successfully
                  </h2>

                  <p
                    className={
                      styles.sectionDescription
                    }
                  >
                    Scan ID:{" "}
                    {analysis.scanId}
                  </p>
                </div>
              </div>

              {analysisMessage && (
                <div
                  className={
                    styles.infoBox
                  }
                >
                  <span
                    className={
                      styles.infoIcon
                    }
                  >
                    i
                  </span>

                  <span>
                    {analysisMessage}
                  </span>
                </div>
              )}

              <div
                className={
                  styles.preliminarySummary
                }
              >
                <div
                  className={toneClass(
                    "scoreCard",
                    tone,
                  )}
                >
                  <div
                    className={
                      styles.scoreLabel
                    }
                  >
                    Preliminary Evidence Score
                  </div>

                  <div
                    className={toneClass(
                      "scoreValue",
                      tone,
                    )}
                  >
                    {analysis.score ??
                      "—"}

                    {analysis.score !==
                      null && (
                      <span
                        className={
                          styles.scoreSuffix
                        }
                      >
                        /100
                      </span>
                    )}
                  </div>

                  <div
                    className={
                      styles.scoreDescription
                    }
                  >
                    Based on extracted label
                    evidence and extraction
                    confidence. This is not a
                    legal compliance score.
                  </div>
                </div>

                <div
                  className={toneClass(
                    "statusCard",
                    tone,
                  )}
                >
                  <div
                    className={
                      styles.scoreLabel
                    }
                  >
                    Preliminary Status
                  </div>

                  <div
                    className={
                      styles.statusValue
                    }
                  >
                    {analysis.result ===
                    "COMPLIANT"
                      ? "✓ Evidence appears complete"
                      : analysis.result ===
                          "INCOMPLETE"
                        ? "— Evidence incomplete"
                        : "⚠ Manual review recommended"}
                  </div>

                  <div
                    className={
                      styles.scoreDescription
                    }
                  >
                    {analysis.result ===
                    "COMPLIANT"
                      ? "The available label evidence was successfully extracted."
                      : analysis.result ===
                          "INCOMPLETE"
                        ? "Important required fields could not be extracted."
                        : "Some evidence is missing or has limited confidence."}
                  </div>
                </div>
              </div>

              {analysis.checks.length >
                0 && (
                <div
                  className={
                    styles.checksSection
                  }
                >
                  <div
                    className={
                      styles.checksHeader
                    }
                  >
                    <div>
                      <h3
                        className={
                          styles.checksTitle
                        }
                      >
                        Label Evidence Breakdown
                      </h3>

                      <p
                        className={
                          styles.checksDescription
                        }
                      >
                        These checks describe
                        what was detected in the
                        submitted images. They are
                        not legal findings.
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.checksList
                    }
                  >
                    {analysis.checks.map(
                      (check) => (
                        <div
                          key={
                            check.id
                          }
                          className={
                            styles.checkRow
                          }
                        >
                          <div
                            className={`${styles.checkIcon} ${
                              check.status ===
                              "PASS"
                                ? styles.checkPass
                                : check.status ===
                                    "NEEDS_REVIEW"
                                  ? styles.checkReview
                                  : styles.checkUnavailable
                            }`}
                            aria-hidden="true"
                          >
                            {check.status ===
                            "PASS"
                              ? "✓"
                              : check.status ===
                                  "NEEDS_REVIEW"
                                ? "!"
                                : "—"}
                          </div>

                          <div
                            className={
                              styles.checkContent
                            }
                          >
                            <div
                              className={
                                styles.checkTopRow
                              }
                            >
                              <strong
                                className={
                                  styles.checkLabel
                                }
                              >
                                {check.label}
                              </strong>

                              <span
                                className={`${styles.checkStatus} ${
                                  check.status ===
                                  "PASS"
                                    ? styles.checkStatusPass
                                    : check.status ===
                                        "NEEDS_REVIEW"
                                      ? styles.checkStatusReview
                                      : styles.checkStatusUnavailable
                                }`}
                              >
                                {check.status ===
                                "PASS"
                                  ? "PASS"
                                  : check.status ===
                                      "NEEDS_REVIEW"
                                    ? "NEEDS REVIEW"
                                    : "NOT AVAILABLE"}
                              </span>
                            </div>

                            <p
                              className={
                                styles.checkMessage
                              }
                            >
                              {check.message}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {analysis.warnings.length >
                0 && (
                <div
                  className={
                    styles.warningSection
                  }
                >
                  <h3
                    className={
                      styles.warningTitle
                    }
                  >
                    Review Notes
                  </h3>

                  <ul
                    className={
                      styles.warningList
                    }
                  >
                    {analysis.warnings.map(
                      (
                        warning,
                        index,
                      ) => (
                        <li
                          key={`${warning}-${index}`}
                        >
                          {warning}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}

              <div
                className={
                  styles.extractedSection
                }
              >
                <h3
                  className={
                    styles.extractedTitle
                  }
                >
                  Extracted Product Information
                </h3>

                <div
                  className={
                    styles.extractedGrid
                  }
                >
                  {Object.entries(
                    analysis.product ?? {},
                  ).map(
                    ([key, field]) => {
                      const label = key
                        .replace(
                          /([A-Z])/g,
                          " $1",
                        )
                        .replace(
                          /^./,
                          (value) =>
                            value.toUpperCase(),
                        );

                      const value =
                        field?.value ??
                        field?.rawValue ??
                        null;

                      return (
                        <div
                          key={key}
                          className={
                            styles.extractedField
                          }
                        >
                          <span
                            className={
                              styles.extractedLabel
                            }
                          >
                            {label}
                          </span>

                          <span
                            className={
                              value
                                ? styles.extractedValue
                                : styles.extractedMissing
                            }
                          >
                            {value ??
                              "Not detected"}
                          </span>

                          {field?.confidence !==
                            null &&
                            field?.confidence !==
                              undefined && (
                              <span
                                className={
                                  styles.confidence
                                }
                              >
                                {Math.round(
                                  field.confidence *
                                    100,
                                )}
                                % confidence
                              </span>
                            )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <p
                className={
                  styles.disclaimer
                }
              >
                {analysis.disclaimer}
              </p>

              <div
                className={
                  styles.bottomActions
                }
              >
                <span
                  className={
                    styles.imageCount
                  }
                >
                  OCR:{" "}
                  {analysis.providerStatus ===
                  "LIVE"
                    ? "Live"
                    : "Not configured"}{" "}
                  · AI:{" "}
                  {analysis.providerStatus ===
                  "LIVE"
                    ? "Live"
                    : "Not configured"}
                </span>

                <div
                  className={
                    styles.actions
                  }
                >
                  <button
                    type="button"
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={
                      handleReportIssue
                    }
                  >
                    Report Issue
                  </button>

                  <button
                    type="button"
                    className={`${styles.button} ${styles.primaryButton}`}
                    onClick={
                      resetScan
                    }
                  >
                    Scan Another Product
                  </button>
                </div>
              </div>
            </section>
          )}
      </div>

      {cameraOpen && (
        <div
          className={
            styles.cameraModal
          }
        >
          <div
            className={
              styles.cameraDialog
            }
          >
            <div
              className={
                styles.cameraHeader
              }
            >
              <div>
                <h2
                  className={
                    styles.cameraTitle
                  }
                >
                  Capture Product Image
                </h2>

                <p
                  className={
                    styles.cameraDescription
                  }
                >
                  Position the product
                  label clearly inside the
                  camera view.
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.cameraClose
                }
                onClick={
                  closeCamera
                }
                aria-label="Close camera"
              >
                ×
              </button>
            </div>

            <div
              className={
                styles.cameraViewport
              }
            >
              <video
                ref={
                  cameraVideoRef
                }
                autoPlay
                playsInline
                muted
                className={
                  styles.cameraVideo
                }
              />

              <div
                className={
                  styles.cameraGuide
                }
              />
            </div>

            {cameraError && (
              <div
                className={
                  styles.cameraError
                }
              >
                {cameraError}
              </div>
            )}

            <div
              className={
                styles.cameraActions
              }
            >
              <button
                type="button"
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={
                  closeCamera
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={
                  capturePhoto
                }
              >
                📷 Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}