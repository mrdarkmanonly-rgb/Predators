export type ReportStatus =
  | "SUBMITTED"
  | "PENDING_REVIEW"
  | "UNDER_REVIEW"
  | "NEED_MORE_INFORMATION"
  | "VERIFIED"
  | "REJECTED"
  | "FORWARDED_TO_INSPECTOR"
  | "INSPECTION";

export type PriorityLevel = "HIGH" | "MEDIUM" | "LOW";

export type IssueCategory =
  | "INCORRECT_WEIGHT"
  | "DUAL_MRP"
  | "MISSING_MFR_DETAILS"
  | "CONSUMER_CARE_ABSENT"
  | "NON_STANDARD_UNIT"
  | "DATE_DECLARATION_MISSING"
  | "COUNTRY_OF_ORIGIN_MISSING"
  | "DEFACED_LABEL";

export interface EvidenceItem {
  id: string;
  storageKey: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  imageType: "FRONT_LABEL" | "BACK_LABEL" | "MRP_STAMP" | "WEIGHT_SCALE" | "INVOICE" | "OVERVIEW";
  url: string;
  capturedAt: string;
  resolution?: string;
}

export interface RuleCheckResult {
  ruleNumber: string;
  ruleTitle: string;
  requirement: string;
  declaredValue: string | null;
  observedValue: string | null;
  status: "COMPLIANT" | "NON_COMPLIANT" | "FLAGGED_FOR_REVIEW" | "NOT_APPLICABLE";
  confidenceScore: number; // 0 - 100
  notes?: string;
}

export interface ProductSnapshot {
  productName: string;
  brand: string;
  genericName?: string;
  category: string;
  manufacturerName?: string;
  manufacturerAddress?: string;
  packerName?: string;
  packerAddress?: string;
  importerName?: string;
  importerAddress?: string;
  countryOfOrigin?: string;
  declaredNetQuantity: string;
  declaredMRP: string;
  unitSalePrice?: string;
  monthYearOfManufacture?: string;
  expiryBestBefore?: string;
  batchOrLotNumber?: string;
  barcodeGTIN?: string;
  consumerCareEmail?: string;
  consumerCarePhone?: string;
}

export interface AnalysisSnapshot {
  ocrRawText: string;
  ocrConfidence: number; // 0 - 100
  detectedBarcodes: string[];
  preliminaryResult: "POTENTIAL_VIOLATION" | "SUSPECTED_NON_COMPLIANCE" | "CLEAR" | "INCONCLUSIVE";
  overallConfidence: number;
  ruleChecks: RuleCheckResult[];
  highlightedIssues: string[];
}

export interface ReviewNote {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: string;
  previousStatus?: ReportStatus;
  newStatus?: ReportStatus;
  details?: string;
}

export interface CitizenReportItem {
  id: string;
  reportNumber: string;
  userId: string;
  citizenNameMasked: string;
  citizenPhoneMasked: string;
  scanId?: string;
  issueType: IssueCategory;
  issueLabel: string;
  description: string;
  status: ReportStatus;
  priority: PriorityLevel;

  // Shop info
  shopName: string;
  shopkeeperName?: string;
  shopAddress?: string;
  shopCity: string;
  shopState: string;
  shopPinCode?: string;

  // Geolocation
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;

  // Product & Scan
  productSnapshot: ProductSnapshot;
  analysisSnapshot: AnalysisSnapshot;
  evidence: EvidenceItem[];

  // Reviewer assignment & decisions
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  reviewNotes: ReviewNote[];
  timeline: TimelineEvent[];

  createdAt: string;
  updatedAt: string;
}

export interface ReviewerStats {
  pendingReviews: number;
  reviewedByMe: number;
  assignedToMe: number;
  averageReviewTimeMinutes: number;
  needMoreInformation: number;
  forwardedToInspection: number;
  verifiedReports: number;
  rejectedReports: number;
}

export interface DecisionPayload {
  reportId: string;
  decision: "VERIFY" | "REJECT" | "NEED_MORE_INFO" | "FORWARD_TO_INSPECTOR";
  notes?: string;
  rejectionReason?: string;
  requestedInfoFields?: string[];
  requestedInfoNote?: string;
  inspectorId?: string;
  inspectorName?: string;
  inspectionPriority?: PriorityLevel;
  forwardingInstructions?: string;
}

export interface FilterState {
  searchQuery: string;
  statusTab: string;
  issueType: string;
  priority: string;
  dateRange: string;
  location: string;
  category: string;
  assignedToMeOnly: boolean;
}
