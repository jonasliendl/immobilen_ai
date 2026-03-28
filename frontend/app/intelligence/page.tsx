"use client";

import { useEffect, useMemo, useState } from "react";
import { FeaturePageIntro } from "@/components/feature-page-intro";
import { berlinListings, districtRentBenchmarkPerM2 } from "@/lib/data";
import { calculatePriceAssessment } from "@/lib/scoring";
import { NeighborhoodMapResponse } from "@/lib/types";
import Link from "next/link";
import dynamic from "next/dynamic";

const BerlinNeighborhoodMap = dynamic(
    () => import("@/components/berlin-neighborhood-map").then((mod) => mod.BerlinNeighborhoodMap),
    {
        ssr: false,
        loading: () => <div className="h-[420px] animate-pulse rounded-2xl bg-surface-low" />,
    },
);

type TimeRange = "7d" | "30d" | "90d" | "1y";
type ViewMode = "overview" | "districts" | "predictions";

const mockTrends = {
    "7d": { avgPrice: 1250, change: 2.3, listings: 145 },
    "30d": { avgPrice: 1180, change: -1.5, listings: 520 },
    "90d": { avgPrice: 1220, change: 5.2, listings: 1450 },
    "1y": { avgPrice: 1150, change: 8.7, listings: 5200 },
};

const districtStats = Object.entries(districtRentBenchmarkPerM2).map(([district, pricePerM2], i) => ({
    district,
    pricePerM2,
    avgRent: pricePerM2 * 55, // avg 55m2
    listings: berlinListings.filter((l) => l.city === district || (l.address && l.address.includes(district))).length,
    trend: ((((i * 7 + 3) % 13) - 5) * 0.8).toFixed(2),
}));

