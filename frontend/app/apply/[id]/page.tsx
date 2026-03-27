"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { berlinListings } from "@/lib/data";
import { readTextStream } from "@/lib/read-text-stream";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface ApplyPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ step?: string }>;
}

type ApplicationStep = "profile" | "documents" | "cover-letter" | "review" | "submitted";

type TenantProfile = {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    occupation: string;
    monthlyNetIncome: string;
    householdSize: string;
    hasPets: boolean;
    petsDescription: string;
    hasSchufa: boolean;
    employmentDuration: string;
    previousAddress: string;
    moveInDate: string;
    message: string;
};

const DOC_TYPE_MAP: Record<string, string> = {
    schufa: "schufa",
    income: "payslip",
    id: "id",
    employment: "employment-proof",
    mietschulden: "other",
};

const initialProfile: TenantProfile = {
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    occupation: "",
    monthlyNetIncome: "",
    householdSize: "1",
    hasPets: false,
    petsDescription: "",
    hasSchufa: true,
    employmentDuration: "",
    previousAddress: "",
    moveInDate: "",
    message: "",
};

type DraftBundle = {
    profile: TenantProfile;
    uploadedDocs: string[];
    coverLetter: string;
};

function cloneBundle(p: TenantProfile, docs: string[], letter: string): DraftBundle {
    return {
        profile: { ...p },
        uploadedDocs: [...docs],
        coverLetter: letter,
    };
}

function storageKey(listingId: string) {
    return `ai.mmobilie.apply-draft.${listingId}`;
}

function loadDraft(listingId: string): DraftBundle | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(storageKey(listingId));
        if (!raw) return null;
        const data = JSON.parse(raw) as Partial<DraftBundle>;
        if (!data.profile || !Array.isArray(data.uploadedDocs) || typeof data.coverLetter !== "string") return null;
        return {
            profile: { ...initialProfile, ...data.profile },
            uploadedDocs: data.uploadedDocs,
            coverLetter: data.coverLetter,
        };
    } catch {
        return null;
    }
}

function persistDraft(listingId: string, bundle: DraftBundle) {
    try {
        localStorage.setItem(storageKey(listingId), JSON.stringify(bundle));
    } catch {
        /* ignore quota */
    }
}

