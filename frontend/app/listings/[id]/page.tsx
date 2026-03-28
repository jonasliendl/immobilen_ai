"use client";

import { use, useMemo, useState } from "react";
import { berlinListings, districtRentBenchmarkPerM2 } from "@/lib/data";
import { calculatePriceAssessment } from "@/lib/scoring";
import Link from "next/link";

interface ListingDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
    const [showApplyModal, setShowApplyModal] = useState(false);
    const { id } = use(params);

    const listing = useMemo(() => {
        return berlinListings.find((l) => l.id === id) || berlinListings[0];
    }, [id]);

    const priceAssessment = useMemo(() => {
        return calculatePriceAssessment(listing);
    }, [listing]);

    const pricePerM2 = listing.monthlyRentEur / listing.sizeM2;
    const districtBenchmark = districtRentBenchmarkPerM2[listing.district] || 0;
    const priceVsBenchmark = pricePerM2 - districtBenchmark;

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-muted">
                <Link href="/search" className="hover:text-primary">Search</Link>
                <span className="mx-2">/</span>
                <span className="text-on-background">{listing.district}</span>
                <span className="mx-2">/</span>
                <span className="text-on-background">{listing.title}</span>
            </nav>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Images & Details */}
                <div className="lg:col-span-2">
                    <section className="ds-card overflow-hidden">
                        {/* Image Gallery */}
                        <div className="aspect-video w-full bg-gradient-to-br from-surface-low to-surface-high">
                            <div className="flex h-full items-center justify-center text-6xl">
                                🏠
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-headline text-on-background">{listing.title}</h1>
                                    <p className="mt-1 text-muted">{listing.address}</p>
                                </div>
                                {listing.source === "genossenschaft" && (
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                        🤝 Genossenschaft
                                    </span>
                                )}
                            </div>

                            {/* Key Stats */}
                            <div className="mt-6 grid grid-cols-4 gap-4 rounded-xl bg-surface-low p-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">€{listing.monthlyRentEur}</p>
                                    <p className="text-label text-muted">Monthly</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-on-background">{listing.sizeM2}</p>
                                    <p className="text-label text-muted">Square Meters</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-on-background">{listing.rooms}</p>
                                    <p className="text-label text-muted">Rooms</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-on-background">€{pricePerM2.toFixed(1)}</p>
                                    <p className="text-label text-muted">Per m²</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <h2 className="text-title text-on-background">About this home</h2>
                                <p className="mt-2 text-muted">
                                    Beautiful {listing.rooms}-room apartment located in the heart of {listing.district}.
                                    This {listing.sizeM2}m² space offers comfortable living with modern amenities.
                                    Perfect for those who appreciate {listing.vibeTags.join(", ")} surroundings.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="mt-6">
                                <h2 className="text-title text-on-background">Features & Amenities</h2>
                                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                                    <FeatureItem icon="📍" label="District" value={listing.district} />
                                    <FeatureItem icon="🚇" label="Commute" value={`${listing.commuteMinutesToCenter} min to center`} />
                                    <FeatureItem icon="🔊" label="Noise Level" value={`${listing.noiseScore}/100`} />
                                    <FeatureItem icon="🏢" label="Source" value={formatSource(listing.source)} />
                                    <FeatureItem icon="👤" label="Contact" value={listing.landlordName} />
                                    {listing.genossenschaftName && (
                                        <FeatureItem icon="🤝" label="Co-op" value={listing.genossenschaftName} />
                                    )}
                                </div>
                            </div>

                            {/* Vibe Tags */}
                            <div className="mt-6">
                                <h2 className="text-title text-on-background">Neighborhood Vibe</h2>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {listing.vibeTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-surface-low px-4 py-2 text-sm text-on-background"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Price Analysis */}
                    <section className="ds-card mt-6 p-6">
                        <h2 className="text-title text-on-background">📊 Price Analysis</h2>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl bg-surface-low p-4">
                                <p className="text-label text-muted">District Benchmark</p>
                                <p className="mt-1 text-2xl font-bold text-on-background">€{districtBenchmark}/m²</p>
                                <p className="text-xs text-muted">Average in {listing.district}</p>
                            </div>
                            <div className="rounded-xl bg-surface-low p-4">
                                <p className="text-label text-muted">This Listing</p>
                                <p className="mt-1 text-2xl font-bold text-on-background">€{pricePerM2.toFixed(1)}/m²</p>
                                <p className="text-xs text-muted">€{listing.monthlyRentEur} total</p>
                            </div>
                            <div className={`rounded-xl p-4 ${priceVsBenchmark > 0 ? "bg-red-50" : "bg-green-50"}`}>
                                <p className="text-label text-muted">vs Market</p>
                                <p className={`mt-1 text-2xl font-bold ${priceVsBenchmark > 0 ? "text-red-600" : "text-green-600"}`}>
                                    {priceVsBenchmark > 0 ? "+" : ""}€{priceVsBenchmark.toFixed(1)}/m²
                                </p>
                                <p className="text-xs text-muted">
                                    {priceVsBenchmark > 0 ? "Above market" : "Below market"} rate
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-surface-low p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-on-background">AI Assessment</p>
                                    <p className="mt-1 text-sm text-muted">
                                        Expected fair rent: <span className="font-bold text-on-background">€{priceAssessment.expectedRentEur}</span>
                                    </p>
                                    <p className="text-sm text-muted">
                                        Delta: <span className={priceAssessment.deltaEur > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                                            {priceAssessment.deltaEur > 0 ? "+" : ""}€{priceAssessment.deltaEur}
                                        </span>
                                    </p>
                                </div>
                                <div className={`rounded-full px-4 py-2 text-sm font-medium ${priceAssessment.isOverpriced
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                    }`}>
                                    {priceAssessment.isOverpriced ? "Overpriced" : "Good Deal"}
                                </div>
                            </div>
                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-high">
                                <div
                                    className={`h-full ${priceAssessment.confidence > 0.8 ? "bg-green-500" : priceAssessment.confidence > 0.6 ? "bg-yellow-500" : "bg-red-500"}`}
                                    style={{ width: `${priceAssessment.confidence * 100}%` }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-muted">Confidence: {(priceAssessment.confidence * 100).toFixed(0)}%</p>
                        </div>
                    </section>
                </div>

                {/* Right Column - Action Card */}
                <div className="space-y-6">
                    <div className="sticky top-6 ds-card p-6">
                        <h2 className="text-title text-on-background">Interested?</h2>
                        <p className="mt-1 text-sm text-muted">
                            Apply now to increase your chances of securing this home.
                        </p>

                        <div className="mt-4 space-y-3">
                            <button
                                onClick={() => setShowApplyModal(true)}
                                className="btn-primary w-full"
                            >
                                Apply for this home
                            </button>
                            <Link
                                href={`/intelligence?listingId=${listing.id}`}
                                className="btn-secondary flex w-full items-center justify-center gap-2"
                            >
                                <span>📈</span>
                                View Success Probability
                            </Link>
                        </div>

                        <div className="mt-6 pt-4">
                            <p className="text-label font-medium text-muted">Quick Stats</p>
                            <div className="mt-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted">Commute to center</span>
                                    <span className="font-medium text-on-background">{listing.commuteMinutesToCenter} min</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Noise level</span>
                                    <span className="font-medium text-on-background">{listing.noiseScore}/100</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Price/m²</span>
                                    <span className="font-medium text-on-background">€{pricePerM2.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4">
                    <div className="ds-card w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-on-background">Start Application</h2>
                        <p className="mt-2 text-sm text-muted">
                            You're applying for: <span className="font-medium text-on-background">{listing.title}</span>
                        </p>

                        <div className="mt-6 space-y-3">
                            <Link
                                href={`/apply/${listing.id}?step=profile`}
                                className="btn-primary flex w-full items-center justify-center"
                            >
                                Continue Application
                            </Link>
                            <button
                                onClick={() => setShowApplyModal(false)}
                                className="btn-secondary w-full"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function FeatureItem({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-surface-low p-3">
            <span className="text-xl">{icon}</span>
            <div>
                <p className="text-label text-muted">{label}</p>
                <p className="text-sm font-medium text-on-background">{value}</p>
            </div>
        </div>
    );
}

function formatSource(source: string): string {
    if (source === "genossenschaft") return "Genossenschaft";
    return source.charAt(0).toUpperCase() + source.slice(1);
}
