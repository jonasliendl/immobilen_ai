import {
    Application,
    ChatbotSession,
    NeighborhoodMetrics,
    RejectionAnalysis,
    StoredDocument,
    DocumentBundle,
} from "@/lib/types";

function nowIso() {
    return new Date().toISOString();
}

export const storedDocuments: StoredDocument[] = [
    {
        id: "doc-1001",
        tenantId: "tn-1001",
        type: "schufa",
        fileName: "schufa-alex-meyer.pdf",
        storageUrl: "https://storage.example.com/docs/schufa-alex-meyer.pdf",
        uploadedAtIso: "2026-03-20T10:00:00.000Z",
    },
    {
        id: "doc-1002",
        tenantId: "tn-1001",
        type: "payslip",
        fileName: "payslip-feb-2026.pdf",
        storageUrl: "https://storage.example.com/docs/payslip-feb-2026.pdf",
        uploadedAtIso: "2026-03-20T10:04:00.000Z",
    },
    {
        id: "doc-1003",
        tenantId: "tn-1001",
        type: "id",
        fileName: "id-front.png",
        storageUrl: "https://storage.example.com/docs/id-front.png",
        uploadedAtIso: "2026-03-20T10:06:00.000Z",
    },
];

export const documentBundles: DocumentBundle[] = [
    {
        id: "bundle-1001",
        tenantId: "tn-1001",
        documentIds: ["doc-1001", "doc-1002", "doc-1003"],
        generatedAtIso: "2026-03-20T10:10:00.000Z",
        completenessScore: 92,
    },
];

export const applications: Application[] = [
    {
        id: "app-1001",
        tenantId: "tn-1001",
        listingId: "l-2001",
        landlordId: "ld-2001",
        documentBundleId: "bundle-1001",
        coverLetter:
            "Dear Berliner Heim eG, I am interested in your apartment and can provide complete documents.",
        status: "submitted",
        submittedAtIso: "2026-03-21T08:30:00.000Z",
        updatedAtIso: "2026-03-21T08:30:00.000Z",
    },
];

export const neighborhoods: NeighborhoodMetrics[] = [
    {
        district: "Prenzlauer Berg",
        avgNoiseScore: 37,
        commuteMinutesToCenter: 18,
        safetyScore: 83,
        greenSpaceScore: 71,
        schoolAccessScore: 81,
        foodAndCultureScore: 90,
        vibeTags: ["cafes", "walkable", "family-friendly"],
        developmentAlerts: [
            {
                id: "dev-1001",
                title: "Road works near Danziger Strasse",
                impact: "medium",
                sourceUrl: "https://daten.berlin.example/roadworks/1001",
            },
        ],
    },
    {
        district: "Lichtenberg",
        avgNoiseScore: 31,
        commuteMinutesToCenter: 26,
        safetyScore: 74,
        greenSpaceScore: 79,
        schoolAccessScore: 69,
        foodAndCultureScore: 62,
        vibeTags: ["quiet", "green", "residential"],
        developmentAlerts: [
            {
                id: "dev-1002",
                title: "New tram line extension planned",
                impact: "high",
                sourceUrl: "https://daten.berlin.example/transit/1002",
            },
        ],
    },
    {
        district: "Pankow",
        avgNoiseScore: 34,
        commuteMinutesToCenter: 24,
        safetyScore: 80,
        greenSpaceScore: 84,
        schoolAccessScore: 78,
        foodAndCultureScore: 73,
        vibeTags: ["schools", "quiet", "family"],
        developmentAlerts: [],
    },
];

export const chatbotSessions: ChatbotSession[] = [
    {
        id: "chat-1001",
        tenantId: "tn-1001",
        createdAtIso: "2026-03-21T07:00:00.000Z",
        updatedAtIso: "2026-03-21T07:02:00.000Z",
        messages: [
            {
                id: "msg-1001",
                role: "user",
                content: "Can you find me a quieter listing in Pankow?",
                createdAtIso: "2026-03-21T07:00:00.000Z",
            },
            {
                id: "msg-1002",
                role: "assistant",
                content:
                    "I recommend filtering by noise score below 40 and source=genossenschaft in Pankow.",
                createdAtIso: "2026-03-21T07:01:00.000Z",
            },
        ],
    },
];

export const rejectionAnalyses: RejectionAnalysis[] = [
    {
        id: "rej-1001",
        applicationId: "app-1001",
        reasonCode: "high-competition",
        confidence: 0.74,
        explanation:
            "The listing had an unusually high number of applicants in the first 24 hours.",
        actionableNextSteps: [
            "Apply within 2 hours after listing publication.",
            "Add employment reference to boost trust signal.",
            "Send follow-up after 48 hours.",
        ],
        analyzedAtIso: "2026-03-22T11:00:00.000Z",
    },
];

export function createDocument(input: {
    tenantId: string;
    type: import("@/lib/types").DocumentType;
    fileName: string;
}): StoredDocument {
    const created: StoredDocument = {
        id: `doc-${1000 + storedDocuments.length + 1}`,
        tenantId: input.tenantId,
        type: input.type,
        fileName: input.fileName,
        storageUrl: `https://storage.example.com/docs/${input.fileName}`,
        uploadedAtIso: nowIso(),
    };
    storedDocuments.push(created);
    return created;
}

export function createDocumentBundle(input: {
    tenantId: string;
    documentIds: string[];
}): import("@/lib/types").DocumentBundle {
    const validDocIds = input.documentIds.filter((id) =>
        storedDocuments.some((d) => d.id === id)
    );

    const totalRequired = 5;
    const completenessScore = Math.round((validDocIds.length / totalRequired) * 100);

    const created: import("@/lib/types").DocumentBundle = {
        id: `bundle-${1000 + documentBundles.length + 1}`,
        tenantId: input.tenantId,
        documentIds: validDocIds,
        generatedAtIso: nowIso(),
        completenessScore: Math.min(completenessScore, 100),
    };
    documentBundles.push(created);
    return created;
}

export function createApplication(input: {
    tenantId: string;
    listingId: string;
    landlordId?: string;
    documentBundleId?: string;
    coverLetter?: string;
}): Application {
    const created: Application = {
        id: `app-${1000 + applications.length + 1}`,
        tenantId: input.tenantId,
        listingId: input.listingId,
        landlordId: input.landlordId,
        documentBundleId: input.documentBundleId,
        coverLetter: input.coverLetter,
        status: "submitted",
        submittedAtIso: nowIso(),
        updatedAtIso: nowIso(),
    };

    applications.unshift(created);
    return created;
}