export default function ApplyPage(_props: ApplyPageProps) {
    const router = useRouter();
    const routeParams = useParams();
    const searchParams = useSearchParams();
    const listingId = typeof routeParams.id === "string" ? routeParams.id : berlinListings[0].id;

    const listing = useMemo(
        () => berlinListings.find((l) => l.id === listingId) || berlinListings[0],
        [listingId],
    );

    const stepParam = searchParams.get("step");
    const currentStep: ApplicationStep = useMemo(() => {
        const allowed: ApplicationStep[] = ["profile", "documents", "cover-letter", "review", "submitted"];
        if (stepParam && allowed.includes(stepParam as ApplicationStep)) return stepParam as ApplicationStep;
        return "profile";
    }, [stepParam]);

    const [profile, setProfile] = useState<TenantProfile>(initialProfile);
    const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
    const [coverLetter, setCoverLetter] = useState("");
    const [committed, setCommitted] = useState<DraftBundle>(() => cloneBundle(initialProfile, [], ""));
    const [hydrated, setHydrated] = useState(false);
    const [saveFlash, setSaveFlash] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
    const [uploadedDocIds, setUploadedDocIds] = useState<Record<string, string>>({});
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loaded = loadDraft(listing.id);
        if (loaded) {
            setProfile(loaded.profile);
            setUploadedDocs(loaded.uploadedDocs);
            setCoverLetter(loaded.coverLetter);
            setCommitted(cloneBundle(loaded.profile, loaded.uploadedDocs, loaded.coverLetter));
        } else {
            setCommitted(cloneBundle(initialProfile, [], ""));
        }
        setHydrated(true);
    }, [listing.id]);

    useEffect(() => {
        if (!hydrated) return;
        persistDraft(listing.id, cloneBundle(profile, uploadedDocs, coverLetter));
    }, [profile, uploadedDocs, coverLetter, listing.id, hydrated]);

    const dirty = useMemo(() => {
        return (
            JSON.stringify(profile) !== JSON.stringify(committed.profile) ||
            JSON.stringify(uploadedDocs) !== JSON.stringify(committed.uploadedDocs) ||
            coverLetter !== committed.coverLetter
        );
    }, [profile, uploadedDocs, coverLetter, committed]);

    const saveProgress = useCallback(() => {
        const next = cloneBundle(profile, uploadedDocs, coverLetter);
        setCommitted(next);
        persistDraft(listing.id, next);
        setSaveFlash(true);
        window.setTimeout(() => setSaveFlash(false), 2000);
    }, [profile, uploadedDocs, coverLetter, listing.id]);

    const discardChanges = useCallback(() => {
        setProfile({ ...committed.profile });
        setUploadedDocs([...committed.uploadedDocs]);
        setCoverLetter(committed.coverLetter);
    }, [committed]);

    const steps: { id: ApplicationStep; label: string; icon: string }[] = [
        { id: "profile", label: "Your Profile", icon: "👤" },
        { id: "documents", label: "Documents", icon: "📄" },
        { id: "cover-letter", label: "Cover Letter", icon: "✉️" },
        { id: "review", label: "Review", icon: "✅" },
    ];

    const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

    function updateProfile(field: keyof TenantProfile, value: string | boolean) {
        setProfile((prev) => ({ ...prev, [field]: value }));
    }

    async function handleDocUpload(docName: string) {
        if (uploadedDocs.includes(docName)) return;
        setIsUploading(docName);
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: "tn-1001",
                    type: DOC_TYPE_MAP[docName] || "other",
                    fileName: `${docName}-${profile.name || "tenant"}.pdf`,
                }),
            });
            if (!res.ok) throw new Error("upload-failed");
            const data = (await res.json()) as { document: { id: string } };
            setUploadedDocIds((prev) => ({ ...prev, [docName]: data.document.id }));
            setUploadedDocs((prev) => [...prev, docName]);
        } catch {
            setUploadedDocs((prev) => [...prev, docName]);
        } finally {
            setIsUploading(null);
        }
    }

    function handleDocRemove(docName: string) {
        setUploadedDocs((prev) => prev.filter((d) => d !== docName));
        setUploadedDocIds((prev) => {
            const next = { ...prev };
            delete next[docName];
            return next;
        });
    }

    async function generateCoverLetter() {
        setIsGenerating(true);
        setCoverLetter("");
        try {
            const response = await fetch("/api/tenant/cover-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId: listing.id,
                    profile,
                }),
            });

            if (!response.ok) {
                throw new Error("cover-letter-request-failed");
            }

            let nextValue = "";
            await readTextStream(response, (chunk) => {
                nextValue += chunk;
                setCoverLetter(nextValue);
            });
        } catch {
            setCoverLetter(`Dear ${listing.landlordName},

I am writing to express my strong interest in the apartment at ${listing.address}.

About me:
- Name: ${profile.name || "[Your name]"}
- Occupation: ${profile.occupation || "[Your occupation]"}
- Monthly net income: €${profile.monthlyNetIncome || "[Amount]"}
- Household size: ${profile.householdSize} person(s)

I am a responsible tenant looking for a long-term home in ${listing.district}. I would be delighted to arrange a viewing.

Best regards,
${profile.name || "[Your name]"}`);
        } finally {
            setIsGenerating(false);
        }
    }

    async function generatePersonalMessage() {
        setIsGeneratingMessage(true);
        try {
            const prompt = [
                `Write a short personal message (3-5 sentences) from a rental applicant to a landlord.`,
                `Apartment: "${listing.title}" in ${listing.district}, €${listing.monthlyRentEur}/month.`,
                `Landlord: ${listing.landlordName}.`,
                profile.name ? `Applicant name: ${profile.name}.` : "",
                profile.occupation ? `Occupation: ${profile.occupation}.` : "",
                profile.monthlyNetIncome ? `Monthly income: €${profile.monthlyNetIncome}.` : "",
                profile.householdSize ? `Household size: ${profile.householdSize}.` : "",
                profile.hasPets ? `Has pets: ${profile.petsDescription || "yes"}.` : "",
                profile.moveInDate ? `Preferred move-in: ${profile.moveInDate}.` : "",
                `Tone: warm, professional, concise. Mention why the applicant is a good fit.`,
                `Output ONLY the message text, no greeting or sign-off.`,
                `Use plain text only. No emojis or special characters. Currency signs (EUR) are allowed.`,
            ]
                .filter(Boolean)
                .join(" ");

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ message: prompt }),
            });

            if (!res.ok) throw new Error("failed");

            const data = (await res.json()) as { reply: string };
            updateProfile("message", data.reply);
        } catch {
            updateProfile(
                "message",
                `I am very interested in your apartment in ${listing.district}. As a ${profile.occupation || "working professional"} with stable income, I am looking for a long-term home and can provide all required documents promptly. I would appreciate the opportunity to introduce myself at a viewing.`,
            );
        } finally {
            setIsGeneratingMessage(false);
        }
    }

    const completionScore = useMemo(() => {
        let score = 0;
        if (profile.name) score += 10;
        if (profile.email) score += 10;
        if (profile.phone) score += 10;
        if (profile.occupation) score += 10;
        if (profile.monthlyNetIncome) score += 15;
        if (profile.hasSchufa) score += 15;
        if (uploadedDocs.length >= 3) score += 20;
        if (coverLetter.length > 100) score += 10;
        return score;
    }, [profile, uploadedDocs, coverLetter]);

    async function submitApplication() {
        setIsSubmitting(true);
        try {
            let documentBundleId: string | undefined;

            const docIds = Object.values(uploadedDocIds);
            if (docIds.length > 0) {
                const bundleRes = await fetch("/api/documents/bundles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tenantId: "tn-1001",
                        documentIds: docIds,
                    }),
                });
                if (bundleRes.ok) {
                    const bundleData = (await bundleRes.json()) as { bundle: { id: string } };
                    documentBundleId = bundleData.bundle.id;
                }
            }

            const appRes = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId: listing.id,
                    coverLetter,
                    documentBundleId,
                }),
            });

            if (appRes.ok) {
                try {
                    localStorage.removeItem(storageKey(listing.id));
                } catch {
                    /* ignore */
                }
            }
        } catch {
            /* proceed */
        } finally {
            setIsSubmitting(false);
            router.push(`/apply/${listing.id}?step=submitted`);
        }
    }

    function renderStep() {
        switch (currentStep) {
            case "profile":
                return renderProfileStep();
            case "documents":
                return renderDocumentsStep();
            case "cover-letter":
                return renderCoverLetterStep();
            case "review":
                return renderReviewStep();
            case "submitted":
                return renderSubmittedStep();
            default:
                return renderProfileStep();
        }
    }

    function renderProfileStep() {
        return (
            <div className="space-y-5">
                <p className="text-sm text-on-surface/80">
                    Tap a section below. Everything saves to your browser as you type; use{" "}
                    <strong className="text-on-background">Save progress</strong> to set a version you can revert to with{" "}
                    <strong className="text-on-background">Discard changes</strong>.
                </p>

                <div className="rounded-2xl bg-surface-container-low p-5 md:p-6">
                    <h2 className="font-sans text-base font-bold text-on-background">About you</h2>
                    <p className="mt-1 text-xs text-on-surface/65">Contact details the landlord will see first.</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <InputField
                            label="Full name"
                            value={profile.name}
                            onChange={(v) => updateProfile("name", v)}
                            placeholder="Max Mustermann"
                        />
                        <InputField
                            label="Email"
                            type="email"
                            value={profile.email}
                            onChange={(v) => updateProfile("email", v)}
                            placeholder="max@example.com"
                        />
                        <InputField
                            label="Phone"
                            type="tel"
                            value={profile.phone}
                            onChange={(v) => updateProfile("phone", v)}
                            placeholder="+49 123 456789"
                        />
                        <InputField
                            label="Date of birth"
                            type="date"
                            value={profile.dateOfBirth}
                            onChange={(v) => updateProfile("dateOfBirth", v)}
                        />
                    </div>
                </div>

                <div className="rounded-2xl bg-surface-container-low p-5 md:p-6">
                    <h2 className="font-sans text-base font-bold text-on-background">Work & income</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <InputField
                            label="Occupation"
                            value={profile.occupation}
                            onChange={(v) => updateProfile("occupation", v)}
                            placeholder="Software engineer"
                        />
                        <InputField
                            label="Monthly net income (€)"
                            type="number"
                            value={profile.monthlyNetIncome}
                            onChange={(v) => updateProfile("monthlyNetIncome", v)}
                            placeholder="3500"
                        />
                        <InputField
                            label="Months in current job"
                            type="number"
                            value={profile.employmentDuration}
                            onChange={(v) => updateProfile("employmentDuration", v)}
                            placeholder="24"
                        />
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-lowest px-4 py-4 ring-1 ring-outline-variant/25 md:col-span-2">
                            <input
                                type="checkbox"
                                checked={profile.hasSchufa}
                                onChange={(e) => updateProfile("hasSchufa", e.target.checked)}
                                className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary/40"
                            />
                            <span className="text-sm font-medium text-on-background">I can provide a SCHUFA report</span>
                        </label>
                    </div>
                </div>

                <div className="rounded-2xl bg-surface-container-low p-5 md:p-6">
                    <h2 className="font-sans text-base font-bold text-on-background">Household & move</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <InputField
                            label="Household size"
                            type="number"
                            value={profile.householdSize}
                            onChange={(v) => updateProfile("householdSize", v)}
                            placeholder="1"
                        />
                        <InputField
                            label="Move-in date"
                            type="date"
                            value={profile.moveInDate}
                            onChange={(v) => updateProfile("moveInDate", v)}
                        />
                    </div>
                    <div className="mt-4">
                        <InputField
                            label="Current / previous address"
                            value={profile.previousAddress}
                            onChange={(v) => updateProfile("previousAddress", v)}
                            placeholder="Street, postal code, city"
                        />
                    </div>
                    <div className="mt-5">
                        <span className="text-sm font-medium text-on-background">Pets?</span>
                        <div className="mt-2 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => updateProfile("hasPets", false)}
                                className={`min-h-[44px] rounded-xl px-6 py-2.5 text-sm font-semibold transition ${!profile.hasPets
                                    ? "bg-primary text-on-primary shadow-md"
                                    : "bg-surface-container-lowest text-on-surface ring-1 ring-outline-variant/30 hover:ring-primary/30"
                                    }`}
                            >
                                No pets
                            </button>
                            <button
                                type="button"
                                onClick={() => updateProfile("hasPets", true)}
                                className={`min-h-[44px] rounded-xl px-6 py-2.5 text-sm font-semibold transition ${profile.hasPets
                                    ? "bg-primary text-on-primary shadow-md"
                                    : "bg-surface-container-lowest text-on-surface ring-1 ring-outline-variant/30 hover:ring-primary/30"
                                    }`}
                            >
                                Yes, I have pets
                            </button>
                        </div>
                        {profile.hasPets && (
                            <textarea
                                value={profile.petsDescription}
                                onChange={(e) => updateProfile("petsDescription", e.target.value)}
                                placeholder="Breed, size, registration — anything the landlord should know"
                                className="mt-3 min-h-[88px] w-full rounded-xl bg-surface-container-lowest px-4 py-3 text-sm text-on-background ring-1 ring-outline-variant/30 placeholder:text-on-surface/40 focus:outline-none focus:ring-2 focus:ring-primary/35"
                                rows={2}
                            />
                        )}
                    </div>
                </div>

                <div className="rounded-2xl bg-surface-container-low p-5 md:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <h2 className="font-sans text-base font-bold text-on-background">Short note to the landlord</h2>
                        <button
                            type="button"
                            onClick={generatePersonalMessage}
                            disabled={isGeneratingMessage}
                            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isGeneratingMessage ? "Generating…" : "✨ AI Generate"}
                        </button>
                    </div>
                    <textarea
                        value={profile.message}
                        onChange={(e) => updateProfile("message", e.target.value)}
                        placeholder="Optional: one or two sentences — why this flat, why you're a reliable tenant."
                        className="mt-3 min-h-[120px] w-full rounded-xl bg-surface-container-lowest px-4 py-3 text-sm text-on-background ring-1 ring-outline-variant/30 placeholder:text-on-surface/40 focus:outline-none focus:ring-2 focus:ring-primary/35"
                        rows={4}
                    />
                    <p className="mt-1 text-xs text-on-surface/65">
                        Use AI Generate for a draft from your profile, or write your own.
                    </p>
                </div>
            </div>
        );
    }

    function renderDocumentsStep() {
        const requiredDocs = [
            { id: "schufa", label: "SCHUFA Credit Report", icon: "📊" },
            { id: "income", label: "Proof of Income (last 3 months)", icon: "💰" },
            { id: "id", label: "ID/Passport Copy", icon: "🆔" },
            { id: "employment", label: "Employment Contract", icon: "📋" },
            { id: "mietschulden", label: "Rent Payment History", icon: "📜" },
        ];

        return (
            <div className="space-y-5">
                <div className="rounded-2xl bg-secondary-fixed/40 px-4 py-3 text-sm text-on-secondary-container">
                    <strong>Tip:</strong> Mark each document when you have it ready — demo mode simulates upload; your
                    checklist is saved with the rest of your application.
                </div>

                <div>
                    <h2 className="font-sans text-base font-bold text-on-background">Checklist</h2>
                    <p className="mt-1 text-xs text-on-surface/65">Tap to toggle. You can change this anytime before submit.</p>
                    <div className="mt-4 space-y-3">
                        {requiredDocs.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{doc.icon}</span>
                                    <div>
                                        <p className="font-semibold text-on-background">{doc.label}</p>
                                        <p className="text-xs text-on-surface/55">PDF, JPG, or PNG (demo)</p>
                                    </div>
                                </div>
                                {uploadedDocs.includes(doc.id) ? (
                                    <button
                                        type="button"
                                        onClick={() => handleDocRemove(doc.id)}
                                        className="rounded-xl bg-primary-container/40 px-4 py-2.5 text-sm font-semibold text-on-primary-container transition hover:bg-primary-container/55"
                                    >
                                        ✓ Added — tap to remove
                                    </button>
                                ) : isUploading === doc.id ? (
                                    <span className="rounded-lg bg-surface-container-high px-3 py-1.5 text-sm font-medium text-on-surface/80">
                                        Uploading…
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => void handleDocUpload(doc.id)}
                                        disabled={isUploading !== null}
                                        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        Mark as ready
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {uploadedDocs.length > 0 && (
                    <div className="rounded-2xl bg-surface-container-low p-4">
                        <h3 className="text-sm font-bold text-on-background">Ready to send</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {uploadedDocs.map((docId) => {
                                const doc = requiredDocs.find((d) => d.id === docId);
                                return (
                                    <span
                                        key={docId}
                                        className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-3 py-1.5 text-sm text-on-background ring-1 ring-outline-variant/25"
                                    >
                                        <span>{doc?.icon}</span>
                                        <span>{doc?.label.split("(")[0].trim()}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleDocRemove(docId)}
                                            className="ml-1 text-on-surface/45 hover:text-error"
                                            aria-label="Remove"
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="rounded-2xl border-2 border-dashed border-primary-container/50 bg-primary-container/10 p-8 text-center">
                    <p className="text-3xl">📁</p>
                    <p className="mt-2 font-semibold text-on-background">Real uploads coming soon</p>
                    <p className="mt-1 text-sm text-on-surface/70">You&apos;ll drag files here; for now use the checklist above.</p>
                </div>
            </div>
        );
    }

    function renderCoverLetterStep() {
        return (
            <div className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="font-sans text-base font-bold text-on-background">Cover letter</h2>
                        <p className="mt-1 text-sm text-on-surface/75">
                            Edit freely — changes follow the same save / discard rules as your profile.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={generateCoverLetter}
                        disabled={isGenerating}
                        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isGenerating ? "Generating…" : "✨ Draft with AI"}
                    </button>
                </div>

                <div className="rounded-2xl bg-secondary-fixed/35 px-4 py-3 text-sm text-on-secondary-container">
                    🏠 <strong>{listing.title}</strong> · {listing.district}
                </div>

                <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write in your own words, or tap “Draft with AI” to start from your profile."
                    className="min-h-[320px] w-full rounded-2xl bg-surface-container-low px-4 py-4 font-mono text-sm text-on-background ring-1 ring-outline-variant/30 placeholder:text-on-surface/40 focus:outline-none focus:ring-2 focus:ring-primary/35 md:min-h-[400px]"
                />

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={generateCoverLetter}
                        disabled={isGenerating || !profile.name}
                        className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm font-semibold transition hover:bg-surface-container disabled:opacity-50"
                    >
                        Regenerate
                    </button>
                    <button
                        type="button"
                        onClick={() => setCoverLetter("")}
                        className="rounded-xl border border-outline-variant/40 px-4 py-2.5 text-sm font-semibold text-on-surface/80 transition hover:bg-surface-container-low"
                    >
                        Clear text
                    </button>
                </div>
            </div>
        );
    }

    function renderReviewStep() {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl bg-surface-container-low p-6">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-sans text-base font-bold text-on-background">Almost there</h2>
                        <div
                            className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${completionScore >= 80
                                ? "bg-primary-container/50 text-on-primary-container"
                                : completionScore >= 60
                                    ? "bg-secondary-fixed/60 text-on-secondary-container"
                                    : "bg-error-container/80 text-on-error-container"
                                }`}
                        >
                            {completionScore}% complete
                        </div>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-high">
                        <div
                            className={`h-full transition-all ${completionScore >= 80
                                ? "bg-primary"
                                : completionScore >= 60
                                    ? "bg-secondary"
                                    : "bg-error"
                                }`}
                            style={{ width: `${completionScore}%` }}
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <ReviewCard title="👤 Profile" completed={!!profile.name && !!profile.email}>
                        {profile.name && <p><strong>Name:</strong> {profile.name}</p>}
                        {profile.email && <p><strong>Email:</strong> {profile.email}</p>}
                        {profile.occupation && <p><strong>Occupation:</strong> {profile.occupation}</p>}
                        {profile.monthlyNetIncome && <p><strong>Income:</strong> €{profile.monthlyNetIncome}/month</p>}
                    </ReviewCard>

                    <ReviewCard title="📄 Documents" completed={uploadedDocs.length >= 3}>
                        <p><strong>Marked ready:</strong> {uploadedDocs.length}</p>
                        {uploadedDocs.length < 3 && (
                            <p className="text-sm text-on-surface/70">Add more from the previous step if you can.</p>
                        )}
                    </ReviewCard>

                    <ReviewCard title="✉️ Cover letter" completed={coverLetter.length > 100}>
                        <p><strong>Length:</strong> {coverLetter.length} characters</p>
                        {coverLetter.length > 0 && (
                            <p className="mt-2 line-clamp-3 text-sm text-on-surface/75">{coverLetter}</p>
                        )}
                    </ReviewCard>

                    <ReviewCard title="🏠 Listing" completed={true}>
                        <p><strong>{listing.title}</strong></p>
                        <p className="text-sm text-on-surface/70">{listing.address}</p>
                        <p className="text-sm text-on-surface/70">€{listing.monthlyRentEur}/month</p>
                    </ReviewCard>
                </div>

                <div className="rounded-2xl bg-surface-container-low px-4 py-4 text-sm text-on-surface/85">
                    <p className="font-semibold text-on-background">📬 After you submit</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5">
                        <li>We package this application for the landlord (demo).</li>
                        <li>Track replies and viewings in Application Tracker.</li>
                        <li>Use Chat anytime to rehearse follow-up questions.</li>
                    </ol>
                </div>
            </div>
        );
    }

    function renderSubmittedStep() {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-container/40 text-5xl">
                    🎉
                </div>
                <h2 className="font-sans text-2xl font-bold text-on-background">Application sent</h2>
                <p className="mt-2 max-w-md text-on-surface/80">
                    Your application for <strong>{listing.title}</strong> was submitted (demo).
                </p>

                <div className="mt-6 w-full max-w-md rounded-2xl bg-surface-container-low p-5 text-left">
                    <p className="text-sm font-bold text-on-background">Next steps</p>
                    <ul className="mt-2 space-y-2 text-sm text-on-surface/80">
                        <li className="flex items-center gap-2">
                            <span>✓</span> Confirmation email (when live)
                        </li>
                        <li className="flex items-center gap-2">
                            <span>📱</span> Landlord messages
                        </li>
                        <li className="flex items-center gap-2">
                            <span>📊</span> Tracker dashboard
                        </li>
                    </ul>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/tracker"
                        className="rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary shadow-md"
                    >
                        Open tracker
                    </Link>
                    <Link
                        href="/search"
                        className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-6 py-3 font-semibold text-on-background transition hover:bg-surface-container"
                    >
                        More listings
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 py-8 md:px-8">
            <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-ambient">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                            Apply for this home
                        </p>
                        <h1 className="mt-1 font-sans text-2xl font-bold text-on-background md:text-3xl">
                            Rental application
                        </h1>
                        <p className="mt-2 font-sans text-sm text-on-surface/75">{listing.title}</p>
                    </div>
                    <Link
                        href={`/listings/${listing.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm font-medium text-on-background transition hover:bg-surface-container"
                    >
                        View listing
                    </Link>
                </div>

                {currentStep !== "submitted" && (
                    <div className="mt-8">
                        <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-on-surface/50">
                            Steps
                        </p>
                        <div className="flex flex-wrap items-center gap-2 md:justify-between">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex min-w-0 flex-1 items-center">
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg transition ${index <= currentStepIndex
                                            ? "bg-primary text-on-primary shadow-md"
                                            : "bg-surface-container text-on-surface/40"
                                            }`}
                                    >
                                        {index < currentStepIndex ? "✓" : step.icon}
                                    </div>
                                    <span
                                        className={`ml-2 hidden text-xs font-semibold md:block ${index <= currentStepIndex ? "text-on-background" : "text-on-surface/40"
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`mx-1 hidden h-0.5 min-w-[1rem] flex-1 md:block ${index < currentStepIndex ? "bg-primary/50" : "bg-outline-variant/40"
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {currentStep !== "submitted" && dirty && (
                <div
                    className="flex flex-col gap-3 rounded-2xl border-2 border-primary-container/60 bg-primary-container/15 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    role="status"
                >
                    <p className="text-sm font-medium text-on-background">
                        You have unsaved changes. Save to keep them, or discard to restore your last saved version.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={discardChanges}
                            className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-on-background transition hover:bg-surface-container-low"
                        >
                            Discard changes
                        </button>
                        <button
                            type="button"
                            onClick={saveProgress}
                            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary/90"
                        >
                            {saveFlash ? "Saved ✓" : "Save progress"}
                        </button>
                    </div>
                </div>
            )}

            <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-ambient md:p-8">
                {renderStep()}
            </div>

            {currentStep !== "submitted" && (
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Link
                        href={
                            currentStepIndex === 0
                                ? `/listings/${listing.id}`
                                : `/apply/${listing.id}?step=${steps[currentStepIndex - 1].id}`
                        }
                        className="inline-flex items-center justify-center rounded-xl border border-outline-variant/50 bg-surface-container-low px-6 py-3.5 text-center font-semibold text-on-background transition hover:bg-surface-container"
                    >
                        ← Back
                    </Link>

                    {currentStepIndex < steps.length - 1 ? (
                        <Link
                            href={`/apply/${listing.id}?step=${steps[currentStepIndex + 1].id}`}
                            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-center font-semibold text-on-primary shadow-md transition hover:bg-primary/90"
                        >
                            Continue →
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={submitApplication}
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 font-semibold text-on-primary shadow-md transition hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isSubmitting ? "Submitting…" : "Submit application"}
                        </button>
                    )}
                </div>
            )}
        </main>
    );
}

function InputField({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-on-surface/65">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="mt-2 min-h-[48px] w-full rounded-xl bg-surface-container-lowest px-4 py-3 text-on-background ring-1 ring-outline-variant/30 transition placeholder:text-on-surface/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
        </div>
    );
}

function ReviewCard({
    title,
    completed,
    children,
}: {
    title: string;
    completed: boolean;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`rounded-2xl p-4 ring-1 ${completed ? "bg-primary-container/15 ring-primary-container/40" : "bg-surface-container-low ring-outline-variant/25"
                }`}
        >
            <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-on-background">{title}</span>
                {completed ? (
                    <span className="text-primary">✓</span>
                ) : (
                    <span className="text-tertiary">!</span>
                )}
            </div>
            <div className="space-y-1 text-sm text-on-surface/80">{children}</div>
        </div>
    );
}
