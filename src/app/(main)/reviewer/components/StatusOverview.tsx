"use client";

import React from "react";
import {
  GitCommit,
  Clock,
  Eye,
  ArrowRightCircle,
  ShieldCheck,
} from "lucide-react";

interface StatusOverviewProps {
  onSelectStatus?: (status: string) => void;
}

export default function StatusOverview({ onSelectStatus }: StatusOverviewProps) {
  const steps = [
    {
      id: "SUBMITTED",
      label: "Submitted",
      count: 18,
      icon: GitCommit,
      color: "bg-[#627D98] text-white",
      desc: "Fresh citizen reports",
    },
    {
      id: "PENDING_REVIEW",
      label: "Pending Review",
      count: 24,
      icon: Clock,
      color: "bg-[#F59E0B] text-white",
      desc: "Awaiting triage",
    },
    {
      id: "UNDER_REVIEW",
      label: "Under Review",
      count: 12,
      icon: Eye,
      color: "bg-[#1769AA] text-white",
      desc: "Actively examined",
    },
    {
      id: "OUTCOMES",
      label: "Decisions (3 Paths)",
      count: 51,
      icon: ShieldCheck,
      color: "bg-[#0B1F33] text-white",
      desc: "Verified / Info / Reject",
      subItems: [
        { id: "VERIFIED", label: "Verified (38)", color: "text-[#16A34A]" },
        { id: "NEED_MORE_INFORMATION", label: "Need Info (6)", color: "text-[#D97706]" },
        { id: "REJECTED", label: "Rejected (7)", color: "text-[#DC2626]" },
      ],
    },
    {
      id: "FORWARDED_TO_INSPECTOR",
      label: "Forwarded to Inspector",
      count: 14,
      icon: ArrowRightCircle,
      color: "bg-[#0B1F33] text-white",
      desc: "Physical field action",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-[#D9E2EC] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
        <div>
          <h3 className="text-sm font-bold text-[#0B1F33] tracking-tight">
            Statutory Review Workflow & Status Distribution
          </h3>
          <p className="text-xs text-[#627D98]">
            Legal Metrology compliance lifecycle from citizen submission to field enforcement
          </p>
        </div>
      </div>

      {/* Visual Pipeline Horizontal Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              onClick={() => {
                if (step.id !== "OUTCOMES" && onSelectStatus) {
                  onSelectStatus(step.id);
                }
              }}
              className={`p-3 rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] transition-all relative ${
                step.id !== "OUTCOMES"
                  ? "cursor-pointer hover:bg-white hover:border-[#1769AA] hover:shadow-2xs"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${step.color} shadow-2xs`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-[#0B1F33] font-mono">
                  {step.count}
                </span>
              </div>

              <h4 className="text-xs font-bold text-[#102A43]">
                {step.label}
              </h4>
              <p className="text-[10px] text-[#627D98] mt-0.5">
                {step.desc}
              </p>

              {step.subItems && (
                <div className="mt-2 pt-2 border-t border-[#D9E2EC]/60 space-y-0.5 text-[10px] font-semibold">
                  {step.subItems.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectStatus) onSelectStatus(sub.id);
                      }}
                      className={`cursor-pointer hover:underline ${sub.color}`}
                    >
                      • {sub.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Workflow Rule Note */}
      <div className="bg-[#EAF4FF]/40 border border-[#1769AA]/20 rounded-lg p-2.5 text-xs text-[#1769AA] flex items-center justify-between">
        <span className="text-[11px] font-medium">
          Workflow strictly adheres to: SUBMITTED → PENDING_REVIEW → UNDER_REVIEW → (VERIFIED | NEED_MORE_INFO | REJECTED) → FORWARDED_TO_INSPECTOR
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B1F33] hidden md:inline">
          CheckItRight Protocol
        </span>
      </div>
    </div>
  );
}
