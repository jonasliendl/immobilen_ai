export type LandlordType = "private" | "company" | "genossenschaft";

export type Landlord = {
    id: string;
    name: string;
    type: LandlordType;
    email?: string;
    phone?: string;
    website?: string;
};

export type Listing = {
    id: string;
    source: string;
    sourceListingId: string;
    title: string;
    coldRentAmount: number | null;
    warmRentAmount: number | null;
    priceCurrency: string;
    freeFrom: string | null;
    insertedAt: string | null;
    isWBSRequired: boolean | null;
    floor: number | null;
    maxFloor: number | null;
    yearOfConstruction: number | null;
    heatingType: string | null;
    energyType: string | null;
    energyEfficiencyClass: string | null;
    energyConsumptionKWhPerYear: number | null;
    address: string | null;
    city: string | null;
    country: string | null;
    areaM2: number | null;
    rooms: number | null;
    listingUrl: string | null;
    imageUrls: string[];
    features: string[];
    isValid: boolean;
    firstSeenAt: string;
    lastSeenAt: string;
    mietpreisbremse?: {
        verdict: "COMPLIANT" | "BORDERLINE" | "EXCEEDS_RENT_CAP";
        legalCapPerM2: number;
        listingRentPerM2: number;
        overpaymentPercent: number;
    } | null;
};

export type ListingsQuery = {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    q?: string;
    source?: string;
    city?: string;
    minColdRent?: number;
    maxColdRent?: number;
    minWarmRent?: number;
    maxWarmRent?: number;
    minRooms?: number;
    maxRooms?: number;
    minAreaM2?: number;
    maxAreaM2?: number;
    isWBSRequired?: boolean;
    features?: string;
    includeMietpreisbremse?: boolean;
    mietpreisbremseVerdict?: "COMPLIANT" | "BORDERLINE" | "EXCEEDS_RENT_CAP";
};

export type ListingsResponse = {
    data: Listing[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
};

export type TenantProfile = {
    id?: string;
    name: string;
    email: string;
    monthlyNetIncomeEur: number;
    householdSize: number;
    hasPets: boolean;
    hasSchufa: boolean;
    stableEmploymentMonths: number;
    preferredDistricts: string[];
};

export type PriceAssessment = {
    listingId: string;
    expectedRentEur: number;
    deltaEur: number;
    isOverpriced: boolean;
    confidence: number;
};

export type TenantScoreBreakdown = {
    total: number;
    incomeStability: number;
    documentCompleteness: number;
    householdFit: number;
    notes: string[];
};

export type SuccessProbability = {
    listingId: string;
    probability: number;
    reasons: string[];
};

export type DocumentType =
    | "schufa"
    | "payslip"
    | "id"
    | "employment-proof"
    | "residence-permit"
    | "other";

export type StoredDocument = {
    id: string;
    tenantId: string;
    type: DocumentType;
    fileName: string;
    storageUrl: string;
    uploadedAtIso: string;
    expiresAtIso?: string;
};

export type DocumentBundle = {
    id: string;
    tenantId: string;
    documentIds: string[];
    generatedAtIso: string;
    completenessScore: number;
};

export type ApplicationStatus =
    | "draft"
    | "submitted"
    | "viewing-invited"
    | "documents-requested"
    | "accepted"
    | "rejected";

export type Application = {
    id: string;
    tenantId: string;
    listingId: string;
    landlordId?: string;
    documentBundleId?: string;
    coverLetter?: string;
    status: ApplicationStatus;
    submittedAtIso?: string;
    updatedAtIso: string;
};

export type DevelopmentAlert = {
    id: string;
    title: string;
    impact: "low" | "medium" | "high";
    sourceUrl?: string;
};

export type NeighborhoodMetrics = {
    district: string;
    avgNoiseScore: number;
    commuteMinutesToCenter: number;
    safetyScore: number;
    greenSpaceScore: number;
    schoolAccessScore: number;
    foodAndCultureScore: number;
    vibeTags: string[];
    developmentAlerts: DevelopmentAlert[];
};

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
    id: string;
    role: ChatRole;
    content: string;
    createdAtIso: string;
};

export type ChatbotSession = {
    id: string;
    tenantId: string;
    createdAtIso: string;
    updatedAtIso: string;
    messages: ChatMessage[];
};

export type RejectionReasonCode =
    | "income-too-low"
    | "missing-documents"
    | "high-competition"
    | "household-mismatch"
    | "credit-concerns"
    | "other";

