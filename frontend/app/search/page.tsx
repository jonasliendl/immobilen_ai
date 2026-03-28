"use client";

import { useState, useMemo } from "react";
import { FeaturePageIntro } from "@/components/feature-page-intro";
import { Listing } from "@/lib/types";
import { berlinListings, districtRentBenchmarkPerM2 } from "@/lib/data";

type Filters = {
    district: string;
    minPrice: string;
    maxPrice: string;
    minSize: string;
    maxSize: string;
    rooms: string;
    source: string;
    maxCommute: string;
    vibeTags: string[];
};

const allVibeTags = Array.from(
    new Set(berlinListings.flatMap((l) => l.vibeTags))
);

const allSources = Array.from(
    new Set(berlinListings.map((l) => l.source))
);

const allDistricts = Array.from(
    new Set(berlinListings.map((l) => l.district))
);

export default function SearchPage() {
    const [filters, setFilters] = useState<Filters>({
        district: "",
        minPrice: "",
        maxPrice: "",
        minSize: "",
        maxSize: "",
        rooms: "",
        source: "",
        maxCommute: "",
        vibeTags: [],
    });

    const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "size_desc" | "newest">("relevance");

    const filteredListings = useMemo(() => {
        let result = [...berlinListings];

        if (filters.district) {
            result = result.filter((l) => l.district === filters.district);
        }
        if (filters.minPrice) {
            result = result.filter((l) => l.monthlyRentEur >= Number(filters.minPrice));
        }
        if (filters.maxPrice) {
            result = result.filter((l) => l.monthlyRentEur <= Number(filters.maxPrice));
        }
        if (filters.minSize) {
            result = result.filter((l) => l.sizeM2 >= Number(filters.minSize));
        }
        if (filters.maxSize) {
            result = result.filter((l) => l.sizeM2 <= Number(filters.maxSize));
        }
        if (filters.rooms) {
            result = result.filter((l) => l.rooms >= Number(filters.rooms));
        }
        if (filters.source) {
            result = result.filter((l) => l.source === filters.source);
        }
        if (filters.maxCommute) {
            result = result.filter((l) => l.commuteMinutesToCenter <= Number(filters.maxCommute));
        }
        if (filters.vibeTags.length > 0) {
            result = result.filter((l) =>
                filters.vibeTags.some((tag) => l.vibeTags.includes(tag))
            );
        }

        switch (sortBy) {
            case "price_asc":
                result.sort((a, b) => a.monthlyRentEur - b.monthlyRentEur);
                break;
            case "price_desc":
                result.sort((a, b) => b.monthlyRentEur - a.monthlyRentEur);
                break;
            case "size_desc":
                result.sort((a, b) => b.sizeM2 - a.sizeM2);
                break;
            case "newest":
                result.reverse();
                break;
        }

        return result;
    }, [filters, sortBy]);

    function toggleVibeTag(tag: string) {
        setFilters((prev) => ({
            ...prev,
            vibeTags: prev.vibeTags.includes(tag)
                ? prev.vibeTags.filter((t) => t !== tag)
                : [...prev.vibeTags, tag],
        }));
    }

    function clearFilters() {
        setFilters({
            district: "",
            minPrice: "",
            maxPrice: "",
            minSize: "",
            maxSize: "",
            rooms: "",
            source: "",
            maxCommute: "",
            vibeTags: [],
        });
    }

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            <FeaturePageIntro
                eyebrow="Search"
                title="Find Berlin flats in one place"
                description="This page is your unified listing browser. Lucid Intelligence aggregates signals from multiple Berlin sources (including Genossenschaft-friendly filters), applies Mietpreisbremse-style checks where data allows, and lets you slice by district, rent, size, rooms, commute, and vibe — so cooperative members and budget hunters see the cheapest legal options first."
                howItWorks={[
                    "Set filters on the left: district, price band, square metres, rooms, source (e.g. Genossenschaft), commute cap, and vibe tags.",
                    "We rank and filter the in-app Berlin dataset instantly; each card links to detail and apply flows.",
                    "Switch sort order (price, size, newest) to stress-test affordability against your shareholder or personal budget.",
                    "Shortlist favourites and continue in Application Tracker or Chat if you need wording or eligibility help.",
                ]}
            />
            <section className="flex flex-col justify-between gap-4 rounded-2xl bg-surface-container-low px-6 py-4 shadow-sm sm:flex-row sm:items-center">
                <p className="font-sans text-sm text-on-surface/80">
                    <span className="font-mono text-2xl font-bold text-primary">{filteredListings.length}</span> listings
                    match your current filters.
                </p>
            </section>

            {/* Filters */}
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
                    {/* District */}
                    <div>
                        <label className="text-label mb-1 block text-muted">District</label>
                        <select
                            value={filters.district}
                            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                            className="ds-input w-full"
                        >
                            <option value="">All districts</option>
                            {allDistricts.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="text-label mb-1 block text-muted">Price Range (EUR)</label>
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

                    {/* Size Range */}
                    <div>
                        <label className="text-label mb-1 block text-muted">Size (m²)</label>
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

                    {/* Rooms */}
                    <div>
                        <label className="text-label mb-1 block text-muted">Rooms</label>
                        <select
                            value={filters.rooms}
                            onChange={(e) => setFilters({ ...filters, rooms: e.target.value })}
                            className="ds-input w-full"
                        >
                            <option value="">Any</option>
                            <option value="1">1+ room</option>
                            <option value="2">2+ rooms</option>
                            <option value="3">3+ rooms</option>
                            <option value="4">4+ rooms</option>
                        </select>
                    </div>

                    {/* Source */}
                    <div>
                        <label className="text-label mb-1 block text-muted">Source</label>
                        <select
                            value={filters.source}
                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                            className="ds-input w-full"
                        >
                            <option value="">All sources</option>
                            {allSources.map((s) => (
                                <option key={s} value={s}>
                                    {s === "genossenschaft" ? "Wohnungsgenossenschaften" : s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Max Commute */}
                    <div>
                        <label className="text-label mb-1 block text-muted">Max Commute (min)</label>
                        <select
                            value={filters.maxCommute}
                            onChange={(e) => setFilters({ ...filters, maxCommute: e.target.value })}
                            className="ds-input w-full"
                        >
                            <option value="">Any</option>
                            <option value="15">15 min</option>
                            <option value="20">20 min</option>
                            <option value="25">25 min</option>
                            <option value="30">30 min</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div>
                        <label className="text-label mb-1 block text-muted">Sort by</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="ds-input w-full"
                        >
                            <option value="relevance">Relevance</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="size_desc">Size: Largest first</option>
                            <option value="newest">Newest first</option>
                        </select>
                    </div>
                </div>

                {/* Vibe Tags */}
                <div className="mt-4">
                    <label className="text-label mb-2 block text-muted">Vibe & Lifestyle</label>
                    <div className="flex flex-wrap gap-2">
                        {allVibeTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleVibeTag(tag)}
                                className={`rounded-full px-4 py-1.5 text-sm transition ${filters.vibeTags.includes(tag)
                                        ? "bg-primary text-white"
                                        : "bg-surface-card ghost-border hover:bg-surface-high"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="ds-card p-6">
                <h2 className="text-title mb-4 text-on-background">Search Results</h2>

                {filteredListings.length === 0 ? (
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
                        {filteredListings.map((listing) => (
                            <a
                                key={listing.id}
                                href={`/listings/${listing.id}`}
                                className="ds-card group p-4"
                            >
                                <div className="aspect-video w-full overflow-hidden rounded-xl bg-surface-low">
                                    <div className="flex h-full items-center justify-center text-4xl">
                                        🏠
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-semibold group-hover:underline">{listing.title}</h3>
                                        {listing.source === "genossenschaft" && (
                                            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                Genossenschaft
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-muted">{listing.district}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-lg font-bold text-on-background">€{listing.monthlyRentEur}</span>
                                        <span className="text-sm text-muted">{listing.sizeM2}m² · {listing.rooms} rooms</span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {listing.vibeTags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-full bg-surface-low px-2 py-0.5 text-xs text-muted"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
