"use client";

import { useState, useMemo } from "react";
import { berlinListings } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function ApplyPage({ params, searchParams }: ApplyPageProps) {
    const router = useRouter();
    const [profile, setProfile] = useState<TenantProfile>(initialProfile);
    const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
    const [coverLetter, setCoverLetter] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resolvedParams = useMemo(() => {
        return { id: "l-1001" };
    }, []);

    const resolvedSearchParams = useMemo(() => {
        return { step: "profile" };
    }, []);

    const listing = useMemo(() => {
        return berlinListings.find((l) => l.id === resolvedParams.id) || berlinListings[0];
    }, [resolvedParams.id]);

    const currentStep = (resolvedSearchParams.step as ApplicationStep) || "profile";

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

    function handleDocUpload(docName: string) {
        if (!uploadedDocs.includes(docName)) {
            setUploadedDocs((prev) => [...prev, docName]);
        }
    }

    function handleDocRemove(docName: string) {
        setUploadedDocs((prev) => prev.filter((d) => d !== docName));
    }

    async function generateCoverLetter() {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/tenant/cover-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId: listing.id,
                    profile,
                }),
            });
            const data = await response.json();
            setCoverLetter(data.letter || "Dear landlord,\n\nI am very interested in your apartment...");
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

    async function submitApplication() {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        router.push(`/apply/${listing.id}?step=submitted`);
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
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold">Personal Information</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <InputField
                            label="Full Name"
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
                            label="Date of Birth"
                            type="date"
                            value={profile.dateOfBirth}
                            onChange={(v) => updateProfile("dateOfBirth", v)}
                        />
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold">Employment & Income</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <InputField
                            label="Occupation"
                            value={profile.occupation}
                            onChange={(v) => updateProfile("occupation", v)}
                            placeholder="Software Engineer"
                        />
                        <InputField
                            label="Monthly Net Income (€)"
                            type="number"
                            value={profile.monthlyNetIncome}
                            onChange={(v) => updateProfile("monthlyNetIncome", v)}
                            placeholder="3500"
                        />
                        <InputField
                            label="Employment Duration (months)"
                            type="number"
                            value={profile.employmentDuration}
                            onChange={(v) => updateProfile("employmentDuration", v)}
                            placeholder="24"
                        />
                        <div className="flex items-center gap-3 pt-6">
                            <input
                                type="checkbox"
                                id="schufa"
                                checked={profile.hasSchufa}
                                onChange={(e) => updateProfile("hasSchufa", e.target.checked)}
                                className="h-4 w-4 rounded border-black/30"
                            />
                            <label htmlFor="schufa" className="text-sm">
                                I have a SCHUFA credit report
                            </label>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold">Household Details</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <InputField
                            label="Household Size"
                            type="number"
                            value={profile.householdSize}
                            onChange={(v) => updateProfile("householdSize", v)}
                            placeholder="1"
                        />
                        <InputField
                            label="Desired Move-in Date"
                            type="date"
                            value={profile.moveInDate}
                            onChange={(v) => updateProfile("moveInDate", v)}
                        />
                    </div>
                    <div className="mt-4">
                        <InputField
                            label="Previous Address"
                            value={profile.previousAddress}
                            onChange={(v) => updateProfile("previousAddress", v)}
                            placeholder="Street, City, ZIP"
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium">Do you have pets?</label>
                        <div className="mt-2 flex gap-4">
                            <button
                                type="button"
                                onClick={() => updateProfile("hasPets", false)}
                                className={`rounded-xl border px-4 py-2 ${
                                    !profile.hasPets
                                        ? "border-black bg-black text-white"
                                        : "border-black/20"
                                }`}
                            >
                                No
                            </button>
                            <button
                                type="button"
                                onClick={() => updateProfile("hasPets", true)}
                                className={`rounded-xl border px-4 py-2 ${
                                    profile.hasPets
                                        ? "border-black bg-black text-white"
                                        : "border-black/20"
                                }`}
                            >
                                Yes
                            </button>
                        </div>
                        {profile.hasPets && (
                            <textarea
                                value={profile.petsDescription}
                                onChange={(e) => updateProfile("petsDescription", e.target.value)}
                                placeholder="Tell us about your pet(s)..."
                                className="mt-3 w-full rounded-xl border border-black/20 p-3 text-sm"
                                rows={2}
                            />
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold">Personal Message</h2>
                    <textarea
                        value={profile.message}
                        onChange={(e) => updateProfile("message", e.target.value)}
                        placeholder="Tell the landlord why you're a great tenant..."
                        className="mt-3 w-full rounded-xl border border-black/20 p-3 text-sm"
                        rows={4}
                    />
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
            <div className="space-y-6">
                <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Complete applications get 3x more responses. Upload all documents for the best chance.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-semibold">Required Documents</h2>
                    <div className="mt-4 space-y-3">
                        {requiredDocs.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between rounded-xl border border-black/10 p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{doc.icon}</span>
                                    <div>
                                        <p className="font-medium">{doc.label}</p>
                                        <p className="text-xs text-black/50">PDF, JPG, or PNG (max 5MB)</p>
                                    </div>
                                </div>
                                {uploadedDocs.includes(doc.id) ? (
                                    <button
                                        onClick={() => handleDocRemove(doc.id)}
                                        className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700"
                                    >
                                        ✓ Uploaded
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleDocUpload(doc.id)}
                                        className="rounded-lg border border-black/20 px-3 py-1.5 text-sm font-medium transition hover:bg-black/5"
                                    >
                                        Upload
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {uploadedDocs.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold">Uploaded Documents</h2>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {uploadedDocs.map((docId) => {
                                const doc = requiredDocs.find((d) => d.id === docId);
                                return (
                                    <span
                                        key={docId}
                                        className="flex items-center gap-2 rounded-full bg-black/10 px-3 py-1.5 text-sm"
                                    >
                                        <span>{doc?.icon}</span>
                                        <span>{doc?.label.split("(")[0].trim()}</span>
                                        <button
                                            onClick={() => handleDocRemove(docId)}
                                            className="ml-1 text-black/40 hover:text-black"
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="rounded-xl border border-dashed border-black/30 p-6 text-center">
                    <p className="text-2xl">📁</p>
                    <p className="mt-2 font-medium">Drag and drop files here</p>
                    <p className="text-sm text-black/60">or click to browse</p>
                </div>
            </div>
        );
    }

    function renderCoverLetterStep() {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Cover Letter</h2>
                        <p className="text-sm text-black/60">
                            Make a great first impression with a personalized message
                        </p>
                    </div>
                    <button
                        onClick={generateCoverLetter}
                        disabled={isGenerating}
                        className="rounded-xl border border-black/20 px-4 py-2 text-sm font-medium transition hover:bg-black/5 disabled:opacity-50"
                    >
                        {isGenerating ? "✨ Generating..." : "✨ AI Generate"}
                    </button>
                </div>

                <div className="rounded-xl border border-black/10 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-800">
                        🏠 Applying for: <strong>{listing.title}</strong> in {listing.district}
                    </p>
                </div>

                <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write your cover letter here, or use AI Generate above..."
                    className="min-h-[400px] w-full rounded-xl border border-black/20 p-4 text-sm font-mono"
                />

                <div className="flex gap-2">
                    <button
                        onClick={generateCoverLetter}
                        disabled={isGenerating || !profile.name}
                        className="rounded-xl border border-black/20 px-4 py-2 text-sm font-medium transition hover:bg-black/5 disabled:opacity-50"
                    >
                        🔄 Regenerate
                    </button>
                    <button
                        onClick={() => setCoverLetter("")}
                        className="rounded-xl border border-black/20 px-4 py-2 text-sm font-medium transition hover:bg-black/5"
                    >
                        Clear
                    </button>
                </div>
            </div>
        );
    }

    function renderReviewStep() {
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

        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-black/10 bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Application Summary</h2>
                        <div className={`rounded-full px-3 py-1 text-sm font-medium ${
                            completionScore >= 80
                                ? "bg-green-100 text-green-700"
                                : completionScore >= 60
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                        }`}>
                            {completionScore}% Complete
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full overflow-hidden rounded-full bg-black/10">
                        <div
                            className={`h-full transition-all ${
                                completionScore >= 80
                                    ? "bg-green-500"
                                    : completionScore >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
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
                        <p><strong>Uploaded:</strong> {uploadedDocs.length} documents</p>
                        {uploadedDocs.length < 3 && (
                            <p className="text-sm text-orange-600">Consider uploading more documents</p>
                        )}
                    </ReviewCard>

                    <ReviewCard title="✉️ Cover Letter" completed={coverLetter.length > 100}>
                        <p><strong>Length:</strong> {coverLetter.length} characters</p>
                        {coverLetter.length > 0 && (
                            <p className="mt-2 line-clamp-3 text-sm text-black/70">{coverLetter}</p>
                        )}
                    </ReviewCard>

                    <ReviewCard title="🏠 Property" completed={true}>
                        <p><strong>{listing.title}</strong></p>
                        <p className="text-sm text-black/60">{listing.address}</p>
                        <p className="text-sm text-black/60">€{listing.monthlyRentEur}/month</p>
                    </ReviewCard>
                </div>

                <div className="rounded-xl bg-black/5 p-4">
                    <p className="text-sm">
                        📬 <strong>What happens next?</strong>
                    </p>
                    <ol className="mt-2 list-decimal pl-5 text-sm text-black/70">
                        <li>Your application is sent to the landlord</li>
                        <li>You'll receive a confirmation email</li>
                        <li>Track responses in your dashboard</li>
                        <li>Landlord may contact you for a viewing</li>
                    </ol>
                </div>
            </div>
        );
    }

    function renderSubmittedStep() {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl">
                    🎉
                </div>
                <h2 className="text-2xl font-bold">Application Submitted!</h2>
                <p className="mt-2 max-w-md text-black/70">
                    Your application for <strong>{listing.title}</strong> has been sent successfully.
                </p>

                <div className="mt-6 w-full max-w-md rounded-xl bg-black/5 p-4 text-left">
                    <p className="text-sm font-medium">Next Steps:</p>
                    <ul className="mt-2 space-y-2 text-sm text-black/70">
                        <li className="flex items-center gap-2">
                            <span>✓</span> Check your email for confirmation
                        </li>
                        <li className="flex items-center gap-2">
                            <span>📱</span> Watch for landlord messages
                        </li>
                        <li className="flex items-center gap-2">
                            <span>📊</span> Track status in your dashboard
                        </li>
                    </ul>
                </div>

                <div className="mt-8 flex gap-3">
                    <Link
                        href="/tracker"
                        className="rounded-xl bg-black px-6 py-3 font-medium text-white"
                    >
                        Go to Tracker
                    </Link>
                    <Link
                        href="/search"
                        className="rounded-xl border border-black/20 px-6 py-3 font-medium transition hover:bg-black/5"
                    >
                        Continue Searching
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            {/* Header */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Apply for Home</h1>
                        <p className="mt-1 text-sm text-black/60">{listing.title}</p>
                    </div>
                    <Link
                        href={`/listings/${listing.id}`}
                        className="text-sm text-black/60 underline"
                    >
                        View listing
                    </Link>
                </div>

                {/* Stepper */}
                {currentStep !== "submitted" && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${
                                            index <= currentStepIndex
                                                ? "bg-black text-white"
                                                : "bg-black/10 text-black/40"
                                        }`}
                                    >
                                        {index < currentStepIndex ? "✓" : step.icon}
                                    </div>
                                    <span
                                        className={`ml-2 hidden text-sm font-medium md:block ${
                                            index <= currentStepIndex ? "text-black" : "text-black/40"
                                        }`}
                                    >
                                        {step.label}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`mx-2 h-0.5 w-8 md:w-16 ${
                                                index < currentStepIndex ? "bg-black" : "bg-black/10"
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Form Content */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                {renderStep()}
            </div>

            {/* Navigation Buttons */}
            {currentStep !== "submitted" && (
                <div className="flex justify-between">
                    <Link
                        href={
                            currentStepIndex === 0
                                ? `/listings/${listing.id}`
                                : `/apply/${listing.id}?step=${steps[currentStepIndex - 1].id}`
                        }
                        className="rounded-xl border border-black/20 px-6 py-3 font-medium transition hover:bg-black/5"
                    >
                        ← Back
                    </Link>

                    {currentStepIndex < steps.length - 1 ? (
                        <Link
                            href={`/apply/${listing.id}?step=${steps[currentStepIndex + 1].id}`}
                            className="rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-black/80"
                        >
                            Continue →
                        </Link>
                    ) : (
                        <button
                            onClick={submitApplication}
                            disabled={isSubmitting}
                            className="rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-black/80 disabled:opacity-50"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Application"}
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
            <label className="block text-sm font-medium">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2.5"
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
        <div className={`rounded-xl border p-4 ${completed ? "border-green-200 bg-green-50" : "border-black/10"}`}>
            <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{title}</span>
                {completed ? (
                    <span className="text-green-600">✓</span>
                ) : (
                    <span className="text-orange-500">!</span>
                )}
            </div>
            <div className="text-sm text-black/70">{children}</div>
        </div>
    );
}
