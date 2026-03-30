"use client";

import { useState, useEffect, useCallback } from "react";
import { FeaturePageIntro } from "@/components/feature-page-intro";
import type { Listing, ListingsResponse } from "@/lib/types";
import { getListings } from "@/lib/api";
import { COMPANY_BASE_URLS } from "@/lib/company-urls";

type MietpreisbremseVerdict = "" | "COMPLIANT" | "BORDERLINE" | "EXCEEDS_RENT_CAP";

type Filters = {
    city: string;
    minPrice: string;
    maxPrice: string;
    minSize: string;
    maxSize: string;
    rooms: string;
    source: string;
    q: string;
    isWBSRequired: string;
    mietpreisbremseVerdict: MietpreisbremseVerdict;
};

type SortOption =
    | "newest"
    | "price_asc"
    | "price_desc"
    | "size_desc"
    | "rooms_desc"
    | "legal_safest"
    | "legal_riskiest";

const SORT_MAP: Record<SortOption, { sortBy: string; sortOrder: "asc" | "desc" }> = {
    newest: { sortBy: "firstSeenAt", sortOrder: "desc" },
    price_asc: { sortBy: "warmRentAmount", sortOrder: "asc" },
    price_desc: { sortBy: "warmRentAmount", sortOrder: "desc" },
    size_desc: { sortBy: "areaM2", sortOrder: "desc" },
    rooms_desc: { sortBy: "rooms", sortOrder: "desc" },
    legal_safest: { sortBy: "mietpreisbremseOverpaymentPercent", sortOrder: "asc" },
    legal_riskiest: { sortBy: "mietpreisbremseOverpaymentPercent", sortOrder: "desc" },
};

function verdictBadgeProps(listing: Listing): { label: string; className: string } | null {
    const verdict = listing.mietpreisbremse?.verdict;
    if (!verdict) return null;

    if (verdict === "COMPLIANT") {
        return {
            label: "Legal cap: compliant",
            className: "rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700",
        };
    }

    if (verdict === "BORDERLINE") {
        return {
            label: "Legal cap: borderline",
            className: "rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700",
        };
    }

    return {
        label: "Legal cap: exceeds",
        className: "rounded bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700",
    };
}

