"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { Listing, MietpreisbremseAssessment } from "@/lib/types";
import { getListingById, getListingMietpreisbremse } from "@/lib/api";
import { COMPANY_BASE_URLS } from "@/lib/company-urls";
import { lookupAddress } from "@/lib/mietspiegel-streets";

interface ListingDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
    const [showApplyModal, setShowApplyModal] = useState(false);
    const { id } = use(params);

    const [listing, setListing] = useState<Listing | null>(null);
    const [mietpreisbremse, setMietpreisbremse] = useState<MietpreisbremseAssessment | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getListingById(id)
            .then(setListing)
            .catch(() => setError("Listing not found."));
    }, [id]);

    useEffect(() => {
        if (!listing) return;

        const address = listing.address ?? "";
        const houseMatch = address.match(/\b(\d+)\b/);
        const street = houseMatch
            ? address.slice(0, houseMatch.index).replace(/[,\s]+$/, "")
            : "";
        const houseNumber = houseMatch ? Number(houseMatch[1]) : null;

        let wohnlage: "einfach" | "mittel" | "gut" | undefined;
        let isOst: boolean | undefined;

        if (street && houseNumber !== null) {
            const hit = lookupAddress(street, houseNumber);
            if (hit) {
                wohnlage = hit.wohnlage;
                isOst = hit.gebiet === "O";
            }
        }

        void getListingMietpreisbremse(listing.id, {
            wohnlage,
            isOst,
            buildingYear: listing.yearOfConstruction ?? undefined,
            areaM2: listing.areaM2 ?? undefined,
            coldRentAmount: listing.coldRentAmount ?? undefined,
            warmRentAmount: listing.warmRentAmount ?? undefined,
        })
            .then(setMietpreisbremse)
            .catch(() => setMietpreisbremse(null));
    }, [listing]);

    if (error) {
        return (
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
                <p className="text-lg text-muted">{error}</p>
                <Link href="/search" className="text-primary hover:underline">Back to Search</Link>
            </main>
        );
    }

    if (!listing) {
        return (
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-16">
                <p className="text-muted">Loading…</p>
            </main>
        );
    }

    const rentDisplay = listing.warmRentAmount ?? listing.coldRentAmount ?? 0;
    const area = listing.areaM2 ?? 0;
    const pricePerM2 = area > 0 ? rentDisplay / area : 0;

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-muted">
                <Link href="/search" className="hover:text-primary">Search</Link>
                <span className="mx-2">/</span>
                <span className="text-on-background">{listing.city ?? "Unknown"}</span>
                <span className="mx-2">/</span>
                <span className="text-on-background">{listing.title}</span>
            </nav>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Images & Details */}
                <div className="lg:col-span-2">
                    <section className="ds-card overflow-hidden">
                        {/* Image Gallery */}
                        <div className="aspect-video w-full bg-linear-to-br from-surface-low to-surface-high">
                            {listing.imageUrls.length > 0 ? (
                                <img
                                    src={`${COMPANY_BASE_URLS[listing.source] ?? ''}${listing.imageUrls[0]}`}
                                    alt={listing.title}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-6xl">
                                    🏠
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-headline text-on-background">{listing.title}</h1>
                                    <p className="mt-1 text-muted">{listing.address ?? listing.city}</p>
                                </div>
                                {listing.isWBSRequired && (
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                        WBS Required
                                    </span>
                                )}
                            </div>

                            {/* Key Stats */}
                            <div className="mt-6 grid grid-cols-4 gap-4 rounded-xl bg-surface-low p-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">€{parseFloat(Number(rentDisplay).toFixed(2))}</p>
                                    <p className="text-label text-muted">
                                        {listing.warmRentAmount != null ? "Warm" : "Cold"} Rent
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-on-background">{area ? parseFloat(Number(area).toFixed(2)) : "—"}</p>
                                    <p className="text-label text-muted">Square Meters</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-on-background">{listing.rooms ?? "—"}</p>
                                    <p className="text-label text-muted">Rooms</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-on-background">
                                        {pricePerM2 > 0 ? `€${pricePerM2.toFixed(2)}` : "—"}
                                    </p>
                                    <p className="text-label text-muted">Per m²</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <h2 className="text-title text-on-background">About this home</h2>
                                <p className="mt-2 text-muted">
                                    {listing.rooms ? `${listing.rooms}-room apartment` : "Apartment"} located in {listing.city ?? "Berlin"}.
                                    {area > 0 && ` This ${area}m² space offers comfortable living.`}
                                    {listing.freeFrom && ` Available from ${listing.freeFrom}.`}
                                </p>
                            </div>

                            {/* Features */}
                            <div className="mt-6">
                                <h2 className="text-title text-on-background">Details</h2>
                                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                                    <FeatureItem icon="📍" label="City" value={listing.city ?? "—"} />
                                    <FeatureItem icon="🏢" label="Source" value={listing.source} />
                                    {listing.floor != null && (
                                        <FeatureItem
                                            icon="🪜"
                                            label="Floor"
                                            value={listing.maxFloor != null ? `${listing.floor}/${listing.maxFloor}` : `${listing.floor}`}
                                        />
                                    )}
                                    {listing.yearOfConstruction != null && (
                                        <FeatureItem icon="🏗️" label="Year Built" value={`${listing.yearOfConstruction}`} />
                                    )}
                                    {listing.heatingType && (
                                        <FeatureItem icon="🔥" label="Heating" value={listing.heatingType} />
                                    )}
                                    {listing.energyEfficiencyClass && (
                                        <FeatureItem icon="⚡" label="Energy Class" value={listing.energyEfficiencyClass} />
                                    )}
                                    {listing.coldRentAmount != null && listing.warmRentAmount != null && (
                                        <FeatureItem icon="💰" label="Cold Rent" value={`€${parseFloat(Number(listing.coldRentAmount!).toFixed(2))}`} />
                                    )}
                                </div>
                            </div>

                            {/* Features tags */}
                            {listing.features.length > 0 && (
                                <div className="mt-6">
                                    <h2 className="text-title text-on-background">Features</h2>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {listing.features.map((feat) => (
                                            <span
                                                key={feat}
                                                className="rounded-full bg-surface-low px-4 py-2 text-sm text-on-background"
                                            >
                                                {feat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Price Info */}
                    <section className="ds-card mt-6 p-6">
                        <h2 className="text-title text-on-background">📊 Price Details</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            {listing.coldRentAmount != null && (
                                <div className="rounded-xl bg-surface-low p-4">
                                    <p className="text-label text-muted">Cold Rent</p>
                                    <p className="mt-1 text-2xl font-bold text-on-background">€{parseFloat(Number(listing.coldRentAmount!).toFixed(2))}</p>
                                </div>
                            )}
                            {listing.warmRentAmount != null && (
                                <div className="rounded-xl bg-surface-low p-4">
                                    <p className="text-label text-muted">Warm Rent</p>
                                    <p className="mt-1 text-2xl font-bold text-on-background">€{parseFloat(Number(listing.warmRentAmount!).toFixed(2))}</p>
                                </div>
                            )}
                            {pricePerM2 > 0 && (
                                <div className="rounded-xl bg-surface-low p-4">
                                    <p className="text-label text-muted">Price per m²</p>
                                    <p className="mt-1 text-2xl font-bold text-on-background">€{pricePerM2.toFixed(2)}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="ds-card mt-6 p-6">
                        <h2 className="text-title text-on-background">⚖️ Mietpreisbremse Check</h2>
                        {!mietpreisbremse ? (
                            <p className="mt-2 text-sm text-muted">
                                Not enough data to complete legal-cap check (needs area, building year, and rent).
                            </p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-xl bg-surface-low p-4">
                                        <p className="text-label text-muted">Nettokaltmiete / m²</p>
                                        <p className="mt-1 text-2xl font-bold text-on-background">
                                            €{mietpreisbremse.input.coldRentPerM2.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-surface-low p-4">
                                        <p className="text-label text-muted">Mietspiegel Mittelwert</p>
                                        <p className="mt-1 text-2xl font-bold text-on-background">
                                            €{mietpreisbremse.mietspiegel.mid.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-surface-low p-4">
                                        <p className="text-label text-muted">Max legal (+10%)</p>
                                        <p className="mt-1 text-2xl font-bold text-on-background">
                                            €{mietpreisbremse.mietspiegel.maxLegalPerM2.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-surface-high p-4">
                                    <p className="text-sm text-muted">Verdict</p>
                                    <p className="mt-1 text-lg font-semibold text-on-background">
                                        {mietpreisbremse.result.verdict === "COMPLIANT"
                                            ? "Compliant"
                                            : mietpreisbremse.result.verdict === "BORDERLINE"
                                                ? "Borderline"
                                                : "Exceeds rent cap"}
                                    </p>
                                    {mietpreisbremse.result.overpaymentMonthlyEur > 0 && (
                                        <p className="mt-1 text-sm text-muted">
                                            Estimated overpayment: €{mietpreisbremse.result.overpaymentMonthlyEur.toFixed(2)} / month
                                        </p>
                                    )}
                                </div>

                                {mietpreisbremse.assumptions.length > 0 && (
                                    <div className="rounded-xl bg-surface-low p-4">
                                        <p className="text-sm font-medium text-on-background">Assumptions</p>
                                        <ul className="mt-2 list-disc pl-5 text-sm text-muted">
                                            {mietpreisbremse.assumptions.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
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
                            {listing.listingUrl && (
                                <a
                                    href={listing.listingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-secondary flex w-full items-center justify-center gap-2"
                                >
                                    <span>🔗</span>
                                    View Original Listing
                                </a>
                            )}
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
                                {listing.floor != null && (
                                    <div className="flex justify-between">
                                        <span className="text-muted">Floor</span>
                                        <span className="font-medium text-on-background">
                                            {listing.floor}{listing.maxFloor != null ? ` / ${listing.maxFloor}` : ""}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted">Price/m²</span>
                                    <span className="font-medium text-on-background">
                                        {pricePerM2 > 0 ? `€${pricePerM2.toFixed(2)}` : "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">First seen</span>
                                    <span className="font-medium text-on-background">
                                        {new Date(listing.firstSeenAt).toLocaleDateString()}
                                    </span>
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
                            You&apos;re applying for: <span className="font-medium text-on-background">{listing.title}</span>
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
