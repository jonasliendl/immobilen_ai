"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    Application,
    ChatbotSession,
    ChatResponse,
    CoverLetterResponse,
    DocumentBundle,
    ListingsResponse,
    NeighborhoodMetrics,
    RejectionAnalysis,
    StoredDocument,
    TenantScoreResponse,
} from "@/lib/types";
import { readTextStream } from "@/lib/read-text-stream";

type ListingWithAssessment = ListingsResponse["listings"][number];

type DocumentsPayload = {
    bundles: DocumentBundle[];
    documents: StoredDocument[];
};

export function PlatformDashboard() {
    const [district, setDistrict] = useState("");
    const [source, setSource] = useState("");
    const [loading, setLoading] = useState(false);
    const [listings, setListings] = useState<ListingWithAssessment[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [score, setScore] = useState<TenantScoreResponse | null>(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [chatInput, setChatInput] = useState("");
    const [chatReply, setChatReply] = useState("");
    const [applications, setApplications] = useState<Application[]>([]);
    const [documents, setDocuments] = useState<DocumentsPayload | null>(null);
    const [neighborhoods, setNeighborhoods] = useState<NeighborhoodMetrics[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatbotSession[]>([]);
    const [rejections, setRejections] = useState<RejectionAnalysis[]>([]);
    const [submitMessage, setSubmitMessage] = useState("");
    const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

    const selectedListing = useMemo(
        () => listings.find((item) => item.id === selectedId) ?? null,
        [listings, selectedId],
    );

    async function searchListings() {
        setLoading(true);
        setScore(null);
        setCoverLetter("");

        const params = new URLSearchParams();
        if (district) params.set("district", district);
        if (source) params.set("source", source);

        const response = await fetch(`/api/listings?${params.toString()}`);
        const data = (await response.json()) as ListingsResponse;

        setListings(data.listings);
        setSelectedId(data.listings[0]?.id ?? "");
        setLoading(false);
    }

    async function analyzeListing() {
        if (!selectedId) return;

        const response = await fetch(`/api/tenant/score?listingId=${selectedId}`);
        const data = (await response.json()) as TenantScoreResponse;
        setScore(data);
    }

    async function generateLetter() {
        if (!selectedId) return;

        setIsGeneratingLetter(true);
        setCoverLetter("");

        const response = await fetch("/api/tenant/cover-letter", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ listingId: selectedId }),
        });

        if (!response.ok) {
            setCoverLetter("Unable to generate a cover letter right now.");
            setIsGeneratingLetter(false);
            return;
        }

        let nextValue = "";
        await readTextStream(response, (chunk) => {
            nextValue += chunk;
            setCoverLetter(nextValue);
        });
        setIsGeneratingLetter(false);
    }

    async function askChatbot() {
        if (!chatInput.trim()) return;

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ message: chatInput }),
        });

        const data = (await response.json()) as ChatResponse;
        setChatReply(data.reply);
    }

    async function loadApplications() {
        const response = await fetch("/api/applications?tenantId=tn-1001");
        const data = (await response.json()) as {
            count: number;
            applications: Application[];
        };
        setApplications(data.applications);
    }

    async function createApplicationFromSelection() {
        if (!selectedId) return;

        const response = await fetch("/api/applications", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                listingId: selectedId,
                coverLetter: coverLetter || undefined,
            }),
        });

        if (!response.ok) {
            setSubmitMessage("Failed to submit application.");
            return;
        }

        const data = (await response.json()) as { application: Application };
        setSubmitMessage(`Application ${data.application.id} submitted.`);
        await loadApplications();
    }

    async function loadDocumentBundles() {
        const response = await fetch("/api/documents/bundles?tenantId=tn-1001");
        const data = (await response.json()) as {
            count: number;
            bundles: DocumentBundle[];
            documents: StoredDocument[];
        };

        setDocuments({
            bundles: data.bundles,
            documents: data.documents,
        });
    }

    async function loadNeighborhoods() {
        const queryDistrict = selectedListing?.district || district;
        const params = new URLSearchParams();
        if (queryDistrict) params.set("district", queryDistrict);

        const response = await fetch(`/api/neighborhoods?${params.toString()}`);
        const data = (await response.json()) as {
            count: number;
            neighborhoods: NeighborhoodMetrics[];
        };
        setNeighborhoods(data.neighborhoods);
    }

    async function loadChatSessions() {
        const response = await fetch("/api/chat/sessions?tenantId=tn-1001");
        const data = (await response.json()) as {
            count: number;
            sessions: ChatbotSession[];
        };
        setChatSessions(data.sessions);
    }

    async function loadRejectionAnalyses() {
        const applicationId = applications[0]?.id;
        const params = new URLSearchParams();
        if (applicationId) params.set("applicationId", applicationId);

        const response = await fetch(`/api/rejections?${params.toString()}`);
        const data = (await response.json()) as {
            count: number;
            analyses: RejectionAnalysis[];
        };
        setRejections(data.analyses);
    }

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-bold">Berlin AI Rental Platform</h1>
                <p className="mt-2 text-sm text-black/70">
                    Search listings, evaluate success probability, generate cover letters,
                    and connect with Wohnungsgenossenschaften.
                </p>
            </section>

            <section className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-4">
                <input
                    value={district}
                    onChange={(event) => setDistrict(event.target.value)}
                    placeholder="District (e.g. Pankow)"
                    className="rounded-xl border border-black/20 px-3 py-2"
                />
                <select
                    value={source}
                    onChange={(event) => setSource(event.target.value)}
                    className="rounded-xl border border-black/20 px-3 py-2"
                >
                    <option value="">All sources</option>
                    <option value="immobilienscout24">ImmobilienScout24</option>
                    <option value="immowelt">ImmoWelt</option>
                    <option value="kleinanzeigen">Kleinanzeigen</option>
                    <option value="genossenschaft">Wohnungsgenossenschaften</option>
                </select>
                <button
                    onClick={searchListings}
                    disabled={loading}
                    className="rounded-xl bg-black px-4 py-2 text-white"
                >
                    {loading ? "Searching..." : "Search Listings"}
                </button>
                <button
                    onClick={analyzeListing}
                    disabled={!selectedId}
                    className="rounded-xl border border-black px-4 py-2"
                >
                    Analyze Selected Listing
                </button>
            </section>

            <section className="grid gap-3 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-5">
                <button
                    onClick={loadApplications}
                    className="rounded-xl border border-black px-3 py-2"
                >
                    Load Applications
                </button>
                <button
                    onClick={loadDocumentBundles}
                    className="rounded-xl border border-black px-3 py-2"
                >
                    Load Documents
                </button>
                <button
                    onClick={loadNeighborhoods}
                    className="rounded-xl border border-black px-3 py-2"
                >
                    Load Neighborhoods
                </button>
                <button
                    onClick={loadChatSessions}
                    className="rounded-xl border border-black px-3 py-2"
                >
                    Load Chat Sessions
                </button>
                <button
                    onClick={loadRejectionAnalyses}
                    className="rounded-xl border border-black px-3 py-2"
                >
                    Load Rejection Analysis
                </button>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white p-5">
                    <h2 className="text-lg font-semibold">Listings</h2>
                    <div className="mt-3 flex flex-col gap-3">
                        {listings.length === 0 && (
                            <p className="text-sm text-black/60">Run a search to load listings.</p>
                        )}
                        {listings.map((listing) => (
                            <button
                                key={listing.id}
                                onClick={() => setSelectedId(listing.id)}
                                className={`rounded-xl border p-3 text-left transition ${selectedId === listing.id
                                    ? "border-black bg-black text-white"
                                    : "border-black/15"
                                    }`}
                            >
                                <p className="font-semibold">{listing.title}</p>
                                <p className="text-sm opacity-80">
                                    {listing.district} | EUR {listing.monthlyRentEur} | {listing.sizeM2}m2
                                </p>
                                <p className="mt-1 text-xs opacity-80">
                                    Source: {listing.source}
                                    {listing.genossenschaftName
                                        ? ` (${listing.genossenschaftName})`
                                        : ""}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-5">
                    <h2 className="text-lg font-semibold">Listing Intelligence</h2>
                    {!selectedListing && (
                        <p className="mt-3 text-sm text-black/60">Select a listing first.</p>
                    )}
                    {selectedListing && (
                        <div className="mt-3 space-y-2 text-sm">
                            <p>Landlord: {selectedListing.landlordName}</p>
                            <p>Commute: {selectedListing.commuteMinutesToCenter} min</p>
                            <p>Noise score: {selectedListing.noiseScore} / 100</p>
                            <p>
                                Fair price check: expected EUR {selectedListing.priceAssessment.expectedRentEur}
                                , delta EUR {selectedListing.priceAssessment.deltaEur}
                            </p>
                            <p>
                                Overpriced: {selectedListing.priceAssessment.isOverpriced ? "Yes" : "No"}
                            </p>
                            <p>Vibe: {selectedListing.vibeTags.join(", ")}</p>
                        </div>
                    )}

                    {score && (
                        <div className="mt-4 rounded-xl border border-black/15 p-3 text-sm">
                            <p className="font-semibold">Tenant score: {score.tenantScore.total}/100</p>
                            <p>Success probability: {score.success.probability}%</p>
                            <p className="mt-2 font-medium">Reasoning:</p>
                            <ul className="list-disc pl-5">
                                {score.success.reasons.map((reason) => (
                                    <li key={reason}>{reason}</li>
                                ))}
                            </ul>

                            {score.genossenschaftMatch && (
                                <div className="mt-3 rounded-lg bg-black/5 p-2">
                                    <p className="font-semibold">
                                        Genossenschaft match: {score.genossenschaftMatch.genossenschaftName}
                                    </p>
                                    <p>
                                        Eligible: {score.genossenschaftMatch.isEligible ? "Yes" : "No"}
                                    </p>
                                    <a
                                        className="mt-1 inline-block underline"
                                        href={score.genossenschaftMatch.handoffUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open handoff link
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white p-5">
                    <h2 className="text-lg font-semibold">AI Cover Letter</h2>
                    <button
                        onClick={generateLetter}
                        disabled={!selectedId || isGeneratingLetter}
                        className="mt-3 rounded-xl bg-black px-4 py-2 text-white"
                    >
                        {isGeneratingLetter ? "Generating with Ollama..." : "Generate Letter"}
                    </button>
                    <textarea
                        value={coverLetter}
                        readOnly
                        className="mt-3 min-h-52 w-full rounded-xl border border-black/20 p-3 text-sm"
                        placeholder="Generated letter appears here"
                    />
                    <button
                        onClick={createApplicationFromSelection}
                        disabled={!selectedId}
                        className="mt-3 rounded-xl border border-black px-4 py-2"
                    >
                        Submit Application
                    </button>
                    {submitMessage && (
                        <p className="mt-2 text-sm text-black/70">{submitMessage}</p>
                    )}
                    {selectedId && (
                        <Link
                            href={`/intelligence/${selectedId}`}
                            className="mt-3 inline-flex items-center text-sm font-medium underline"
                        >
                            Open full neighborhood map and intelligence
                        </Link>
                    )}
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-5">
                    <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
                    <div className="mt-3 flex gap-2">
                        <input
                            value={chatInput}
                            onChange={(event) => setChatInput(event.target.value)}
                            placeholder="Ask about price, genossenschaft, or cover letter"
                            className="flex-1 rounded-xl border border-black/20 px-3 py-2"
                        />
                        <button
                            onClick={askChatbot}
                            className="rounded-xl bg-black px-4 py-2 text-white"
                        >
                            Ask
                        </button>
                    </div>
                    <p className="mt-3 rounded-xl border border-black/15 p-3 text-sm">
                        {chatReply || "Chat response will appear here."}
                    </p>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white p-5">
                    <h2 className="text-lg font-semibold">Application Tracker</h2>
                    <div className="mt-3 space-y-2 text-sm">
                        {applications.length === 0 && (
                            <p className="text-black/60">No applications loaded yet.</p>
                        )}
                        {applications.map((application) => (
                            <div key={application.id} className="rounded-lg border border-black/15 p-2">
                                <p className="font-medium">{application.id}</p>
                                <p>Status: {application.status}</p>
                                <p>Listing: {application.listingId}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-5">
                    <h2 className="text-lg font-semibold">Document Bundle</h2>
                    {!documents && (
                        <p className="mt-3 text-sm text-black/60">Load documents to view bundle readiness.</p>
                    )}
                    {documents && (
                        <div className="mt-3 space-y-3 text-sm">
                            {documents.bundles.map((bundle) => (
                                <div key={bundle.id} className="rounded-lg border border-black/15 p-2">
                                    <p className="font-medium">{bundle.id}</p>
                                    <p>Completeness: {bundle.completenessScore}%</p>
                                    <p>Documents: {bundle.documentIds.length}</p>
                                </div>
                            ))}
                            <p className="text-black/70">
                                Uploaded files: {documents.documents.map((doc) => doc.fileName).join(", ")}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white p-5">
                    <h2 className="text-lg font-semibold">Neighborhood Intelligence</h2>
                    {neighborhoods.length === 0 && (
                        <p className="mt-3 text-sm text-black/60">No neighborhood metrics loaded yet.</p>
                    )}
                    <div className="mt-3 space-y-2 text-sm">
                        {neighborhoods.map((item) => (
                            <div key={item.district} className="rounded-lg border border-black/15 p-2">
                                <p className="font-medium">{item.district}</p>
                                <p>Safety: {item.safetyScore}</p>
                                <p>Green spaces: {item.greenSpaceScore}</p>
                                <p>Commute: {item.commuteMinutesToCenter} min</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-5">
                    <h2 className="text-lg font-semibold">Chat Sessions</h2>
                    {chatSessions.length === 0 && (
                        <p className="mt-3 text-sm text-black/60">No chat sessions loaded yet.</p>
                    )}
                    <div className="mt-3 space-y-2 text-sm">
                        {chatSessions.map((session) => (
                            <div key={session.id} className="rounded-lg border border-black/15 p-2">
                                <p className="font-medium">{session.id}</p>
                                <p>Messages: {session.messages.length}</p>
                                <p>Updated: {new Date(session.updatedAtIso).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-5">
                <h2 className="text-lg font-semibold">Automated Rejection Analysis</h2>
                {rejections.length === 0 && (
                    <p className="mt-3 text-sm text-black/60">No rejection analyses loaded yet.</p>
                )}
                <div className="mt-3 space-y-3 text-sm">
                    {rejections.map((analysis) => (
                        <div key={analysis.id} className="rounded-lg border border-black/15 p-3">
                            <p className="font-medium">Application {analysis.applicationId}</p>
                            <p>Reason: {analysis.reasonCode}</p>
                            <p>Confidence: {Math.round(analysis.confidence * 100)}%</p>
                            <p className="mt-1">{analysis.explanation}</p>
                            <p className="mt-2 font-medium">Next steps:</p>
                            <ul className="list-disc pl-5">
                                {analysis.actionableNextSteps.map((step) => (
                                    <li key={step}>{step}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