export default function SearchPage() {
    const [filters, setFilters] = useState<Filters>({
        city: "",
        minPrice: "",
        maxPrice: "",
        minSize: "",
        maxSize: "",
        rooms: "",
        source: "",
        q: "",
        isWBSRequired: "",
        mietpreisbremseVerdict: "",
    });

    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [listings, setListings] = useState<Listing[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchListings = useCallback(async (currentPage: number) => {
        setLoading(true);
        try {
            const sort = SORT_MAP[sortBy];
            const res: ListingsResponse = await getListings({
                page: currentPage,
                limit: 24,
                sortBy: sort.sortBy,
                sortOrder: sort.sortOrder,
                includeMietpreisbremse: true,
                ...(filters.q && { q: filters.q }),
                ...(filters.source && { source: filters.source }),
                ...(filters.city && { city: filters.city }),
                ...(filters.minPrice && { minWarmRent: Number(filters.minPrice) }),
                ...(filters.maxPrice && { maxWarmRent: Number(filters.maxPrice) }),
                ...(filters.minSize && { minAreaM2: Number(filters.minSize) }),
                ...(filters.maxSize && { maxAreaM2: Number(filters.maxSize) }),
                ...(filters.rooms && { minRooms: Number(filters.rooms) }),
                ...(filters.isWBSRequired && { isWBSRequired: filters.isWBSRequired === "true" }),
                ...(filters.mietpreisbremseVerdict && { mietpreisbremseVerdict: filters.mietpreisbremseVerdict }),
            });

            setListings(res.data);
            setTotal(res.meta.total);
        } catch {
            setListings([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [filters, sortBy]);

    useEffect(() => {
        setPage(1);
        fetchListings(1);
    }, [fetchListings]);

    function clearFilters() {
        setFilters({
            city: "",
            minPrice: "",
            maxPrice: "",
            minSize: "",
            maxSize: "",
            rooms: "",
            source: "",
            q: "",
            isWBSRequired: "",
            mietpreisbremseVerdict: "",
        });
    }

    function displayRent(listing: Listing): string {
        if (listing.warmRentAmount != null) return `EUR ${listing.warmRentAmount}`;
        if (listing.coldRentAmount != null) return `EUR ${listing.coldRentAmount}`;
        return "N/A";
    }

    const totalPages = Math.max(1, Math.ceil(total / 24));

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            <FeaturePageIntro
                eyebrow="Search"
                title="Find Berlin flats in one place"
                description="This page is your unified listing browser. Lucid Intelligence aggregates signals from multiple Berlin sources (including Genossenschaft-friendly filters), applies Mietpreisbremse-style checks where data allows, and lets you slice by city, rent, size, rooms, and WBS - so cooperative members and budget hunters see the cheapest legal options first."
                howItWorks={[
                    "Set filters on the left: city, price band, square metres, rooms, source, WBS requirement, legal-cap status, and text search.",
                    "We query the backend listing database - each card links to detail and apply flows.",
                    "Switch sort order (price, size, newest, legal safety) to stress-test affordability against your shareholder or personal budget.",
                    "Shortlist favourites and continue in Application Tracker or Chat if you need wording or eligibility help.",
                ]}
            />
            <section className="flex flex-col justify-between gap-4 rounded-2xl bg-surface-container-low px-6 py-4 shadow-sm sm:flex-row sm:items-center">
                <p className="font-sans text-sm text-on-surface/80">
                    <span className="font-mono text-2xl font-bold text-primary">{total}</span> listings
                    match your current filters.
                </p>
            </section>

            <section className="ds-section">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-title text-on-background">Filters</h2>
                    <button
                        onClick={clearFilters}
                        className="text-sm text-primary hover:text-primary-hover"
                    >
                        Clear all
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="text-label mb-1 block text-muted">Search</label>
                        <input
                            type="text"
                            value={filters.q}
                            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                            placeholder="Title or address..."
                            className="ds-input w-full"
                        />
                    </div>

                    <div>
                        <label className="text-label mb-1 block text-muted">City</label>
                        <input
                            type="text"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            placeholder="e.g. Berlin"
                            className="ds-input w-full"
                        />
                    </div>

                    <div>
                        <label className="text-label mb-1 block text-muted">Warm Rent (EUR)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                placeholder="Min"
                                className="ds-input w-full"
                            />
                            <input
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                placeholder="Max"
                                className="ds-input w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-label mb-1 block text-muted">Size (m2)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={filters.minSize}
                                onChange={(e) => setFilters({ ...filters, minSize: e.target.value })}
                                placeholder="Min"
                                className="ds-input w-full"
                            />
                            <input
                                type="number"
                                value={filters.maxSize}
                                onChange={(e) => setFilters({ ...filters, maxSize: e.target.value })}
                                placeholder="Max"
                                className="ds-input w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-label mb-1 block text-muted">Rooms</label>
                        <select
                            value={filters.rooms}
                            onChange={(e) => setFilters({ ...filters, rooms: e.target.value })}
                            title="Rooms"
                            className="ds-input w-full"
                        >
                            <option value="">Any</option>
                            <option value="1">1+ room</option>
                            <option value="2">2+ rooms</option>
                            <option value="3">3+ rooms</option>
                            <option value="4">4+ rooms</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-label mb-1 block text-muted">Source</label>
                        <input
                            type="text"
                            value={filters.source}
                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                            placeholder="e.g. inberlinwohnen"
                            className="ds-input w-full"
                        />
                    </div>

                    <div>
                        <label className="text-label mb-1 block text-muted">WBS Required</label>
                        <select
                            value={filters.isWBSRequired}
                            onChange={(e) => setFilters({ ...filters, isWBSRequired: e.target.value })}
                            title="WBS required"
                            className="ds-input w-full"
                        >
                            <option value="">Any</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-label mb-1 block text-muted">Legal-cap status</label>
                        <select
                            value={filters.mietpreisbremseVerdict}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    mietpreisbremseVerdict: e.target.value as MietpreisbremseVerdict,
                                })
                            }
                            title="Legal-cap status"
                            className="ds-input w-full"
                        >
                            <option value="">Any</option>
                            <option value="COMPLIANT">Compliant</option>
                            <option value="BORDERLINE">Borderline</option>
                            <option value="EXCEEDS_RENT_CAP">Exceeds cap</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-label mb-1 block text-muted">Sort by</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            title="Sort by"
                            className="ds-input w-full"
                        >
                            <option value="newest">Newest first</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="size_desc">Size: Largest first</option>
                            <option value="rooms_desc">Rooms: Most first</option>
                            <option value="legal_safest">Legal safety: best first</option>
                            <option value="legal_riskiest">Legal risk: highest first</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="ds-card p-6">
                <h2 className="text-title mb-4 text-on-background">Search Results</h2>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted">Loading listings...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted">No listings match your filters</p>
                        <button
                            onClick={clearFilters}
                            className="mt-3 text-sm text-primary hover:text-primary-hover"
                        >
                            Clear filters and try again
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {listings.map((listing) => {
                            const badge = verdictBadgeProps(listing);
                            return (
                                <a
                                    key={listing.id}
                                    href={`/listings/${listing.id}`}
                                    className="ds-card group p-4"
                                >
                                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-surface-low">
                                        {listing.imageUrls.length > 0 && COMPANY_BASE_URLS[listing.source] ? (
                                            <img
                                                src={`${COMPANY_BASE_URLS[listing.source] ?? ""}${listing.imageUrls[0]}`}
                                                alt={listing.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-muted">
                                                No image
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-semibold group-hover:underline">{listing.title}</h3>
                                            <div className="flex flex-col items-end gap-1">
                                                {listing.isWBSRequired && (
                                                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        WBS
                                                    </span>
                                                )}
                                                {badge && (
                                                    <span className={badge.className}>{badge.label}</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="mt-1 text-sm text-muted">{listing.address ?? listing.city}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-lg font-bold text-on-background">{displayRent(listing)}</span>
                                            <span className="text-sm text-muted">
                                                {listing.areaM2 != null ? `${listing.areaM2}m2` : ""}
                                                {listing.rooms != null ? ` · ${listing.rooms} rooms` : ""}
                                            </span>
                                        </div>
                                        {listing.features.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {listing.features.slice(0, 3).map((feat) => (
                                                    <span
                                                        key={feat}
                                                        className="rounded-full bg-surface-low px-2 py-0.5 text-xs text-muted"
                                                    >
                                                        {feat}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <button
                            disabled={page <= 1}
                            onClick={() => {
                                const p = page - 1;
                                setPage(p);
                                fetchListings(p);
                            }}
                            className="btn-secondary h-auto! px-3! py-1.5! text-sm disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-muted">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => {
                                const p = page + 1;
                                setPage(p);
                                fetchListings(p);
                            }}
                            className="btn-secondary h-auto! px-3! py-1.5! text-sm disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
