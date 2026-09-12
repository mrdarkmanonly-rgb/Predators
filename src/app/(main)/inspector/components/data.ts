// -------------------------------------------------------
// Inspector Dashboard — Dummy Data
// Backend connect karte waqt SIRF yeh file replace karni hai.
// Har component isi se data import karta hai.
// -------------------------------------------------------

export type StatTone = "blue" | "amber" | "green" | "red" | "navy";

export const STATS = [
  { id: "assigned",     label: "Assigned Cases",       value: 18, delta: "+2 since yesterday", trend: "up"   as const, tone: "blue"  as StatTone },
  { id: "pending",      label: "Pending Inspections",  value: 7,  delta: "Awaiting visit",     trend: "down" as const, tone: "amber" as StatTone },
  { id: "in-progress",  label: "In Progress",          value: 3,  delta: "Currently active",   trend: "up"   as const, tone: "blue"  as StatTone },
  { id: "completed",    label: "Completed",            value: 21, delta: "This month",         trend: "up"   as const, tone: "green" as StatTone },
  { id: "violations",   label: "Verified Violations",  value: 9,  delta: "+33%",               trend: "up"   as const, tone: "red"   as StatTone },
  { id: "actions",      label: "Actions Taken",        value: 11, delta: "+22%",               trend: "up"   as const, tone: "navy"  as StatTone },
];[
  {
    id: "assigned",
    label: "Assigned Cases",
    value: 18,
    delta: "+2 since yesterday",
    trend: "up" as const,
    tone: "blue" as StatTone,
  },
  {
    id: "pending",
    label: "Pending Inspections",
    value: 7,
    delta: "Awaiting visit",
    trend: "down" as const,
    tone: "amber" as StatTone,
  },
  {
    id: "in-progress",
    label: "In Progress",
    value: 3,
    delta: "Currently active",
    trend: "up" as const,
    tone: "violet" as StatTone,
  },
  {
    id: "completed",
    label: "Completed",
    value: 21,
    delta: "This month",
    trend: "up" as const,
    tone: "green" as StatTone,
  },
  {
    id: "violations",
    label: "Verified Violations",
    value: 9,
    delta: "+33%",
    trend: "up" as const,
    tone: "red" as StatTone,
  },
  {
    id: "actions",
    label: "Actions Taken",
    value: 11,
    delta: "+22%",
    trend: "up" as const,
    tone: "teal" as StatTone,
  },
];

// -------------------------------------------------------
// Today's Schedule
// -------------------------------------------------------

export type ScheduleStatus = "Assigned" | "In Progress" | "Pending";

export const TODAY_SCHEDULE = [
  {
    id: "CR-2025-0842",
    time: "10:00 AM",
    product: "Parle-G Biscuits (100g)",
    shop: "Sharma General Store, Connaught Place",
    status: "Assigned" as ScheduleStatus,
  },
  {
    id: "CR-2025-0845",
    time: "12:00 PM",
    product: "Coca-Cola (500ml)",
    shop: "Verma Mart, Karol Bagh",
    status: "In Progress" as ScheduleStatus,
  },
  {
    id: "CR-2025-0847",
    time: "02:30 PM",
    product: "Amul Butter (100g)",
    shop: "City Mart, Lajpat Nagar",
    status: "Pending" as ScheduleStatus,
  },
  {
    id: "CR-2025-0851",
    time: "04:00 PM",
    product: "Tata Salt (1kg)",
    shop: "Gupta Store, Saket",
    status: "Assigned" as ScheduleStatus,
  },
];

// -------------------------------------------------------
// Cases by Status (donut)
// -------------------------------------------------------

export const CASES_BY_STATUS = {
  total: 49,
  segments: [
    { label: "Assigned", value: 18, color: "#1769AA" },
    { label: "In Progress", value: 8, color: "#F59E0B" },
    { label: "Completed", value: 21, color: "#16A34A" },
    { label: "Escalated", value: 2, color: "#DC2626" },
  ],
};

