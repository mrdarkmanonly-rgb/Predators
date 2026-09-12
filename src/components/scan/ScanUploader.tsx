/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { processScanWithOCR } from "@/actions/scan/ocr.actions";
import { checkAndSaveImageQuality } from "@/actions/scan/quality.actions";
import { createScanWithImages } from "@/actions/scan/scan.actions";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  ScanLine,
  Sparkles,
  X,
  Zap
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";
import { toast } from "sonner";

type UploadedImage = {
  id?: string;
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  qualityScore?: number | null;
  qualityPassed?: boolean;
};

type ScanUploaderProps = {
  onScanComplete: (
    scanId: string,
    ocrResult: any,
  ) => void;
};

const floatingParticles = [
  {
    left: "8%",
    top: "18%",
    delay: 0,
    duration: 5,
  },
  {
    left: "18%",
    top: "72%",
    delay: 1.2,
    duration: 6,
  },
  {
    left: "31%",
    top: "32%",
    delay: 0.6,
    duration: 4.5,
  },
  {
    left: "48%",
    top: "82%",
    delay: 1.8,
    duration: 5.5,
  },
  {
    left: "63%",
    top: "22%",
    delay: 0.9,
    duration: 4,
  },
  {
    left: "76%",
    top: "67%",
    delay: 1.5,
    duration: 6,
  },
  {
    left: "88%",
    top: "30%",
    delay: 0.3,
    duration: 5,
  },
  {
    left: "94%",
    top: "78%",
    delay: 2,
    duration: 4.5,
  },
];

