"use client";

import React, { useState, useMemo } from "react";
import {
  MOCK_REPORTS,
  MOCK_REVIEWER_STATS,
} from "../mock-data";
import {
  CitizenReportItem,
  FilterState,
  DecisionPayload,
  ReviewerStats,
} from "../types";
import ReviewerHeader from "./ReviewerHeader";
import ReviewerSubNav, { NavTab } from "./ReviewerSubNav";
import StatsCards from "./StatsCards";
import SearchAndFilterBar from "./SearchAndFilterBar";
import ReviewQueue from "./ReviewQueue";
import AssignedToMeSection from "./AssignedToMeSection";
import IssueTypeChart from "./IssueTypeChart";
import StatusOverview from "./StatusOverview";
import RecentReviews from "./RecentReviews";
import RecentActivity from "./RecentActivity";
import ReportReviewModal from "./ReportReviewModal";
import { CheckCircle2 } from "lucide-react";

interface ReviewerDashboardProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export default function ReviewerDashboard({ user }: ReviewerDashboardProps) {
  const [reports, setReports] = useState<CitizenReportItem[]>(MOCK_REPORTS);
  const [stats, setStats] = useState<ReviewerStats>(MOCK_REVIEWER_STATS);
  const [activeNavTab, setActiveNavTab] = useState<NavTab>("dashboard");
  const [selectedReport, setSelectedReport] =
    useState<CitizenReportItem | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "info" | "warning";
  } | null>(null);

  const showToast = (text: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    statusTab: "ALL",
    issueType: "ALL",
    priority: "ALL",
    dateRange: "ALL",
    location: "ALL",
    category: "ALL",
    assignedToMeOnly: false,
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      statusTab: "ALL",
      issueType: "ALL",
      priority: "ALL",
      dateRange: "ALL",
      location: "ALL",
      category: "ALL",
      assignedToMeOnly: false,
    });
  };

  // Filtered reports logic
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // Search query
      if (filters.searchQuery.trim() !== "") {
        const query = filters.searchQuery.toLowerCase();
        const matchNumber = item.reportNumber.toLowerCase().includes(query);
        const matchProduct = item.productSnapshot.productName.toLowerCase().includes(query);
        const matchBrand = item.productSnapshot.brand.toLowerCase().includes(query);
        const matchShop = item.shopName.toLowerCase().includes(query);
        const matchCity = item.shopCity.toLowerCase().includes(query);
        const matchIssue = item.issueLabel.toLowerCase().includes(query);
        if (!matchNumber && !matchProduct && !matchBrand && !matchShop && !matchCity && !matchIssue) {
          return false;
        }
      }

      // Status tab
      if (filters.statusTab !== "ALL") {
        if (filters.statusTab === "ASSIGNED_TO_ME") {
          if (item.assignedReviewerId !== "rev-current") return false;
        } else if (item.status !== filters.statusTab) {
          return false;
        }
      }

      // Issue type
      if (filters.issueType !== "ALL" && item.issueType !== filters.issueType) {
        return false;
      }

      // Priority
      if (filters.priority !== "ALL" && item.priority !== filters.priority) {
        return false;
      }

      // Location
      if (filters.location !== "ALL" && !item.shopCity.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Category
      if (filters.category !== "ALL" && item.productSnapshot.category !== filters.category) {
        return false;
      }

      // Assigned to me toggle
      if (filters.assignedToMeOnly && item.assignedReviewerId !== "rev-current") {
        return false;
      }

      return true;
    });
  }, [reports, filters]);

  // Report counts for tabs
  const reportCounts = useMemo(() => {
    return {
      all: reports.length,
      pending: reports.filter((r) => r.status === "PENDING_REVIEW").length,
      assignedToMe: reports.filter((r) => r.assignedReviewerId === "rev-current").length,
      underReview: reports.filter((r) => r.status === "UNDER_REVIEW").length,
      needInfo: reports.filter((r) => r.status === "NEED_MORE_INFORMATION").length,
      verified: reports.filter((r) => r.status === "VERIFIED").length,
      rejected: reports.filter((r) => r.status === "REJECTED").length,
      forwarded: reports.filter((r) => r.status === "FORWARDED_TO_INSPECTOR").length,
    };
  }, [reports]);

  // Handle Review Decisions
  const handleSubmitDecision = (payload: DecisionPayload) => {
    let newStatus = selectedReport?.status || "UNDER_REVIEW";
    let actionLabel = "Review Decision Recorded";

    if (payload.decision === "VERIFY") {
      newStatus = "VERIFIED";
      actionLabel = "Report Verified under Legal Metrology Rules";
      setStats((prev) => ({
        ...prev,
        verifiedReports: prev.verifiedReports + 1,
        reviewedByMe: prev.reviewedByMe + 1,
        pendingReviews: Math.max(0, prev.pendingReviews - 1),
      }));
      showToast(`Report ${selectedReport?.reportNumber} marked as Verified.`, "success");
    } else if (payload.decision === "REJECT") {
      newStatus = "REJECTED";
      actionLabel = `Report Rejected: ${payload.rejectionReason?.replace(/_/g, " ")}`;
      setStats((prev) => ({
        ...prev,
        rejectedReports: prev.rejectedReports + 1,
        reviewedByMe: prev.reviewedByMe + 1,
        pendingReviews: Math.max(0, prev.pendingReviews - 1),
      }));
      showToast(`Report ${selectedReport?.reportNumber} rejected with justification.`, "warning");
    } else if (payload.decision === "NEED_MORE_INFO") {
      newStatus = "NEED_MORE_INFORMATION";
      actionLabel = "Additional Information Requested from Citizen";
      setStats((prev) => ({
        ...prev,
        needMoreInformation: prev.needMoreInformation + 1,
        pendingReviews: Math.max(0, prev.pendingReviews - 1),
      }));
      showToast(`Clarification request dispatched to Citizen for ${selectedReport?.reportNumber}.`, "info");
    } else if (payload.decision === "FORWARD_TO_INSPECTOR") {
      newStatus = "FORWARDED_TO_INSPECTOR";
      actionLabel = `Forwarded to ${payload.inspectorName || "District Inspector"}`;
      setStats((prev) => ({
        ...prev,
        forwardedToInspection: prev.forwardedToInspection + 1,
        reviewedByMe: prev.reviewedByMe + 1,
        pendingReviews: Math.max(0, prev.pendingReviews - 1),
      }));
      showToast(`Report ${selectedReport?.reportNumber} forwarded to ${payload.inspectorName || "Inspector"} for spot inspection.`, "success");
    }

    // Update report in state
    setReports((prevReports) =>
      prevReports.map((item) => {
        if (item.id === payload.reportId) {
          const updatedTimeline = [
            ...item.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: actionLabel,
              actor: user?.name || "Officer Sharma",
              actorRole: "Reviewer",
              previousStatus: item.status,
              newStatus: newStatus as any,
              details: payload.notes || payload.forwardingInstructions,
            },
          ];
          return {
            ...item,
            status: newStatus as any,
            timeline: updatedTimeline,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    setSelectedReport(null);
  };

  // Handle adding internal note
  const handleAddNote = (noteText: string) => {
    if (!selectedReport) return;

    const newNote = {
      id: `nt-${Date.now()}`,
      authorName: user?.name || "Officer Sharma",
      authorRole: "Reviewer",
      content: noteText,
      createdAt: new Date().toISOString(),
      isInternal: true,
    };

    setReports((prev) =>
      prev.map((item) => {
        if (item.id === selectedReport.id) {
          const updated = {
            ...item,
            reviewNotes: [newNote, ...item.reviewNotes],
          };
          setSelectedReport(updated);
          return updated;
        }
        return item;
      })
    );

    showToast("Internal review note saved to case dossier.", "success");
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#102A43] flex flex-col font-sans">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold ${
              toastMessage.type === "success"
                ? "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]"
                : toastMessage.type === "warning"
                ? "bg-[#FEE2E2] text-[#991B1B] border-[#F87171]"
                : "bg-[#EAF4FF] text-[#1769AA] border-[#1769AA]/40"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Reviewer Header */}
      <ReviewerHeader user={user} pendingCount={stats.pendingReviews} />

      {/* Reviewer Sub Navigation Tabs */}
      <ReviewerSubNav
        activeTab={activeNavTab}
        onTabChange={(tab) => setActiveNavTab(tab)}
        assignedCount={reportCounts.assignedToMe}
        pendingCount={stats.pendingReviews}
      />

      {/* Main Page Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Workload Statistics Cards (Always visible for quick situational awareness) */}
        <StatsCards
          stats={stats}
          selectedStatusTab={filters.statusTab}
          onFilterByStatus={(statusKey) => {
            handleFilterChange({ statusTab: statusKey });
            setActiveNavTab("dashboard");
          }}
        />

        {/* TAB 1: MAIN DASHBOARD & QUEUE VIEW */}
        {activeNavTab === "dashboard" && (
          <div className="space-y-6">
            {/* Search and Filters Area */}
            <SearchAndFilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              reportCounts={reportCounts}
            />

            {/* Pending & Filtered Workload Queue */}
            <ReviewQueue
              reports={filteredReports}
              onOpenReport={(rep) => setSelectedReport(rep)}
              title={
                filters.statusTab !== "ALL"
                  ? `${filters.statusTab.replace(/_/g, " ")} Reports`
                  : "Reviewer Triage Queue"
              }
            />

            {/* Visual Analytics Split Section: Issue Type & Status Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <StatusOverview
                  onSelectStatus={(statusKey) => {
                    handleFilterChange({ statusTab: statusKey });
                  }}
                />
              </div>
              <div className="lg:col-span-5">
                <IssueTypeChart
                  onSelectIssue={(issueKey) => {
                    handleFilterChange({ issueType: issueKey });
                  }}
                />
              </div>
            </div>

            {/* Bottom Split: Recent Reviews & Live Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentReviews
                onOpenReportById={(id) => {
                  const target = reports.find((r) => r.id === id);
                  if (target) setSelectedReport(target);
                }}
              />
              <RecentActivity />
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNED TO ME VIEW */}
        {activeNavTab === "assigned" && (
          <div className="space-y-6">
            <AssignedToMeSection
              reports={reports}
              onOpenReport={(rep) => setSelectedReport(rep)}
            />
            <ReviewQueue
              reports={reports.filter((r) => r.assignedReviewerId === "rev-current")}
              onOpenReport={(rep) => setSelectedReport(rep)}
              title="Detailed Workload Assigned to You"
              subtitle="All pending and in-progress cases allocated to Officer Sharma"
            />
          </div>
        )}

        {/* TAB 3: LEGAL METROLOGY ANALYTICS VIEW */}
        {activeNavTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-2xs border border-[#D9E2EC] p-5">
              <h2 className="text-base font-bold text-[#0B1F33]">
                Legal Metrology Compliance Analytics (Packaged Commodities 2011)
              </h2>
              <p className="text-xs text-[#627D98] mt-0.5">
                Workload throughput, violation patterns, and enforcement escalation metrics
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <StatusOverview
                  onSelectStatus={(statusKey) => {
                    handleFilterChange({ statusTab: statusKey });
                    setActiveNavTab("dashboard");
                  }}
                />
              </div>
              <div className="lg:col-span-5">
                <IssueTypeChart
                  onSelectIssue={(issueKey) => {
                    handleFilterChange({ issueType: issueKey });
                    setActiveNavTab("dashboard");
                  }}
                />
              </div>
            </div>

            <RecentReviews
              onOpenReportById={(id) => {
                const target = reports.find((r) => r.id === id);
                if (target) setSelectedReport(target);
              }}
            />
          </div>
        )}

        {/* TAB 4: RECENT ACTIVITY LOG VIEW */}
        {activeNavTab === "activity" && (
          <div className="space-y-6">
            <RecentActivity />
            <RecentReviews
              onOpenReportById={(id) => {
                const target = reports.find((r) => r.id === id);
                if (target) setSelectedReport(target);
              }}
            />
          </div>
        )}
      </main>

      {/* Full Feature Report Review Modal / Drawer */}
      {selectedReport && (
        <ReportReviewModal
          report={selectedReport}
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          onSubmitDecision={handleSubmitDecision}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  );
}
