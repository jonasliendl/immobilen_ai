"use client";

import { useEffect, useMemo, useState } from "react";
import { berlinListings, districtRentBenchmarkPerM2 } from "@/lib/data";
import { calculatePriceAssessment } from "@/lib/scoring";
import { NeighborhoodMapResponse } from "@/lib/types";
import Link from "next/link";
import dynamic from "next/dynamic";

const BerlinNeighborhoodMap = dynamic(
    () => import("@/components/berlin-neighborhood-map").then((mod) => mod.BerlinNeighborhoodMap),
    {
        ssr: false,
        loading: () => <div className="h-[360px] animate-pulse rounded-2xl bg-surface-low" />,
    },
);

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
    const [mapOverlay, setMapOverlay] = useState<NeighborhoodMapResponse | null>(null);

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
                note: `${(rentToIncomeRatio * 100).toFixed(0)}% of income - ${rentToIncomeRatio < 0.3 ? "Healthy ratio" : rentToIncomeRatio < 0.35 ? "Acceptable" : "May be challenging"
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
                note: `${listing.district} - ${listing.district === "Prenzlauer Berg"
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

    useEffect(() => {
        let active = true;

        async function loadOverlay() {
            const response = await fetch(`/api/neighborhoods/map?district=${encodeURIComponent(listing.district)}`);
            if (!response.ok) return;

            const data = (await response.json()) as NeighborhoodMapResponse;
            if (!active) return;
            setMapOverlay(data);
        }

        void loadOverlay();

        return () => {
            active = false;
        };
    }, [listing.district]);

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-muted">
                <Link href="/search" className="hover:underline">Search</Link>
                <span className="mx-2">/</span>
                <Link href={`/listings/${listing.id}`} className="hover:underline">{listing.title}</Link>
                <span className="mx-2">/</span>
                <span className="text-on-background">Intelligence</span>
            </nav>

            {/* Header */}
            <section className="ds-card p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-headline text-on-background">📊 Listing Intelligence</h1>
                        <p className="mt-1 text-muted">{listing.title}</p>
                        <p className="text-sm text-muted">{listing.address}</p>
                    </div>
                    <div className="text-right">
                        <Link
                            href={`/apply/${listing.id}?step=profile`}
                            className="btn-primary"
                        >
                            Apply Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Success Probability Score */}
            <section className="grid gap-6 md:grid-cols-2">
                <div className="ds-card p-6">
                    <h2 className="text-title text-on-background">Your Success Probability</h2>

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
                                    className={`${successProbability >= 70
                                        ? "text-green-500"
                                        : successProbability >= 50
                                            ? "text-yellow-500"
                                            : "text-red-500"
                                        } transition-all`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold">{successProbability}%</span>
                                <span className="text-xs text-muted">chance</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-muted">
                            Your ranking: <span className="font-medium">{competitorAnalysis.yourRanking}</span> of applicants
                        </p>
                    </div>

                    <div className="mt-4 rounded-xl bg-surface-low p-4">
                        <p className="text-sm font-medium">Competitor Analysis</p>
                        <div className="mt-2 flex justify-between text-sm">
                            <span className="text-muted">Estimated applications:</span>
                            <span className="font-medium">~{competitorAnalysis.estimatedApplications}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted">Your position:</span>
                            <span className="font-medium">{competitorAnalysis.yourAdvantage}</span>
                        </div>
                    </div>
                </div>

                <div className="ds-card p-6">
                    <h2 className="text-title text-on-background">Score Breakdown</h2>

                    <div className="mt-4 space-y-4">
                        {probabilityBreakdown.map((item) => (
                            <div key={item.name}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-muted">{item.score}/100</span>
                                </div>
                                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-low">
                                    <div
                                        className={`h-full ${item.score >= 80
                                            ? "bg-green-500"
                                            : item.score >= 60
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                            }`}
                                        style={{ width: `${item.score}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-muted">{item.note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Price Assessment */}
            <section className="ds-card p-6">
                <h2 className="text-title text-on-background">💰 Price Assessment</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl bg-surface-low p-4">
                        <p className="text-sm text-muted">Listing Price</p>
                        <p className="mt-1 text-2xl font-bold">€{listing.monthlyRentEur}</p>
                        <p className="text-xs text-muted">{listing.sizeM2}m² = €{(listing.monthlyRentEur / listing.sizeM2).toFixed(1)}/m²</p>
                    </div>
                    <div className="rounded-xl bg-surface-low p-4">
                        <p className="text-sm text-muted">Fair Market Value</p>
                        <p className="mt-1 text-2xl font-bold">€{priceAssessment.expectedRentEur}</p>
                        <p className="text-xs text-muted">Based on district avg</p>
                    </div>
                    <div className={`rounded-xl p-4 ${priceAssessment.deltaEur > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                        <p className="text-sm text-muted">Difference</p>
                        <p className={`mt-1 text-2xl font-bold ${priceAssessment.deltaEur > 0 ? "text-red-600" : "text-green-600"}`}>
                            {priceAssessment.deltaEur > 0 ? "+" : ""}€{priceAssessment.deltaEur}
                        </p>
                        <p className="text-xs text-muted">{priceAssessment.deltaEur > 0 ? "Over market" : "Under market"}</p>
                    </div>
                    <div className="rounded-xl bg-surface-low p-4">
                        <p className="text-sm text-muted">Confidence</p>
                        <p className="mt-1 text-2xl font-bold">{(priceAssessment.confidence * 100).toFixed(0)}%</p>
                        <p className="text-xs text-muted">AI assessment</p>
                    </div>
                </div>
            </section>

            {/* Recommendations */}
            <section className="ds-card p-6">
                <h2 className="text-title text-on-background">💡 AI Recommendations</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {recommendations.map((rec, index) => (
                        <div
                            key={index}
                            className={`rounded-xl border p-4 ${rec.type === "warning"
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

            <section className="ds-card p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-title text-on-background">Neighborhood Map Overlay</h2>
                        <p className="mt-1 text-sm text-muted">
                            Noise intensity is color-coded across the district overlay and the dashed corridor approximates the commute into central Berlin.
                        </p>
                    </div>
                    <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-medium text-black/70">
                    </span>
                </div>

                {
                    mapOverlay ? (
                        <BerlinNeighborhoodMap
                            overlay={mapOverlay}
                            selectedDistrict={listing.district}
                            heightClassName="h-[360px]"
                        />
                    ) : (
                        <div className="h-[360px] animate-pulse rounded-2xl bg-surface-low" />
                    )
                }
            </section>

            {/* Tips to Improve Chances */}
            <section className="ds-card p-6">
                <h2 className="text-title text-on-background">🎯 How to Improve Your Chances</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-surface-low p-4">
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

                    <div className="rounded-xl bg-surface-low p-4">
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
            <section className="ds-card p-6">
                <h2 className="text-title text-on-background">🏠 Similar Listings</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {berlinListings
                        .filter((l) => l.id !== listing.id && l.district === listing.district)
                        .slice(0, 3)
                        .map((similar) => (
                            <Link
                                key={similar.id}
                                href={`/listings/${similar.id}`}
                                className="ds-card p-4 transition hover:shadow-sm"
                            >
                                <p className="font-medium">{similar.title}</p>
                                <p className="text-sm text-muted">{similar.district}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="font-bold">€{similar.monthlyRentEur}</span>
                                    <span className="text-xs text-muted">{similar.sizeM2}m²</span>
                                </div>
                            </Link>
                        ))}
                    {berlinListings.filter((l) => l.id !== listing.id && l.district === listing.district).length === 0 && (
                        <p className="text-sm text-muted">No similar listings in this district. Try expanding your search.</p>
                    )}
                </div>
            </section >
        </main >
    );
}
