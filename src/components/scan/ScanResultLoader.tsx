/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { getScanResult } from "@/actions/scan/scan.actions";
import ScanResult from "./ScanResult";
import { Loader2 } from "lucide-react";

type Props = {
  scanId: string;
  ocrResult?: any;
};

export default function ScanResultLoader({
  scanId,
  ocrResult,
}: Props) {
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadResult = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getScanResult(scanId);

        if (!active) {
          return;
        }

        if (
          !result.success ||
          !result.scan
        ) {
          setError(
            result.message ??
              "Failed to load scan result.",
          );
          return;
        }

        const databaseScan =
          result.scan;

        const mergedScan = {
          ...databaseScan,

          extractedData:
            ocrResult?.extracted_fields ??
            databaseScan.extractedData,

          analysisResult:
            ocrResult?.compliance ??
            databaseScan.analysisResult,

          rawOcrText:
            ocrResult?.ocr?.text ??
            databaseScan.rawOcrText,

          ocrConfidence:
            ocrResult?.ocr?.average_confidence ??
            databaseScan.ocrConfidence,

          ocrEngine:
            ocrResult?.ocr?.engine ??
            databaseScan.ocrEngine,

          ocrVersion:
            databaseScan.ocrVersion,

          preprocessingImages:
            ocrResult?.images ??
            [],
        };

        setScan(mergedScan);
      } catch (err) {
        console.error(
          "LOAD SCAN RESULT ERROR:",
          err,
        );

        if (active) {
          setError(
            "Failed to load scan result.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadResult();

    return () => {
      active = false;
    };
  }, [scanId, ocrResult]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-[#D9E2EC] bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1769AA]" />

          <p className="text-sm font-medium text-[#627D98]">
            Loading your compliance result...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] p-6 text-center">
        <p className="font-semibold text-[#B91C1C]">
          {error}
        </p>
      </div>
    );
  }

  if (!scan) {
    return null;
  }

  return (
    <ScanResult
      scan={scan}
    />
  );
}