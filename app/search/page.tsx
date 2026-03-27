"use client";

import { useState, useMemo } from "react";
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
            {/* Header */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Search Apartments</h1>
                        <p className="mt-1 text-sm text-black/70">
                            Find your perfect home in Berlin with AI-powered recommendations
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{filteredListings.length}</p>
                        <p className="text-xs text-black/60">listings found</p>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button
                        onClick={clearFilters}
                        className="text-sm text-black/60 underline hover:text-black"
                    >
                        Clear all
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* District */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">District</label>
                        <select
                            value={filters.district}
                            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                            className="w-full rounded-xl border border-black/20 px-3 py-2.5"
                        >
                            <option value="">All districts</option>
                            {allDistricts.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">Price Range (EUR)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                placeholder="Min"
                                className="w-full rounded-xl border border-black/20 px-3 py-2.5"
                            />
                            <input
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                placeholder="Max"
                                className="w-full rounded-xl border border-black/20 px-3 py-2.5"
                            />
                        </div>
                    </div>

                    {/* Size Range */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">Size (m²)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={filters.minSize}
                                onChange={(e) => setFilters({ ...filters, minSize: e.target.value })}
                                placeholder="Min"
                                className="w-full rounded-xl border border-black/20 px-3 py-2.5"
                            />
                            <input
                                type="number"
                                value={filters.maxSize}
                                onChange={(e) => setFilters({ ...filters, maxSize: e.target.value })}
                                placeholder="Max"
                                className="w-full rounded-xl border border-black/20 px-3 py-2.5"
                            />
                        </div>
                    </div>

                    {/* Rooms */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">Rooms</label>
                        <select
                            value={filters.rooms}
                            onChange={(e) => setFilters({ ...filters, rooms: e.target.value })}
                            className="w-full rounded-xl border border-black/20 px-3 py-2.5"
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
                        <label className="mb-1 block text-sm font-medium">Source</label>
                        <select
                            value={filters.source}
                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                            className="w-full rounded-xl border border-black/20 px-3 py-2.5"
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
                        <label className="mb-1 block text-sm font-medium">Max Commute (min)</label>
                        <select
                            value={filters.maxCommute}
                            onChange={(e) => setFilters({ ...filters, maxCommute: e.target.value })}
                            className="w-full rounded-xl border border-black/20 px-3 py-2.5"
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
                        <label className="mb-1 block text-sm font-medium">Sort by</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="w-full rounded-xl border border-black/20 px-3 py-2.5"
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
                    <label className="mb-2 block text-sm font-medium">Vibe & Lifestyle</label>
                    <div className="flex flex-wrap gap-2">
                        {allVibeTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleVibeTag(tag)}
                                className={`rounded-full px-4 py-1.5 text-sm transition ${
                                    filters.vibeTags.includes(tag)
                                        ? "bg-black text-white"
                                        : "border border-black/20 bg-white hover:bg-black/5"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Search Results</h2>

                {filteredListings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-black/60">No listings match your filters</p>
                        <button
                            onClick={clearFilters}
                            className="mt-3 text-sm text-black underline"
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
                                className="group rounded-xl border border-black/15 bg-white p-4 transition hover:border-black hover:shadow-md"
                            >
                                <div className="aspect-video w-full overflow-hidden rounded-lg bg-black/10">
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
                                    <p className="mt-1 text-sm text-black/60">{listing.district}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-lg font-bold">€{listing.monthlyRentEur}</span>
                                        <span className="text-sm text-black/60">{listing.sizeM2}m² · {listing.rooms} rooms</span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {listing.vibeTags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/70"
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
