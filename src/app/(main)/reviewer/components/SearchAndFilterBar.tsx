"use client";

import React, { useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { FilterState } from "../types";

interface SearchAndFilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  reportCounts: {
    all: number;
    pending: number;
    assignedToMe: number;
    underReview: number;
    needInfo: number;
    verified: number;
    rejected: number;
    forwarded: number;
  };
}

export default function SearchAndFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  reportCounts,
}: SearchAndFilterBarProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const statusTabs = [
    { id: "ALL", label: "All Reports", count: reportCounts.all },
    { id: "PENDING_REVIEW", label: "Pending Review", count: reportCounts.pending, badgeColor: "bg-[#DC2626] text-white" },
    { id: "ASSIGNED_TO_ME", label: "Assigned to Me", count: reportCounts.assignedToMe, badgeColor: "bg-[#1769AA] text-white" },
    { id: "UNDER_REVIEW", label: "Under Review", count: reportCounts.underReview },
    { id: "NEED_MORE_INFORMATION", label: "Need More Info", count: reportCounts.needInfo, badgeColor: "bg-[#F59E0B] text-[#92400E]" },
    { id: "VERIFIED", label: "Verified", count: reportCounts.verified, badgeColor: "bg-[#16A34A] text-white" },
    { id: "REJECTED", label: "Rejected", count: reportCounts.rejected },
    { id: "FORWARDED_TO_INSPECTOR", label: "Forwarded", count: reportCounts.forwarded },
  ];

  const issueTypes = [
    { id: "ALL", label: "All Issue Types" },
    { id: "INCORRECT_WEIGHT", label: "Incorrect Weight / Quantity" },
    { id: "DUAL_MRP", label: "Dual / Overwritten MRP" },
    { id: "DATE_DECLARATION_MISSING", label: "Missing Mfg/Expiry Date" },
    { id: "COUNTRY_OF_ORIGIN_MISSING", label: "Missing Country of Origin" },
    { id: "NON_STANDARD_UNIT", label: "Non-Standard Pack Size" },
    { id: "MISSING_MFR_DETAILS", label: "Missing Manufacturer Details" },
    { id: "CONSUMER_CARE_ABSENT", label: "Missing Consumer Care Helpline" },
    { id: "DEFACED_LABEL", label: "Defaced / Smudged Label" },
  ];

  const priorityOptions = [
    { id: "ALL", label: "All Priorities" },
    { id: "HIGH", label: "High Priority (Urgent)" },
    { id: "MEDIUM", label: "Medium Priority" },
    { id: "LOW", label: "Low Priority" },
  ];

  const locations = [
    { id: "ALL", label: "All Locations" },
    { id: "Ludhiana", label: "Ludhiana, Punjab" },
    { id: "Mumbai", label: "Mumbai, Maharashtra" },
    { id: "New Delhi", label: "New Delhi, Delhi" },
    { id: "Bengaluru", label: "Bengaluru, Karnataka" },
    { id: "Jaipur", label: "Jaipur, Rajasthan" },
    { id: "Lucknow", label: "Lucknow, Uttar Pradesh" },
    { id: "Ahmedabad", label: "Ahmedabad, Gujarat" },
    { id: "Chandigarh", label: "Chandigarh (UT)" },
  ];

  const categories = [
    { id: "ALL", label: "All Categories" },
    { id: "Edible Oils & Foods", label: "Edible Oils & Foods" },
    { id: "Grains & Cereals", label: "Grains & Cereals" },
    { id: "Imported Foods & Confectionery", label: "Imported Foods" },
    { id: "Household & Cleaning Goods", label: "Household & Cleaning" },
    { id: "Cosmetics & Personal Care", label: "Cosmetics & Personal Care" },
    { id: "Beverages & Water", label: "Beverages & Water" },
    { id: "Packaged Foods & Dry Fruits", label: "Packaged Foods & Dry Fruits" },
  ];

  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.issueType !== "ALL" ||
    filters.priority !== "ALL" ||
    filters.location !== "ALL" ||
    filters.category !== "ALL" ||
    filters.assignedToMeOnly;

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-[#D9E2EC] p-4 space-y-3">
      {/* Search Input and Filter Drawer Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input with icons */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627D98]" />
          <input
            type="text"
            placeholder="Search Report ID (CR-2026-...), Product, Brand, Shop, or City..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 bg-[#F7FAFC] border border-[#D9E2EC] rounded-lg text-sm text-[#102A43] placeholder-[#627D98] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769AA]/40 focus:border-[#1769AA] transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#627D98] hover:text-[#102A43]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle & Reset Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
              showAdvancedFilters || hasActiveFilters
                ? "bg-[#EAF4FF] text-[#1769AA] border-[#1769AA]/30"
                : "bg-white text-[#627D98] border-[#D9E2EC] hover:text-[#102A43] hover:bg-[#F7FAFC]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#1769AA]" />
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showAdvancedFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Reset all filters"
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-[#627D98] hover:text-[#DC2626] hover:bg-[#FEE2E2]/50 border border-[#D9E2EC] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar border-b border-[#D9E2EC]/70 pb-2">
        {statusTabs.map((tab) => {
          const isActive = filters.statusTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange({ statusTab: tab.id })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#0B1F33] text-white shadow-2xs font-semibold"
                  : "text-[#627D98] hover:text-[#102A43] hover:bg-[#F7FAFC]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : tab.badgeColor || "bg-[#F1F5F9] text-[#627D98]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Dropdowns */}
      {showAdvancedFilters && (
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#F8FAFC] p-3 rounded-lg border border-[#D9E2EC]">
          {/* Issue Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#627D98] uppercase tracking-wider mb-1">
              Legal Metrology Issue
            </label>
            <select
              value={filters.issueType}
              onChange={(e) => onFilterChange({ issueType: e.target.value })}
              className="w-full text-xs bg-white border border-[#D9E2EC] rounded-md px-2.5 py-1.5 text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
            >
              {issueTypes.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#627D98] uppercase tracking-wider mb-1">
              Urgency Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => onFilterChange({ priority: e.target.value })}
              className="w-full text-xs bg-white border border-[#D9E2EC] rounded-md px-2.5 py-1.5 text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
            >
              {priorityOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#627D98] uppercase tracking-wider mb-1">
              Jurisdiction / City
            </label>
            <select
              value={filters.location}
              onChange={(e) => onFilterChange({ location: e.target.value })}
              className="w-full text-xs bg-white border border-[#D9E2EC] rounded-md px-2.5 py-1.5 text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#627D98] uppercase tracking-wider mb-1">
              Commodity Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="w-full text-xs bg-white border border-[#D9E2EC] rounded-md px-2.5 py-1.5 text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-[#627D98]">
          <span className="text-[11px] font-medium">Active filters:</span>
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF4FF] text-[#1769AA] border border-[#1769AA]/20">
              Keyword: "{filters.searchQuery}"
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFilterChange({ searchQuery: "" })}
              />
            </span>
          )}
          {filters.issueType !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#102A43] border border-[#D9E2EC]">
              Issue: {filters.issueType.replace(/_/g, " ")}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFilterChange({ issueType: "ALL" })}
              />
            </span>
          )}
          {filters.priority !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#102A43] border border-[#D9E2EC]">
              Priority: {filters.priority}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFilterChange({ priority: "ALL" })}
              />
            </span>
          )}
          {filters.location !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#102A43] border border-[#D9E2EC]">
              City: {filters.location}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFilterChange({ location: "ALL" })}
              />
            </span>
          )}
          {filters.category !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#102A43] border border-[#D9E2EC]">
              Category: {filters.category}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFilterChange({ category: "ALL" })}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