export default function ScanUploader({
  onScanComplete,
}: ScanUploaderProps) {
  const [images, setImages] = useState<
    UploadedImage[]
  >([]);

  const [saving, setSaving] =
    useState(false);

  const [scanCreated, setScanCreated] =
    useState(false);

  const [checkingQuality, setCheckingQuality] =
    useState(false);

  const [qualityCompleted, setQualityCompleted] =
    useState(false);

  const [processingOCR, setProcessingOCR] =
    useState(false);

  const handleUpload = (result: any) => {
    const info = result?.info;

    if (
      !info?.secure_url ||
      !info?.public_id
    ) {
      return;
    }

    const uploadedImage: UploadedImage = {
      publicId: info.public_id,
      secureUrl: info.secure_url,
      width: info.width,
      height: info.height,
      format: info.format,
      bytes: info.bytes,
    };

    setImages((current) => {
      if (current.length >= 4) {
        toast.warning(
          "Maximum 4 images allowed.",
        );

        return current;
      }

      const updatedImages = [
        ...current,
        uploadedImage,
      ];

      toast.success(
        `Image ${updatedImages.length} uploaded successfully.`,
      );

      return updatedImages;
    });
  };

  const removeImage = (
    publicId: string,
  ) => {
    if (scanCreated) {
      toast.warning(
        "This scan has already been saved.",
      );

      return;
    }

    setImages((current) =>
      current.filter(
        (image) =>
          image.publicId !== publicId,
      ),
    );

    toast.success("Image removed.");
  };

  const runQualityChecks = async (
    databaseImages: any[],
  ) => {
    if (!databaseImages.length) {
      return;
    }

    setCheckingQuality(true);

    toast.info(
      `Checking quality of ${databaseImages.length} image${
        databaseImages.length > 1
          ? "s"
          : ""
      }...`,
    );

    let passedCount = 0;
    let failedCount = 0;

    try {
      for (const databaseImage of databaseImages) {
        try {
          const result =
            await checkAndSaveImageQuality(
              databaseImage.id,
            );

          if (!result.success) {
            toast.error(
              `Quality check failed for ${databaseImage.imageType.toLowerCase()} image.`,
            );

            failedCount++;
            continue;
          }

          const quality = result.quality;

          setImages(
            (currentImages) =>
              currentImages.map(
                (image) => {
                  if (
                    image.id !==
                    databaseImage.id
                  ) {
                    return image;
                  }

                  return {
                    ...image,
                    qualityScore:
                      quality?.score,
                    qualityPassed:
                      quality?.passed,
                  };
                },
              ),
          );

          if (quality?.passed) {
            passedCount++;

            toast.success(
              `${databaseImage.imageType} image passed quality check (${quality.score}).`,
            );
          } else {
            failedCount++;

            toast.warning(
              `${databaseImage.imageType} image needs a better photo (${quality?.score}).`,
            );
          }
        } catch (error) {
          console.error(
            "INDIVIDUAL QUALITY ERROR:",
            error,
          );

          failedCount++;

          toast.error(
            `Could not check ${databaseImage.imageType.toLowerCase()} image.`,
          );
        }
      }

      setQualityCompleted(true);

      if (failedCount === 0) {
        toast.success(
          "All images passed the quality check. Ready for OCR.",
        );
      } else {
        toast.warning(
          `${passedCount} image${
            passedCount !== 1
              ? "s"
              : ""
          } passed and ${failedCount} need ${
            failedCount === 1
              ? "improvement"
              : "improvements"
          }.`,
        );
      }
    } finally {
      setCheckingQuality(false);
    }
  };

  const runOCR = async (
    scanId: string,
    scanImages: any[],
  ) => {
    if (
      !scanId ||
      !scanImages.length
    ) {
      toast.error(
        "Scan information is missing.",
      );

      return false;
    }

    try {
      setProcessingOCR(true);

      toast.info(
        "Starting OCR and compliance analysis...",
      );

      const ocrResult =
        await processScanWithOCR(
          scanId,
          scanImages.map((image) => ({
            publicId:
              image.cloudinaryPublicId,
            secureUrl:
              image.secureUrl,
            width:
              image.width ??
              undefined,
            height:
              image.height ??
              undefined,
            format:
              image.format ??
              undefined,
            bytes:
              image.bytes ??
              undefined,
          })),
        );

      if (!ocrResult.success) {
        toast.error(
          ocrResult.message ??
            "OCR processing failed.",
        );

        return false;
      }

      console.log(
        "OCR RESULT:",
        ocrResult,
      );

      onScanComplete(
        scanId,
        ocrResult,
      );

      toast.success(
        "OCR and compliance analysis completed.",
      );

      return true;
    } catch (error) {
      console.error(
        "OCR PROCESSING ERROR:",
        error,
      );

      toast.error(
        "Something went wrong while processing OCR.",
      );

      return false;
    } finally {
      setProcessingOCR(false);
    }
  };

  const saveScan = async () => {
    if (!images.length) {
      toast.warning(
        "Please upload at least one image.",
      );

      return;
    }

    if (scanCreated) {
      toast.info(
        "This scan has already been saved.",
      );

      return;
    }

    try {
      setSaving(true);

      toast.info(
        "Saving your scan...",
      );

      const result =
        await createScanWithImages(
          images,
        );

      if (!result.success) {
        toast.error(
          result.message ??
            "Failed to save scan.",
        );

        return;
      }

      const databaseImages =
        result.scan?.images ?? [];

      const scanId =
        result.scan?.id;

      if (!scanId) {
        toast.error(
          "Scan ID was not returned.",
        );

        return;
      }

      setImages(
        (currentImages) =>
          currentImages.map(
            (image) => {
              const databaseImage =
                databaseImages.find(
                  (dbImage: any) =>
                    dbImage.cloudinaryPublicId ===
                    image.publicId,
                );

              if (!databaseImage) {
                return image;
              }

              return {
                ...image,
                id: databaseImage.id,
                qualityScore:
                  databaseImage.qualityScore,
                qualityPassed:
                  databaseImage.qualityPassed,
              };
            },
          ),
      );

      setScanCreated(true);

      toast.success(
        "Scan saved successfully.",
      );

      console.log(
        "SCAN CREATED:",
        result.scan,
      );

      await runQualityChecks(
        databaseImages,
      );

      const ocrSuccess =
        await runOCR(
          scanId,
          databaseImages,
        );

      if (ocrSuccess) {
        toast.success(
          "Scan processing completed successfully.",
        );
      }
    } catch (error) {
      console.error(
        "SAVE SCAN ERROR:",
        error,
      );

      toast.error(
        "Something went wrong while processing the scan.",
      );
    } finally {
      setSaving(false);
    }
  };

  const isProcessing =
    saving ||
    checkingQuality ||
    processingOCR;

  return (
    <div className="space-y-6">
      <CldUploadWidget
        signatureEndpoint="/api/cloudinary/signature"
        uploadPreset="checkitright_scan"
        onSuccess={handleUpload}
        options={{
          multiple: true,
          maxFiles: 4,
          sources: ["local", "camera"],
          resourceType: "image",
          clientAllowedFormats: [
            "jpg",
            "jpeg",
            "png",
            "webp",
          ],
          maxFileSize: 10_000_000,
        }}
      >
        {({ open }) => (
          <motion.button
            type="button"
            onClick={() => open()}
            disabled={
              images.length >= 4 ||
              scanCreated
            }
            whileHover={
              !scanCreated
                ? {
                    scale: 1.008,
                  }
                : undefined
            }
            whileTap={
              !scanCreated
                ? {
                    scale: 0.995,
                  }
                : undefined
            }
            className="group relative flex min-h-[390px] w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-[#16A34A]/30 bg-[#07111F] px-6 py-12 text-center shadow-[0_20px_70px_rgba(0,0,0,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <motion.div
              animate={{
                x: [
                  "-100%",
                  "100%",
                ],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#22C55E]/10 to-transparent blur-2xl"
            />

            <motion.div
              animate={{
                backgroundPosition: [
                  "0px 0px",
                  "56px 56px",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(34,197,94,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.22)_1px,transparent_1px)] [background-size:28px_28px]"
            />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,163,74,0.12),transparent_55%)]" />

            {floatingParticles.map(
              (particle, index) => (
                <motion.span
                  key={index}
                  animate={{
                    y: [
                      0,
                      -18,
                      0,
                    ],
                    x: [
                      0,
                      index % 2 ===
                      0
                        ? 8
                        : -8,
                      0,
                    ],
                    opacity: [
                      0.15,
                      0.8,
                      0.15,
                    ],
                    scale: [
                      0.7,
                      1,
                      0.7,
                    ],
                  }}
                  transition={{
                    duration:
                      particle.duration,
                    delay:
                      particle.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    left:
                      particle.left,
                    top:
                      particle.top,
                  }}
                  className="absolute h-1.5 w-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_12px_rgba(74,222,128,0.8)]"
                />
              ),
            )}

            <div className="absolute left-5 top-5 h-8 w-8 border-l-2 border-t-2 border-[#22C55E]/60" />

            <div className="absolute right-5 top-5 h-8 w-8 border-r-2 border-t-2 border-[#22C55E]/60" />

            <div className="absolute bottom-5 left-5 h-8 w-8 border-b-2 border-l-2 border-[#22C55E]/60" />

            <div className="absolute bottom-5 right-5 h-8 w-8 border-b-2 border-r-2 border-[#22C55E]/60" />

            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute h-44 w-44 rounded-full border border-dashed border-[#16A34A]/20"
            />

            <motion.div
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute h-32 w-32 rounded-full border border-[#1769AA]/20"
            />

            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#4ADE80]/30 bg-[#0B2418]/80 shadow-[0_0_45px_rgba(34,197,94,0.18)] backdrop-blur-md">
              <motion.div
                animate={{
                  scale: [
                    1,
                    1.12,
                    1,
                  ],
                  opacity: [
                    0.7,
                    1,
                    0.7,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ScanLine className="h-9 w-9 text-[#4ADE80]" />
              </motion.div>
            </div>

            <motion.div
              animate={{
                y: [
                  -28,
                  28,
                  -28,
                ],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent shadow-[0_0_18px_rgba(74,222,128,0.8)]"
            />

            <h2 className="relative z-10 mt-7 text-2xl font-bold tracking-tight text-white">
              Upload Product Images
            </h2>

            <p className="relative z-10 mt-3 max-w-md text-sm leading-6 text-slate-400">
              Choose photos from your device
              or activate your camera. Add up
              to 4 images for a complete
              compliance scan.
            </p>

            <motion.span
              whileHover={{
                scale: 1.04,
              }}
              className="relative z-10 mt-6 inline-flex items-center gap-2 overflow-hidden rounded-xl border border-[#4ADE80]/30 bg-[#16A34A] px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(22,163,74,0.22)]"
            >
              <motion.span
                animate={{
                  x: [
                    "-150%",
                    "150%",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-y-0 w-1/3 bg-white/20 blur-sm"
              />

              {scanCreated ? (
                <CheckCircle2 className="relative h-4 w-4" />
              ) : (
                <ImagePlus className="relative h-4 w-4" />
              )}

              <span className="relative">
                {scanCreated
                  ? "Scan Saved"
                  : images.length >= 4
                    ? "Maximum Images Added"
                    : "Choose Images"}
              </span>
            </motion.span>

            <span className="relative z-10 mt-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              <Camera className="h-3.5 w-3.5" />
              JPG • JPEG • PNG • WEBP
            </span>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#4ADE80]/40">
              <span>AI</span>
              <span>•</span>
              <span>OCR</span>
              <span>•</span>
              <span>VERIFY</span>
            </div>
          </motion.button>
        )}
      </CldUploadWidget>

      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#4ADE80]" />

                  <h3 className="font-bold text-white">
                    Uploaded Images
                  </h3>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {images.length} of 4
                  images added
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {checkingQuality && (
                  <motion.span
                    animate={{
                      opacity: [
                        0.55,
                        1,
                        0.55,
                      ],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#60A5FA]/20 bg-[#60A5FA]/10 px-3 py-1.5 text-xs font-semibold text-[#60A5FA]"
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Checking Quality
                  </motion.span>
                )}

                {processingOCR && (
                  <motion.span
                    animate={{
                      opacity: [
                        0.55,
                        1,
                        0.55,
                      ],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#4ADE80]/20 bg-[#16A34A]/10 px-3 py-1.5 text-xs font-semibold text-[#4ADE80]"
                  >
                    <ScanLine className="h-3.5 w-3.5 animate-pulse" />
                    Processing OCR
                  </motion.span>
                )}

                {qualityCompleted &&
                  !checkingQuality &&
                  !processingOCR && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-3 py-1.5 text-xs font-semibold text-[#4ADE80]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Quality Check Complete
                    </span>
                  )}

                {!scanCreated && (
                  <motion.button
                    type="button"
                    onClick={saveScan}
                    disabled={
                      saving ||
                      images.length === 0
                    }
                    whileHover={{
                      y: -2,
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className="relative overflow-hidden rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_30px_rgba(22,163,74,0.2)] transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <motion.span
                      animate={{
                        x: [
                          "-150%",
                          "150%",
                        ],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-y-0 w-1/3 bg-white/20 blur-sm"
                    />

                    <span className="relative flex items-center gap-2">
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}

                      {saving
                        ? processingOCR
                          ? "Running OCR..."
                          : checkingQuality
                            ? "Checking Quality..."
                            : "Processing..."
                        : "Continue Scan"}
                    </span>
                  </motion.button>
                )}
              </div>
            </div>

            {isProcessing && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="mb-5 overflow-hidden rounded-[1.5rem] border border-[#22C55E]/20 bg-[#07111F] shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
              >
                {processingOCR ? (
                  <div className="relative overflow-hidden p-5 sm:p-6">
                    <motion.div
                      animate={{
                        x: ["-120%", "160%"],
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent shadow-[0_0_16px_#4ADE80]"
                    />

                    <motion.div
                      animate={{
                        backgroundPosition: [
                          "0px 0px",
                          "32px 32px",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(74,222,128,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.5)_1px,transparent_1px)] [background-size:16px_16px]"
                    />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,197,94,0.12),transparent_55%)]" />

                    <div className="relative z-10">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#4ADE80]/25 bg-[#16A34A]/10">
                            <motion.div
                              animate={{
                                rotate: 360,
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="absolute inset-1 rounded-xl border border-dashed border-[#4ADE80]/30"
                            />

                            <motion.div
                              animate={{
                                scale: [1, 1.12, 1],
                                opacity: [0.65, 1, 0.65],
                              }}
                              transition={{
                                duration: 1.6,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              <ScanLine className="h-6 w-6 text-[#4ADE80]" />
                            </motion.div>
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-black text-white">
                                Almost there...
                              </p>

                              <motion.span
                                animate={{
                                  opacity: [0.4, 1, 0.4],
                                }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                }}
                                className="h-2 w-2 rounded-full bg-[#4ADE80] shadow-[0_0_12px_#4ADE80]"
                              />
                            </div>

                            <p className="mt-1 text-sm text-slate-400">
                              Our AI is carefully reading the packaging and checking the details.
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              This can take a little while. Hang tight — your scan is still running.
                            </p>
                          </div>
                        </div>

                        <motion.div
                          animate={{
                            y: [0, -5, 0],
                            rotate: [-2, 2, -2],
                          }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="flex items-center gap-2 self-start rounded-2xl border border-[#F59E0B]/15 bg-[#F59E0B]/[0.06] px-4 py-2.5 text-sm font-bold text-[#FBBF24] sm:self-center"
                        >
                          <span>🧠</span>
                          <span>🤖</span>
                          <span>🔍</span>
                          <span>⚡</span>
                        </motion.div>
                      </div>

                      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#4ADE80]">
                            <Activity className="h-3.5 w-3.5" />
                            AI pipeline active
                          </div>

                          <motion.span
                            animate={{
                              opacity: [0.35, 1, 0.35],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                            }}
                            className="text-[10px] font-bold uppercase tracking-wider text-slate-600"
                          >
                            Processing...
                          </motion.span>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                          <motion.div
                            animate={{
                              x: ["-100%", "300%"],
                            }}
                            transition={{
                              duration: 1.6,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent shadow-[0_0_18px_rgba(74,222,128,0.9)]"
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <motion.div
                            animate={{
                              borderColor: [
                                "rgba(34,197,94,0.12)",
                                "rgba(34,197,94,0.45)",
                                "rgba(34,197,94,0.12)",
                              ],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                            className="rounded-xl border bg-[#16A34A]/[0.06] px-3 py-2.5"
                          >
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#4ADE80]">
                              ✓ OCR
                            </p>
                            <p className="mt-1 text-[10px] text-slate-600">
                              Reading label text
                            </p>
                          </motion.div>

                          <motion.div
                            animate={{
                              borderColor: [
                                "rgba(96,165,250,0.12)",
                                "rgba(96,165,250,0.45)",
                                "rgba(96,165,250,0.12)",
                              ],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: 0.5,
                            }}
                            className="rounded-xl border bg-[#1769AA]/[0.06] px-3 py-2.5"
                          >
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#60A5FA]">
                              ◉ ANALYSIS
                            </p>
                            <p className="mt-1 text-[10px] text-slate-600">
                              Extracting product data
                            </p>
                          </motion.div>

                          <motion.div
                            animate={{
                              borderColor: [
                                "rgba(245,158,11,0.12)",
                                "rgba(245,158,11,0.45)",
                                "rgba(245,158,11,0.12)",
                              ],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: 1,
                            }}
                            className="rounded-xl border bg-[#F59E0B]/[0.06] px-3 py-2.5"
                          >
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">
                              ◌ VERIFY
                            </p>
                            <p className="mt-1 text-[10px] text-slate-600">
                              Checking compliance rules
                            </p>
                          </motion.div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-slate-600 sm:justify-start">
                        <motion.span
                          animate={{
                            y: [0, -3, 0],
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            delay: 0,
                          }}
                        >
                          ☕ Grab a sip
                        </motion.span>

                        <span>•</span>

                        <motion.span
                          animate={{
                            y: [0, -3, 0],
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            delay: 0.25,
                          }}
                        >
                          🧘 Sit tight
                        </motion.span>

                        <span>•</span>

                        <motion.span
                          animate={{
                            y: [0, -3, 0],
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            delay: 0.5,
                          }}
                        >
                          🚀 Almost done
                        </motion.span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#4ADE80]/20 bg-[#16A34A]/10"
                        >
                          <ScanLine className="h-5 w-5 text-[#4ADE80]" />
                        </motion.div>

                        <div>
                          <p className="text-sm font-bold text-white">
                            {checkingQuality
                              ? "Analyzing image quality"
                              : "Preparing secure scan"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Please keep this window open
                          </p>
                        </div>
                      </div>

                      <motion.div
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                        className="h-2 w-2 rounded-full bg-[#4ADE80] shadow-[0_0_14px_#4ADE80]"
                      />
                    </div>

                    <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent shadow-[0_0_15px_rgba(74,222,128,0.8)]"
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div
                        className={`rounded-lg px-2 py-2 text-[10px] font-semibold uppercase tracking-wider ${
                          checkingQuality ||
                          qualityCompleted
                            ? "bg-[#16A34A]/10 text-[#4ADE80]"
                            : "bg-white/[0.03] text-slate-600"
                        }`}
                      >
                        Quality
                      </div>

                      <div
                        className={`rounded-lg px-2 py-2 text-[10px] font-semibold uppercase tracking-wider ${
                          processingOCR
                            ? "bg-[#1769AA]/15 text-[#60A5FA]"
                            : "bg-white/[0.03] text-slate-600"
                        }`}
                      >
                        OCR
                      </div>

                      <div
                        className={`rounded-lg px-2 py-2 text-[10px] font-semibold uppercase tracking-wider ${
                          processingOCR
                            ? "bg-[#F59E0B]/10 text-[#FBBF24]"
                            : "bg-white/[0.03] text-slate-600"
                        }`}
                      >
                        Compliance
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AnimatePresence>
                {images.map(
                  (image, index) => (
                    <motion.div
                      key={image.publicId}
                      initial={{
                        opacity: 0,
                        y: 25,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                      }}
                      transition={{
                        duration: 0.45,
                        delay:
                          index * 0.08,
                      }}
                      whileHover={{
                        y: -5,
                      }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1728] shadow-[0_15px_40px_rgba(0,0,0,0.2)]"
                    >
                      <div className="absolute inset-0 z-10 pointer-events-none">
                        <motion.div
                          animate={{
                            x: [
                              "-120%",
                              "120%",
                            ],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay:
                              index *
                              0.4,
                            ease: "linear",
                          }}
                          className="absolute top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-[#4ADE80]/10 to-transparent blur-xl"
                        />
                      </div>

                      <div className="relative aspect-square overflow-hidden bg-[#07111F]">
                        <img
                          src={
                            image.secureUrl
                          }
                          alt={`Product image ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#07111F]/80 via-transparent to-transparent" />

                        <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                          IMG {index + 1}
                        </div>

                        {!scanCreated && (
                          <button
                            type="button"
                            onClick={() =>
                              removeImage(
                                image.publicId,
                              )
                            }
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-slate-300 backdrop-blur-md transition hover:bg-[#DC2626]/80 hover:text-white"
                            aria-label={`Remove image ${
                              index + 1
                            }`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}

                        <motion.div
                          animate={{
                            opacity: [
                              0.25,
                              0.8,
                              0.25,
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay:
                              index *
                              0.3,
                          }}
                          className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_10px_#4ADE80]"
                        />
                      </div>

                      <div className="space-y-2 p-3">
                        {image.qualityPassed ===
                          true && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              x: -8,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            className="flex items-center justify-between rounded-lg border border-[#22C55E]/10 bg-[#16A34A]/10 px-3 py-2"
                          >
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4ADE80]">
                              <CheckCircle2 className="h-4 w-4" />
                              Good Quality
                            </span>

                            <span className="text-xs font-bold text-[#4ADE80]">
                              {
                                image.qualityScore
                              }
                            </span>
                          </motion.div>
                        )}

                        {image.qualityPassed ===
                          false && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              x: -8,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            className="flex items-center justify-between rounded-lg border border-[#F59E0B]/10 bg-[#F59E0B]/10 px-3 py-2"
                          >
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#FBBF24]">
                              <AlertTriangle className="h-4 w-4" />
                              Needs Better Photo
                            </span>

                            <span className="text-xs font-bold text-[#FBBF24]">
                              {
                                image.qualityScore
                              }
                            </span>
                          </motion.div>
                        )}

                        {scanCreated &&
                          image.qualityPassed ===
                            undefined && (
                            <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-500">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Checking quality...
                            </div>
                          )}
                      </div>
                    </motion.div>
                  ),
                )}
              </AnimatePresence>
            </div>

            {qualityCompleted && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-5 rounded-2xl border border-white/10 bg-[#0B1728] p-5"
              >
                {images.every(
                  (image) =>
                    image.qualityPassed ===
                    true,
                ) ? (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl border border-[#22C55E]/10 bg-[#16A34A]/10 p-2 text-[#4ADE80]">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div>
                      <h4 className="font-bold text-white">
                        Images are ready for OCR
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        All uploaded images passed
                        the initial quality gate.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl border border-[#F59E0B]/10 bg-[#F59E0B]/10 p-2 text-[#FBBF24]">
                      <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div>
                      <h4 className="font-bold text-white">
                        Some images need improvement
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        A better image may improve
                        OCR accuracy. We can continue
                        with the usable images or retake
                        the affected photos.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}