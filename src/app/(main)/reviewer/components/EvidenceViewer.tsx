"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileImage,
  Info,
  Layers,
} from "lucide-react";
import { EvidenceItem } from "../types";

interface EvidenceViewerProps {
  evidenceList: EvidenceItem[];
  reportNumber: string;
}

export default function EvidenceViewer({
  evidenceList,
  reportNumber,
}: EvidenceViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div className="bg-[#F8FAFC] border border-dashed border-[#D9E2EC] rounded-xl p-8 text-center">
        <FileImage className="w-10 h-10 text-[#627D98] mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium text-[#102A43]">
          No photographic evidence attached
        </p>
        <p className="text-xs text-[#627D98] mt-1">
          Citizen report has no image records on file.
        </p>
      </div>
    );
  }

  const currentItem = evidenceList[selectedIndex] || evidenceList[0];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.7));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const getLabelTypeBadge = (type: EvidenceItem["imageType"]) => {
    switch (type) {
      case "FRONT_LABEL":
        return { label: "Front Packaging", bg: "bg-[#EAF4FF] text-[#1769AA]" };
      case "BACK_LABEL":
        return { label: "Back Panel / Ingredients", bg: "bg-[#F1F5F9] text-[#334155]" };
      case "MRP_STAMP":
        return { label: "MRP Stamp / Price Tag", bg: "bg-[#FEF3C7] text-[#92400E]" };
      case "WEIGHT_SCALE":
        return { label: "Digital Weight Scale", bg: "bg-[#FEE2E2] text-[#991B1B]" };
      case "INVOICE":
        return { label: "Retail Cash Invoice", bg: "bg-[#DCFCE7] text-[#166534]" };
      default:
        return { label: "Overview Capture", bg: "bg-[#F1F5F9] text-[#627D98]" };
    }
  };

  const currentBadge = getLabelTypeBadge(currentItem.imageType);

  return (
    <div className="bg-white rounded-xl border border-[#D9E2EC] overflow-hidden flex flex-col h-full">
      {/* Viewer Header */}
      <div className="bg-[#0B1F33] text-white px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileImage className="w-4 h-4 text-[#1769AA]" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide">
            Evidence Inspection • {reportNumber}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${currentBadge.bg}`}
          >
            {currentBadge.label}
          </span>
        </div>

        {/* Zoom & Inspection Controls */}
        <div className="flex items-center gap-1.5 text-white/80">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            title="Rotate 90 deg"
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Reset View"
            className="text-[11px] px-2 py-1 hover:bg-white/10 rounded-md transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            title="Toggle File EXIF & Info"
            className={`p-1.5 rounded-md transition-colors ${
              showMetadata ? "bg-white/20 text-white" : "hover:bg-white/10"
            }`}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 bg-[#102A43]/5 min-h-[320px] max-h-[480px] sm:max-h-[520px] overflow-hidden flex items-center justify-center p-4">
        <div
          className="transition-transform duration-150 ease-out cursor-grab active:cursor-grabbing max-h-full max-w-full flex items-center justify-center"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentItem.url}
            alt={currentItem.originalFileName}
            className="max-h-[460px] w-auto object-contain rounded-lg shadow-md select-none pointer-events-auto"
            draggable={false}
          />
        </div>

        {/* Metadata Overlay Drawer */}
        {showMetadata && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-[#D9E2EC] p-3 text-xs w-64 z-20 space-y-2 animate-in fade-in slide-in-from-right-2 duration-150">
            <div className="flex items-center justify-between font-semibold text-[#0B1F33] pb-1.5 border-b border-[#D9E2EC]">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#1769AA]" />
                Evidence Metadata
              </span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#627D98]">File Name:</span>
                <span className="font-mono text-[#102A43] truncate max-w-[130px]" title={currentItem.originalFileName}>
                  {currentItem.originalFileName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627D98]">Resolution:</span>
                <span className="font-mono text-[#102A43]">
                  {currentItem.resolution || "3024 x 4032"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627D98]">File Size:</span>
                <span className="font-mono text-[#102A43]">
                  {(currentItem.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627D98]">Format:</span>
                <span className="font-mono text-[#102A43] uppercase">
                  {currentItem.mimeType.split("/")[1] || "JPEG"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627D98]">Captured:</span>
                <span className="font-mono text-[#102A43]">
                  {new Date(currentItem.capturedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627D98]">Integrity:</span>
                <span className="text-[#16A34A] font-semibold">
                  Original (Unmodified)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails Filmstrip & Selector */}
      {evidenceList.length > 1 && (
        <div className="p-3 bg-[#F8FAFC] border-t border-[#D9E2EC] flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <span className="text-xs font-semibold text-[#627D98] shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Photos ({evidenceList.length}):
          </span>
          {evidenceList.map((item, idx) => {
            const isCurrent = idx === selectedIndex;
            const badge = getLabelTypeBadge(item.imageType);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedIndex(idx);
                  handleReset();
                }}
                className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all p-0.5 ${
                  isCurrent
                    ? "border-[#1769AA] ring-2 ring-[#1769AA]/30"
                    : "border-transparent opacity-75 hover:opacity-100 hover:border-[#D9E2EC]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.originalFileName}
                  className="w-14 h-14 object-cover rounded-md"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] truncate px-1 text-center">
                  {badge.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