// -------------------------------------------------------
// Inspections by Issue Type (bars)
// -------------------------------------------------------

export const INSPECTIONS_BY_ISSUE = [
  { label: "Incorrect Weight", value: 28, color: "#1769AA" },
  { label: "Misleading Label", value: 12, color: "#16A34A" },
  { label: "Expired Product", value: 8, color: "#F59E0B" },
  { label: "Price Mismatch", value: 6, color: "#DC2626" },
  { label: "Other", value: 4, color: "#627D98" },
];

// -------------------------------------------------------
// Recent Activity
// -------------------------------------------------------

export type ActivityTone = "green" | "blue" | "amber";

export const RECENT_ACTIVITY = [
  {
    id: 1,
    tone: "green" as ActivityTone,
    title: "Inspection completed",
    detail: "CR-2025-0840 · Parle-G Biscuits — Compliant",
    time: "2 hours ago",
  },
  {
    id: 2,
    tone: "blue" as ActivityTone,
    title: "Evidence uploaded",
    detail: "Inspection #INS-2026-0012",
    time: "3 hours ago",
  },
  {
    id: 3,
    tone: "amber" as ActivityTone,
    title: "Case assigned",
    detail: "CR-2025-0851",
    time: "5 hours ago",
  },
];

// -------------------------------------------------------
// Quick Actions
// -------------------------------------------------------

export const QUICK_ACTIONS = [
  { id: "scan", label: "Scan Product", hint: "Scan and verify product on-site" },
  { id: "cases", label: "My Assigned Cases", hint: "View and manage your cases" },
  { id: "history", label: "Inspection History", hint: "View completed inspections" },
  { id: "nearby", label: "Nearby Cases", hint: "Find cases in your area" },
];

// -------------------------------------------------------
// Sidebar nav
// -------------------------------------------------------

export const SIDEBAR_NAV = [
  { label: "Dashboard", href: "/inspector", icon: "dashboard" as const },
  { label: "Scan Product", href: "/inspector/scan", icon: "scan" as const },
  { label: "Assigned Cases", href: "/inspector/cases/assigned", icon: "clipboard" as const, badge: 12 },
  { label: "In Progress", href: "/inspector/cases/in-progress", icon: "progress" as const, badge: 3 },
  { label: "Completed", href: "/inspector/cases/completed", icon: "check" as const },
  { label: "Escalated", href: "/inspector/cases/escalated", icon: "alert" as const },
  { label: "Products", href: "/inspector/products", icon: "package" as const },
  { label: "Inspection History", href: "/inspector/history", icon: "history" as const },
  { label: "Notifications", href: "/inspector/notifications", icon: "bell" as const, badge: 5 },
  { label: "Profile", href: "/inspector/profile", icon: "user" as const },
  { label: "Settings", href: "/inspector/settings", icon: "settings" as const },
];

// -------------------------------------------------------
// Workflow strip (bottom)
// -------------------------------------------------------

export const WORKFLOW_STEPS = [
  { id: 1, title: "Scan Product", hint: "Capture product images on-site" },
  { id: 2, title: "AI Extraction", hint: "Automatic OCR and data extraction" },
  { id: 3, title: "Verify & Compare", hint: "Check with existing product and report" },
  { id: 4, title: "Inspection Findings", hint: "Record your observations" },
  { id: 5, title: "Take Action", hint: "Record enforcement action" },
];

export const EXTRACTED_FIELDS = [
  { label: "Product Name", value: "Parle-G Biscuits", confidence: 98 },
  { label: "Net Quantity", value: "100 g", confidence: 96 },
  { label: "MRP", value: "₹ 10.00", confidence: 92 },
  { label: "Manufacturer", value: "Parle Products Pvt. Ltd.", confidence: 90 },
  { label: "Batch No.", value: "PKD12345", confidence: 85 },
  { label: "Mfg. Date", value: "12/2025", confidence: 88 },
  { label: "Expiry Date", value: "12/2026", confidence: 88 },
];