export type RejectionAnalysis = {
    id: string;
    applicationId: string;
    reasonCode: RejectionReasonCode;
    confidence: number;
    explanation: string;
    actionableNextSteps: string[];
    analyzedAtIso: string;
};

export type GenossenschaftMatch = {
    listingId: string;
    genossenschaftName: string;
    isEligible: boolean;
    eligibilityReasons: string[];
    handoffUrl: string;
};

export type TenantScoreResponse = {
    tenant: TenantProfile;
    listing: Listing;
    tenantScore: TenantScoreBreakdown;
    success: SuccessProbability;
    genossenschaftMatch: GenossenschaftMatch | null;
};

export type MietpreisbremseAssessment = {
    listingId: string;
    assumptions: string[];
    input: {
        areaM2: number;
        coldRentEur: number;
        coldRentPerM2: number;
        wohnlage: "einfach" | "mittel" | "gut";
        buildingYear: number;
        isOst: boolean;
    };
    mietspiegel: {
        zeile: number;
        lower: number;
        mid: number;
        upper: number;
        maxLegalPerM2: number;
    };
    result: {
        differencePerM2: number;
        overpaymentMonthlyEur: number;
        verdict: "COMPLIANT" | "BORDERLINE" | "EXCEEDS_RENT_CAP";
    };
    disclaimer: string[];
};

export type CoverLetterRequest = {
    listingId: string;
    profile?: {
        name?: string;
        email?: string;
        phone?: string;
        occupation?: string;
        monthlyNetIncome?: string;
        householdSize?: string;
        hasPets?: boolean;
        petsDescription?: string;
        hasSchufa?: boolean;
        employmentDuration?: string;
        moveInDate?: string;
        previousAddress?: string;
        message?: string;
    };
};

export type CoverLetterResponse = {
    listingId: string;
    landlord: string;
    letter: string;
};

export type ChatRequest = {
    message: string;
    sessionId?: string;
};

export type ChatResponse = {
    reply: string;
    provider?: "ollama" | "huggingface" | "fallback";
    timestamp: string;
};

export type CreateApplicationRequest = {
    listingId: string;
    coverLetter?: string;
    documentBundleId?: string;
};

export type ApplicationsResponse = {
    count: number;
    applications: Application[];
};

export type CreateApplicationResponse = {
    application: Application;
};

export type CreateDocumentRequest = {
    tenantId: string;
    type: DocumentType;
    fileName: string;
};

export type CreateDocumentResponse = {
    document: StoredDocument;
};

export type DocumentsResponse = {
    count: number;
    documents: StoredDocument[];
};

export type CreateDocumentBundleRequest = {
    tenantId: string;
    documentIds: string[];
};

export type CreateDocumentBundleResponse = {
    bundle: DocumentBundle;
};

export type DocumentBundlesResponse = {
    count: number;
    bundles: DocumentBundle[];
    documents: StoredDocument[];
};

export type NeighborhoodMetricsResponse = {
    count: number;
    neighborhoods: NeighborhoodMetrics[];
};

export type GeoJsonGeometry = {
    type: "Polygon" | "MultiPolygon" | "LineString";
    coordinates: number[][][] | number[][][][] | number[][];
};

export type NeighborhoodOverlayArea = {
    type: "Feature";
    geometry: GeoJsonGeometry;
    properties: {
        district: string;
        lorName: string;
        source: "berlin-open-data" | "fallback";
        avgNoiseScore: number;
        commuteMinutesToCenter: number;
        safetyScore: number;
        greenSpaceScore: number;
        schoolAccessScore: number;
        foodAndCultureScore: number;
        vibeTags: string[];
        developmentAlertCount: number;
    };
};

export type NeighborhoodCommuteCorridor = {
    type: "Feature";
    geometry: GeoJsonGeometry;
    properties: {
        district: string;
        source: "berlin-open-data" | "fallback";
        commuteMinutesToCenter: number;
    };
};

export type NeighborhoodMapResponse = {
    generatedAtIso: string;
    source: "berlin-open-data" | "fallback";
    areas: NeighborhoodOverlayArea[];
    commuteCorridors: NeighborhoodCommuteCorridor[];
};

export type ChatbotSessionsResponse = {
    count: number;
    sessions: ChatbotSession[];
};

export type RejectionAnalysesResponse = {
    count: number;
    analyses: RejectionAnalysis[];
};
