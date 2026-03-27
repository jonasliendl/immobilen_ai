"use client";

import { useMemo, useState } from "react";
import { berlinListings, districtRentBenchmarkPerM2 } from "@/lib/data";
import { calculatePriceAssessment } from "@/lib/scoring";
import Link from "next/link";

interface ListingIntelligencePageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ listingId?: string }>;
}

type TenantProfile = {
    income: number;
    householdSize: number;
    hasPets: boolean;
    hasSchufa: boolean;
    employmentMonths: number;
};

const defaultProfile: TenantProfile = {
    income: 3600,
    householdSize: 2,
    hasPets: false,
    hasSchufa: true,
    employmentMonths: 28,
};

export default function ListingIntelligencePage({ params, searchParams }: ListingIntelligencePageProps) {
    const [profile] = useState<TenantProfile>(defaultProfile);

    const resolvedParams = useMemo(() => ({ id: "l-1001" }), []);
    const resolvedSearchParams = useMemo(() => ({ listingId: "" }), []);

    const listingId = resolvedSearchParams.listingId || resolvedParams.id;

    const listing = useMemo(() => {
        return berlinListings.find((l) => l.id === listingId) || berlinListings[0];
    }, [listingId]);

    const priceAssessment = useMemo(() => {
        return calculatePriceAssessment(listing);
    }, [listing]);

    const successProbability = useMemo(() => {
        let probability = 50;

        // Income factor (rent should be < 30% of net income)
        const rentToIncomeRatio = listing.monthlyRentEur / profile.income;
        if (rentToIncomeRatio < 0.25) probability += 20;
        else if (rentToIncomeRatio < 0.3) probability += 15;
        else if (rentToIncomeRatio < 0.35) probability += 5;
        else if (rentToIncomeRatio > 0.4) probability -= 20;

        // Employment stability
        if (profile.employmentMonths > 24) probability += 15;
        else if (profile.employmentMonths > 12) probability += 8;
        else if (profile.employmentMonths < 6) probability -= 10;

        // Documents
        if (profile.hasSchufa) probability += 10;
        else probability -= 15;

        // Household fit
        if (listing.rooms >= profile.householdSize) probability += 10;
        if (listing.rooms > profile.householdSize + 1) probability -= 5;

        // Genossenschaft bonus
        if (listing.source === "genossenschaft") {
            probability += 5; // Less competition typically
        }

        // Price competitiveness
        if (!priceAssessment.isOverpriced) probability += 10;
        else probability -= 10;

        // District competition adjustment
        if (listing.district === "Prenzlauer Berg") probability -= 10;
        if (listing.district === "Neukoelln") probability -= 5;
        if (listing.district === "Lichtenberg" || listing.district === "Pankow") probability += 5;

        return Math.min(95, Math.max(10, probability));
    }, [listing, profile, priceAssessment]);

    const probabilityBreakdown = useMemo(() => {
        const rentToIncomeRatio = listing.monthlyRentEur / profile.income;
        const items = [
            {
                name: "Income Stability",
                score: profile.employmentMonths > 24 ? 95 : profile.employmentMonths > 12 ? 75 : 50,
                weight: 25,
                note: profile.employmentMonths > 24
                    ? "Excellent - over 2 years stable employment"
                    : profile.employmentMonths > 12
                    ? "Good - over 1 year employed"
                    : "Consider finding a co-signer",
            },
            {
                name: "Affordability",
                score: rentToIncomeRatio < 0.3 ? 90 : rentToIncomeRatio < 0.35 ? 70 : 40,
                weight: 25,
                note: `${(rentToIncomeRatio * 100).toFixed(0)}% of income - ${
                    rentToIncomeRatio < 0.3 ? "Healthy ratio" : rentToIncomeRatio < 0.35 ? "Acceptable" : "May be challenging"
                }`,
            },
            {
                name: "Document Completeness",
                score: profile.hasSchufa ? 85 : 40,
                weight: 20,
                note: profile.hasSchufa ? "SCHUFA available" : "SCHUFA report needed",
            },
            {
                name: "Listing Fit",
                score: listing.rooms >= profile.householdSize ? 90 : 60,
                weight: 15,
                note: `${listing.rooms} rooms for ${profile.householdSize} person(s)`,
            },
            {
                name: "Market Competition",
                score: listing.district === "Prenzlauer Berg" ? 50 : listing.district === "Lichtenberg" ? 80 : 65,
                weight: 15,
                note: `${listing.district} - ${
                    listing.district === "Prenzlauer Berg"
                        ? "High competition area"
                        : listing.district === "Lichtenberg"
                        ? "Moderate competition"
                        : "Average competition"
                }`,
            },
        ];
        return items;
    }, [listing, profile]);

    const recommendations = useMemo(() => {
        const items = [];

        if (priceAssessment.isOverpriced) {
            items.push({
                type: "warning",
                title: "Consider negotiating",
                description: `This listing is €${priceAssessment.deltaEur} above market rate. Mention comparable listings in your application.`,
            });
        } else {
            items.push({
                type: "success",
                title: "Good value",
                description: `This listing is priced fairly or below market. Expect higher competition - apply quickly!`,
            });
        }

        if (!profile.hasSchufa) {
            items.push({
                type: "warning",
                title: "Get SCHUFA report",
                description: "Having a SCHUFA report increases your success rate by ~40%. Order it now at schufa.de.",
            });
        }

        if (listing.source === "genossenschaft") {
            items.push({
                type: "info",
                title: "Genossenschaft application",
                description: "Co-ops require membership application. Start this process early - it can take 2-4 weeks.",
            });
        }

        if (listing.commuteMinutesToCenter > 25) {
            items.push({
                type: "info",
                title: "Location insight",
                description: `${listing.commuteMinutesToCenter} minutes to center. Consider BVG monthly pass (€69) for commuting.`,
            });
        }

        return items;
    }, [listing, profile, priceAssessment]);

    const competitorAnalysis = useMemo(() => {
        const avgApplications = listing.source === "genossenschaft" ? 15 : 50;
        const yourAdvantage = successProbability > 60 ? "Above average" : successProbability > 40 ? "Average" : "Below average";

        return {
            estimatedApplications: avgApplications,
            yourRanking: successProbability > 70 ? "Top 20%" : successProbability > 50 ? "Top 50%" : "Bottom 50%",
            yourAdvantage,
            tips: [
                "Apply within 2 hours of listing posted",
                "Include all documents in first application",
                "Write a personalized cover letter",
                "Mention long-term rental intent",
            ],
        };
    }, [listing, successProbability]);

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-black/60">
                <Link href="/search" className="hover:underline">Search</Link>
                <span className="mx-2">/</span>
                <Link href={`/listings/${listing.id}`} className="hover:underline">{listing.title}</Link>
                <span className="mx-2">/</span>
                <span className="text-black/80">Intelligence</span>
            </nav>

            {/* Header */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">📊 Listing Intelligence</h1>
                        <p className="mt-1 text-black/60">{listing.title}</p>
                        <p className="text-sm text-black/50">{listing.address}</p>
                    </div>
                    <div className="text-right">
                        <Link
                            href={`/apply/${listing.id}?step=profile`}
                            className="rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-black/80"
                        >
                            Apply Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Success Probability Score */}
            <section className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">Your Success Probability</h2>

                    <div className="mt-4 flex items-center justify-center">
                        <div className="relative">
                            <svg className="h-40 w-40 -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="none"
                                    className="text-black/10"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * successProbability) / 100}
                                    className={`${
                                        successProbability >= 70
                                            ? "text-green-500"
                                            : successProbability >= 50
                                            ? "text-yellow-500"
                                            : "text-red-500"
                                    } transition-all`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold">{successProbability}%</span>
                                <span className="text-xs text-black/50">chance</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-black/60">
                            Your ranking: <span className="font-medium">{competitorAnalysis.yourRanking}</span> of applicants
                        </p>
                    </div>

                    <div className="mt-4 rounded-xl bg-black/5 p-4">
                        <p className="text-sm font-medium">Competitor Analysis</p>
                        <div className="mt-2 flex justify-between text-sm">
                            <span className="text-black/60">Estimated applications:</span>
                            <span className="font-medium">~{competitorAnalysis.estimatedApplications}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-black/60">Your position:</span>
                            <span className="font-medium">{competitorAnalysis.yourAdvantage}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">Score Breakdown</h2>

                    <div className="mt-4 space-y-4">
                        {probabilityBreakdown.map((item) => (
                            <div key={item.name}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-black/60">{item.score}/100</span>
                                </div>
                                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/10">
                                    <div
                                        className={`h-full ${
                                            item.score >= 80
                                                ? "bg-green-500"
                                                : item.score >= 60
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                        }`}
                                        style={{ width: `${item.score}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-black/50">{item.note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Price Assessment */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">💰 Price Assessment</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-black/10 p-4">
                        <p className="text-sm text-black/60">Listing Price</p>
                        <p className="mt-1 text-2xl font-bold">€{listing.monthlyRentEur}</p>
                        <p className="text-xs text-black/50">{listing.sizeM2}m² = €{(listing.monthlyRentEur / listing.sizeM2).toFixed(1)}/m²</p>
                    </div>
                    <div className="rounded-xl border border-black/10 p-4">
                        <p className="text-sm text-black/60">Fair Market Value</p>
                        <p className="mt-1 text-2xl font-bold">€{priceAssessment.expectedRentEur}</p>
                        <p className="text-xs text-black/50">Based on district avg</p>
                    </div>
                    <div className={`rounded-xl p-4 ${priceAssessment.deltaEur > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                        <p className="text-sm text-black/60">Difference</p>
                        <p className={`mt-1 text-2xl font-bold ${priceAssessment.deltaEur > 0 ? "text-red-600" : "text-green-600"}`}>
                            {priceAssessment.deltaEur > 0 ? "+" : ""}€{priceAssessment.deltaEur}
                        </p>
                        <p className="text-xs text-black/50">{priceAssessment.deltaEur > 0 ? "Over market" : "Under market"}</p>
                    </div>
                    <div className="rounded-xl border border-black/10 p-4">
                        <p className="text-sm text-black/60">Confidence</p>
                        <p className="mt-1 text-2xl font-bold">{(priceAssessment.confidence * 100).toFixed(0)}%</p>
                        <p className="text-xs text-black/50">AI assessment</p>
                    </div>
                </div>
            </section>

            {/* Recommendations */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">💡 AI Recommendations</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {recommendations.map((rec, index) => (
                        <div
                            key={index}
                            className={`rounded-xl border p-4 ${
                                rec.type === "warning"
                                    ? "border-yellow-200 bg-yellow-50"
                                    : rec.type === "success"
                                    ? "border-green-200 bg-green-50"
                                    : "border-blue-200 bg-blue-50"
                            }`}
                        >
                            <p className="font-semibold">{rec.title}</p>
                            <p className="mt-1 text-sm text-black/70">{rec.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tips to Improve Chances */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">🎯 How to Improve Your Chances</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-black/10 p-4">
                        <h3 className="font-semibold">Quick Wins</h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            {competitorAnalysis.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-xl border border-black/10 p-4">
                        <h3 className="font-semibold">Document Checklist</h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span className={profile.hasSchufa ? "text-green-600" : "text-orange-500"}>
                                    {profile.hasSchufa ? "✓" : "!"}
                                </span>
                                <span>SCHUFA credit report</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-black/40">○</span>
                                <span>Proof of income (3 months)</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-black/40">○</span>
                                <span>ID/Passport copy</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-black/40">○</span>
                                <span>Employment contract</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-black/40">○</span>
                                <span>Rental payment history</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Similar Listings */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">🏠 Similar Listings</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {berlinListings
                        .filter((l) => l.id !== listing.id && l.district === listing.district)
                        .slice(0, 3)
                        .map((similar) => (
                            <Link
                                key={similar.id}
                                href={`/listings/${similar.id}`}
                                className="rounded-xl border border-black/10 bg-white p-4 transition hover:border-black hover:shadow-sm"
                            >
                                <p className="font-medium">{similar.title}</p>
                                <p className="text-sm text-black/60">{similar.district}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="font-bold">€{similar.monthlyRentEur}</span>
                                    <span className="text-xs text-black/50">{similar.sizeM2}m²</span>
                                </div>
                            </Link>
                        ))}
                    {berlinListings.filter((l) => l.id !== listing.id && l.district === listing.district).length === 0 && (
                        <p className="text-sm text-black/60">No similar listings in this district. Try expanding your search.</p>
                    )}
                </div>
            </section>
        </main>
    );
}
