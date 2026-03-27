"use client";

import { useMemo, useState } from "react";
import { berlinListings, districtRentBenchmarkPerM2 } from "@/lib/data";
import { calculatePriceAssessment } from "@/lib/scoring";
import Link from "next/link";

interface ListingDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
    const [showApplyModal, setShowApplyModal] = useState(false);
    const resolvedParams = useMemo(() => {
        // Will be populated by useEffect in real usage, but for now use placeholder
        return { id: "l-1001" };
    }, []);

    const listing = useMemo(() => {
        return berlinListings.find((l) => l.id === resolvedParams.id) || berlinListings[0];
    }, [resolvedParams.id]);

    const priceAssessment = useMemo(() => {
        return calculatePriceAssessment(listing);
    }, [listing]);

    const pricePerM2 = listing.monthlyRentEur / listing.sizeM2;
    const districtBenchmark = districtRentBenchmarkPerM2[listing.district] || 0;
    const priceVsBenchmark = pricePerM2 - districtBenchmark;

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-black/60">
                <Link href="/search" className="hover:underline">Search</Link>
                <span className="mx-2">/</span>
                <span className="text-black/80">{listing.district}</span>
                <span className="mx-2">/</span>
                <span className="text-black/80">{listing.title}</span>
            </nav>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Images & Details */}
                <div className="lg:col-span-2">
                    <section className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                        {/* Image Gallery */}
                        <div className="aspect-video w-full bg-gradient-to-br from-black/10 to-black/5">
                            <div className="flex h-full items-center justify-center text-6xl">
                                🏠
                            </div>
                        </div>

                        <div className="border-t border-black/10 p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold">{listing.title}</h1>
                                    <p className="mt-1 text-black/60">{listing.address}</p>
                                </div>
                                {listing.source === "genossenschaft" && (
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                        🤝 Genossenschaft
                                    </span>
                                )}
                            </div>

                            {/* Key Stats */}
                            <div className="mt-6 grid grid-cols-4 gap-4 rounded-xl bg-black/5 p-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">€{listing.monthlyRentEur}</p>
                                    <p className="text-xs text-black/60">Monthly</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{listing.sizeM2}</p>
                                    <p className="text-xs text-black/60">Square Meters</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{listing.rooms}</p>
                                    <p className="text-xs text-black/60">Rooms</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">€{pricePerM2.toFixed(1)}</p>
                                    <p className="text-xs text-black/60">Per m²</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold">About this home</h2>
                                <p className="mt-2 text-black/70">
                                    Beautiful {listing.rooms}-room apartment located in the heart of {listing.district}.
                                    This {listing.sizeM2}m² space offers comfortable living with modern amenities.
                                    Perfect for those who appreciate {listing.vibeTags.join(", ")} surroundings.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold">Features & Amenities</h2>
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
                                <h2 className="text-lg font-semibold">Neighborhood Vibe</h2>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {listing.vibeTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-black/10 px-4 py-2 text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Price Analysis */}
                    <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">📊 Price Analysis</h2>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-black/10 p-4">
                                <p className="text-sm text-black/60">District Benchmark</p>
                                <p className="mt-1 text-2xl font-bold">€{districtBenchmark}/m²</p>
                                <p className="text-xs text-black/50">Average in {listing.district}</p>
                            </div>
                            <div className="rounded-xl border border-black/10 p-4">
                                <p className="text-sm text-black/60">This Listing</p>
                                <p className="mt-1 text-2xl font-bold">€{pricePerM2.toFixed(1)}/m²</p>
                                <p className="text-xs text-black/50">€{listing.monthlyRentEur} total</p>
                            </div>
                            <div className={`rounded-xl p-4 ${priceVsBenchmark > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                                <p className="text-sm text-black/60">vs Market</p>
                                <p className={`mt-1 text-2xl font-bold ${priceVsBenchmark > 0 ? "text-red-600" : "text-green-600"}`}>
                                    {priceVsBenchmark > 0 ? "+" : ""}€{priceVsBenchmark.toFixed(1)}/m²
                                </p>
                                <p className="text-xs text-black/50">
                                    {priceVsBenchmark > 0 ? "Above market" : "Below market"} rate
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-black/5 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold">AI Assessment</p>
                                    <p className="mt-1 text-sm text-black/70">
                                        Expected fair rent: <span className="font-bold">€{priceAssessment.expectedRentEur}</span>
                                    </p>
                                    <p className="text-sm text-black/70">
                                        Delta: <span className={priceAssessment.deltaEur > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                                            {priceAssessment.deltaEur > 0 ? "+" : ""}€{priceAssessment.deltaEur}
                                        </span>
                                    </p>
                                </div>
                                <div className={`rounded-full px-4 py-2 text-sm font-medium ${
                                    priceAssessment.isOverpriced
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                }`}>
                                    {priceAssessment.isOverpriced ? "Overpriced" : "Good Deal"}
                                </div>
                            </div>
                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/10">
                                <div
                                    className={`h-full ${priceAssessment.confidence > 0.8 ? "bg-green-500" : priceAssessment.confidence > 0.6 ? "bg-yellow-500" : "bg-red-500"}`}
                                    style={{ width: `${priceAssessment.confidence * 100}%` }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-black/50">Confidence: {(priceAssessment.confidence * 100).toFixed(0)}%</p>
                        </div>
                    </section>
                </div>

                {/* Right Column - Action Card */}
                <div className="space-y-6">
                    <div className="sticky top-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">Interested?</h2>
                        <p className="mt-1 text-sm text-black/60">
                            Apply now to increase your chances of securing this home.
                        </p>

                        <div className="mt-4 space-y-3">
                            <button
                                onClick={() => setShowApplyModal(true)}
                                className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:bg-black/80"
                            >
                                Apply for this home
                            </button>
                            <Link
                                href={`/intelligence?listingId=${listing.id}`}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-black px-4 py-3 font-medium transition hover:bg-black/5"
                            >
                                <span>📈</span>
                                View Success Probability
                            </Link>
                        </div>

                        <div className="mt-6 border-t border-black/10 pt-4">
                            <p className="text-sm font-medium">Quick Stats</p>
                            <div className="mt-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-black/60">Commute to center</span>
                                    <span className="font-medium">{listing.commuteMinutesToCenter} min</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-black/60">Noise level</span>
                                    <span className="font-medium">{listing.noiseScore}/100</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-black/60">Price/m²</span>
                                    <span className="font-medium">€{pricePerM2.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6">
                        <h2 className="text-xl font-bold">Start Application</h2>
                        <p className="mt-2 text-sm text-black/60">
                            You're applying for: <span className="font-medium">{listing.title}</span>
                        </p>

                        <div className="mt-6 space-y-3">
                            <Link
                                href={`/apply/${listing.id}?step=profile`}
                                className="flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 font-medium text-white"
                            >
                                Continue Application
                            </Link>
                            <button
                                onClick={() => setShowApplyModal(false)}
                                className="w-full rounded-xl border border-black/20 px-4 py-3 font-medium transition hover:bg-black/5"
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
        <div className="flex items-center gap-3 rounded-lg bg-black/5 p-3">
            <span className="text-xl">{icon}</span>
            <div>
                <p className="text-xs text-black/60">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

function formatSource(source: string): string {
    if (source === "genossenschaft") return "Genossenschaft";
    return source.charAt(0).toUpperCase() + source.slice(1);
}