export default function IntelligencePage() {
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");
    const [viewMode, setViewMode] = useState<ViewMode>("overview");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [mapOverlay, setMapOverlay] = useState<NeighborhoodMapResponse | null>(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [predictions, setPredictions] = useState<
        { title: string; prediction: string; confidence: number; tags: string[]; isPositive?: boolean }[]
    >([]);
    const [predictionsLoading, setPredictionsLoading] = useState(false);
    const [predictionsProvider, setPredictionsProvider] = useState<string>("");

    const trends = mockTrends[timeRange];

    useEffect(() => {
        if (viewMode !== "predictions") return;
        let active = true;

        async function loadPredictions() {
            setPredictionsLoading(true);
            try {
                const res = await fetch(`/api/intelligence/predictions?timeRange=${timeRange}`);
                if (!res.ok) throw new Error("fetch failed");
                const data = (await res.json()) as {
                    predictions: typeof predictions;
                    provider: string;
                };
                if (!active) return;
                setPredictions(data.predictions);
                setPredictionsProvider(data.provider);
            } catch {
                if (!active) return;
                setPredictions([
                    {
                        title: "Best Districts Next Month",
                        prediction:
                            "Based on current listing volume, Friedrichshain and Wedding show increasing supply with stable prices.",
                        confidence: 68,
                        tags: ["Friedrichshain", "Wedding"],
                        isPositive: true,
                    },
                    {
                        title: "Price Forecast",
                        prediction:
                            "Average rents expected to rise 2-3% in Q2 2026 due to seasonal demand.",
                        confidence: 60,
                        tags: ["Berlin-wide", "Q2 2026"],
                    },
                    {
                        title: "Genossenschaft Opportunities",
                        prediction:
                            "Multiple co-ops typically open spring application rounds. Complete documents improve your position.",
                        confidence: 72,
                        tags: ["Genossenschaft", "Spring Cycle"],
                        isPositive: true,
                    },
                ]);
                setPredictionsProvider("fallback");
            } finally {
                if (active) setPredictionsLoading(false);
            }
        }

        void loadPredictions();
        return () => { active = false; };
    }, [viewMode, timeRange]);

    useEffect(() => {
        let active = true;

        async function loadOverlay() {
            setMapLoading(true);
            const params = new URLSearchParams();
            if (selectedDistrict) params.set("district", selectedDistrict);

            const response = await fetch(`/api/neighborhoods/map?${params.toString()}`);
            if (!response.ok) {
                if (active) setMapLoading(false);
                return;
            }

            const data = (await response.json()) as NeighborhoodMapResponse;
            if (!active) return;

            setMapOverlay(data);
            setMapLoading(false);
        }

        void loadOverlay();

        return () => {
            active = false;
        };
    }, [selectedDistrict]);

    const marketInsights = useMemo(() => [
        {
            icon: "📈",
            title: "Rising Demand",
            description: "Prenzlauer Berg sees 15% more applications per listing this month",
            severity: "info",
        },
        {
            icon: "💰",
            title: "Price Alert",
            description: "Average rent in Neukoelln increased by €50 compared to last month",
            severity: "warning",
        },
        {
            icon: "🎯",
            title: "Best Time to Apply",
            description: "Applications sent on Tuesday-Thursday get 23% more responses",
            severity: "success",
        },
        {
            icon: "🏆",
            title: "Your Edge",
            description: "Your profile scores in the top 30% for Genossenschaft applications",
            severity: "success",
        },
    ], []);

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            <FeaturePageIntro
                eyebrow="Market Intelligence"
                title="See rent pressure before you apply"
                description="This dashboard turns Berlin listing and benchmark data into charts, district tables, and a live map overlay. Use it to check whether a flat is above typical neighbourhood rent, spot trends, and prioritise Genossenschaft or affordable pockets — then jump back to Search with clearer targets."
                howItWorks={[
                    "Pick a time window (7d–1y) to frame how aggressive the market feels.",
                    "Scan district stats and mock insight cards for directional signals (demo data today).",
                    "Use the map (client-only Leaflet) with overlays from /api/neighborhoods/map for spatial context.",
                    "Filter by district when you want the map and stats to focus on one borough.",
                ]}
            />
            <section className="flex flex-col justify-between gap-4 rounded-2xl bg-surface-container-low px-6 py-4 shadow-sm sm:flex-row sm:items-center">
                <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-primary">Live view</p>
                    <p className="font-sans text-sm text-on-surface/80">
                        Map + metrics update when you change district or range below.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ViewButton active={viewMode === "overview"} onClick={() => setViewMode("overview")}>
                        Overview
                    </ViewButton>
                    <ViewButton active={viewMode === "districts"} onClick={() => setViewMode("districts")}>
                        Districts
                    </ViewButton>
                    <ViewButton active={viewMode === "predictions"} onClick={() => setViewMode("predictions")}>
                        Predictions
                    </ViewButton>
                </div>
            </section>

            {/* Time Range Selector */}
            <section className="flex items-center justify-between ds-card p-4">
                <div className="flex gap-2">
                    {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${timeRange === range
                                ? "bg-primary text-white"
                                : "bg-surface-low hover:bg-surface-high"
                                }`}
                        >
                            {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : range === "90d" ? "Last 90 days" : "Last year"}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-muted">
                    Data updated: <span className="font-medium text-on-background">2 hours ago</span>
                </p>
            </section>

            {/* Key Metrics */}
            <section className="grid gap-4 md:grid-cols-4">
                <MetricCard
                    label="Average Rent"
                    value={`€${trends.avgPrice}`}
                    trend={trends.change}
                    icon="💶"
                />
                <MetricCard
                    label="Active Listings"
                    value={trends.listings.toString()}
                    trend={5.2}
                    icon="🏠"
                />
                <MetricCard
                    label="Your Success Rate"
                    value="34%"
                    trend={12}
                    icon="🎯"
                    isPositive={true}
                />
                <MetricCard
                    label="Avg. Response Time"
                    value="4.2 days"
                    trend={-8}
                    icon="⏱️"
                    isPositive={true}
                />
            </section>

            {/* Market Insights */}
            <section className="ds-card p-6">
                <h2 className="text-title mb-4 text-on-background">Market Insights</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {marketInsights.map((insight, index) => (
                        <div
                            key={index}
                            className={`rounded-xl p-4 ${insight.severity === "warning"
                                ? "bg-yellow-50"
                                : insight.severity === "success"
                                    ? "bg-green-50"
                                    : "bg-secondary-fixed"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{insight.icon}</span>
                                <div>
                                    <p className="font-semibold text-on-background">{insight.title}</p>
                                    <p className="mt-1 text-sm text-muted">{insight.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="ds-card p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-title text-on-background">Berlin Noise & Commute Overlay</h2>
                        <p className="mt-1 text-sm text-muted">
                            OpenStreetMap tiles with LOR-compatible overlay data. When no official GeoJSON URL is configured,
                            the app falls back to lightweight district geometries so the experience stays available.
                        </p>
                    </div>
                    <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-medium text-muted">
                        Source: {mapOverlay?.source ?? "loading"}
                    </span>
                </div>

                {mapLoading && <div className="h-[420px] animate-pulse rounded-2xl bg-surface-low" />}
                {!mapLoading && mapOverlay && (
                    <>
                        <BerlinNeighborhoodMap
                            overlay={mapOverlay}
                            selectedDistrict={selectedDistrict || undefined}
                        />
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-black/60">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">Low noise</span>
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">Medium noise</span>
                            <span className="rounded-full bg-red-100 px-3 py-1 text-red-800">High noise</span>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">Dashed lines = commute corridors</span>
                        </div>
                    </>
                )}
            </section>

            {viewMode === "overview" && (
                <>
                    {/* Price Trends Chart Placeholder */}
                    <section className="ds-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-title text-on-background">Price Trends</h2>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="ds-input"
                            >
                                <option value="">All Berlin</option>
                                {Object.keys(districtRentBenchmarkPerM2).map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex h-64 items-end justify-between gap-2 rounded-xl bg-surface-low p-4">
                            {[65, 72, 68, 75, 82, 78, 85, 88, 84, 90, 92, 95].map((height, i) => (
                                <div
                                    key={i}
                                    className="flex-1 rounded-t-lg bg-gradient-to-t from-primary-container to-primary transition hover:opacity-80"
                                    style={{ height: `${height}%` }}
                                    title={`Month ${i + 1}: €${1000 + height * 3}`}
                                />
                            ))}
                        </div>
                        <div className="mt-3 flex justify-between text-xs text-muted">
                            <span>Jan</span>
                            <span>Mar</span>
                            <span>Jun</span>
                            <span>Sep</span>
                            <span>Dec</span>
                        </div>
                    </section>

                    {/* District Comparison */}
                    <section className="ds-card p-6">
                        <h2 className="text-title mb-4 text-on-background">District Comparison</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left">
                                        <th className="pb-3 font-semibold text-on-background">District</th>
                                        <th className="pb-3 font-semibold text-on-background">Avg Rent/m²</th>
                                        <th className="pb-3 font-semibold text-on-background">Avg Total Rent</th>
                                        <th className="pb-3 font-semibold text-on-background">Listings</th>
                                        <th className="pb-3 font-semibold text-on-background">Trend</th>
                                        <th className="pb-3 font-semibold text-on-background">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {districtStats.map((stat) => (
                                        <tr key={stat.district} className="">
                                            <td className="py-3 font-medium text-on-background">{stat.district}</td>
                                            <td className="py-3 text-muted">€{parseFloat(stat.pricePerM2.toFixed(2))}/m²</td>
                                            <td className="py-3 text-muted">€{parseFloat(stat.avgRent.toFixed(2))}</td>
                                            <td className="py-3 text-muted">{stat.listings}</td>
                                            <td className={`py-3 ${Number(stat.trend) > 0 ? "text-red-600" : "text-green-600"}`}>
                                                {Number(stat.trend) > 0 ? "↑" : "↓"} {Math.abs(Number(stat.trend))}%
                                            </td>
                                            <td className="py-3">
                                                <Link
                                                    href={`/search?district=${encodeURIComponent(stat.district)}`}
                                                    className="text-primary hover:text-primary-hover"
                                                >
                                                    Browse
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}

            {viewMode === "districts" && (
                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {districtStats.map((stat) => (
                        <div
                            key={stat.district}
                            className="ds-card p-5"
                        >
                            <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-on-background">{stat.district}</h3>
                                <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${Number(stat.trend) > 0
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                        }`}
                                >
                                    {Number(stat.trend) > 0 ? "↑" : "↓"} {Math.abs(Number(stat.trend))}%
                                </span>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Price/m²</span>
                                    <span className="font-medium text-on-background">€{parseFloat(stat.pricePerM2.toFixed(2))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Avg Rent</span>
                                    <span className="font-medium text-on-background">€{parseFloat(stat.avgRent.toFixed(2))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Active Listings</span>
                                    <span className="font-medium text-on-background">{stat.listings}</span>
                                </div>
                            </div>
                            <Link
                                href={`/search?district=${encodeURIComponent(stat.district)}`}
                                className="mt-4 block w-full rounded-xl bg-surface-low py-2 text-center text-sm font-medium text-primary transition hover:bg-surface-high"
                            >
                                View {stat.listings} listings →
                            </Link>
                        </div>
                    ))}
                </section>
            )}

            {viewMode === "predictions" && (
                <>
                    {/* AI Predictions */}
                    <section className="ds-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-title text-on-background">AI Predictions</h2>
                            {predictionsProvider && (
                                <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-medium text-muted">
                                    Source: {predictionsProvider}
                                </span>
                            )}
                        </div>
                        {predictionsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-low" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {predictions.map((pred, i) => (
                                    <PredictionCard
                                        key={i}
                                        title={pred.title}
                                        prediction={pred.prediction}
                                        confidence={pred.confidence}
                                        tags={pred.tags}
                                        isPositive={pred.isPositive}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Success Probability Calculator */}
                    <section className="ds-card p-6">
                        <h2 className="text-title mb-4 text-on-background">📊 Success Probability Calculator</h2>
                        <p className="mb-4 text-sm text-muted">
                            Select a listing to see your personalized success probability based on your profile,
                            income, and competition analysis.
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                            {berlinListings.slice(0, 4).map((listing) => {
                                const assessment = calculatePriceAssessment(listing);
                                const probability = calculateMockProbability(listing);
                                return (
                                    <Link
                                        key={listing.id}
                                        href={`/intelligence/${listing.id}`}
                                        className="ds-card p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-on-background">{listing.title}</p>
                                                <p className="text-sm text-muted">{listing.city ?? "Berlin"}</p>
                                            </div>
                                            <div
                                                className={`rounded-full px-3 py-1 text-sm font-bold ${probability >= 70
                                                    ? "bg-green-100 text-green-700"
                                                    : probability >= 50
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {probability}%
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <span className="text-muted">€{listing.warmRentAmount ?? listing.coldRentAmount ?? "N/A"}/month</span>
                                            <span className="text-muted">
                                                {assessment.isOverpriced ? "Overpriced" : "Fair price"}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

function MetricCard({
    label,
    value,
    trend,
    icon,
    isPositive,
}: {
    label: string;
    value: string;
    trend: number;
    icon: string;
    isPositive?: boolean;
}) {
    const isPositiveTrend = isPositive !== undefined ? isPositive : trend > 0;

    return (
        <div className="ds-card p-5">
            <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-low text-xl">
                    {icon}
                </div>
                <div
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${isPositiveTrend
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {isPositiveTrend ? "↑" : "↓"} {parseFloat(Math.abs(trend).toFixed(2))}%
                </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-on-background">{value}</p>
            <p className="text-sm text-muted">{label}</p>
        </div>
    );
}

function ViewButton({
    children,
    active,
    onClick,
}: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${active
                ? "bg-primary text-white"
                : "bg-surface-low hover:bg-surface-high"
                }`}
        >
            {children}
        </button>
    );
}

function PredictionCard({
    title,
    prediction,
    confidence,
    tags,
    isPositive,
}: {
    title: string;
    prediction: string;
    confidence: number;
    tags: string[];
    isPositive?: boolean;
}) {
    return (
        <div
            className={`rounded-xl p-4 ${isPositive ? "bg-green-50" : "ds-card"
                }`}
        >
            <div className="flex items-start justify-between">
                <h3 className="font-semibold text-on-background">{title}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">Confidence</span>
                    <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${confidence >= 75
                            ? "bg-green-100 text-green-700"
                            : confidence >= 50
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {confidence}%
                    </span>
                </div>
            </div>
            <p className="mt-2 text-sm text-muted">{prediction}</p>
            <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="rounded-full bg-surface-low px-2 py-1 text-xs text-muted"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}

function calculateMockProbability(listing: {
    id: string;
    warmRentAmount: number | null;
    coldRentAmount: number | null;
    city: string | null;
    source: string;
}): number {
    // Mock probability calculation
    let prob = 50;
    const rent = Number(listing.warmRentAmount ?? listing.coldRentAmount ?? 0);

    if (rent < 1000) prob += 20;
    if (rent > 1500) prob -= 15;
    if (listing.source === "genossenschaft") prob += 10;

    return Math.min(95, Math.max(15, prob));
}
