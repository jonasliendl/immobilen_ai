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
        loading: () => <div className="h-[420px] animate-pulse rounded-2xl bg-black/5" />,
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

const districtStats = Object.entries(districtRentBenchmarkPerM2).map(([district, pricePerM2]) => ({
    district,
    pricePerM2,
    avgRent: pricePerM2 * 55, // avg 55m2
    listings: berlinListings.filter((l) => l.district === district).length,
    trend: (Math.random() * 10 - 3).toFixed(1),
}));

export default function IntelligencePage() {
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");
    const [viewMode, setViewMode] = useState<ViewMode>("overview");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [mapOverlay, setMapOverlay] = useState<NeighborhoodMapResponse | null>(null);
    const [mapLoading, setMapLoading] = useState(true);

    const trends = mockTrends[timeRange];

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
            {/* Header */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">🧠 Market Intelligence</h1>
                        <p className="mt-1 text-sm text-black/70">
                            AI-powered insights to help you find and secure your home faster
                        </p>
                    </div>
                    <div className="flex gap-2">
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
                </div>
            </section>

            {/* Time Range Selector */}
            <section className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="flex gap-2">
                    {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${timeRange === range
                                    ? "bg-black text-white"
                                    : "border border-black/20 bg-white hover:bg-black/5"
                                }`}
                        >
                            {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : range === "90d" ? "Last 90 days" : "Last year"}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-black/60">
                    Data updated: <span className="font-medium">2 hours ago</span>
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
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Market Insights</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {marketInsights.map((insight, index) => (
                        <div
                            key={index}
                            className={`rounded-xl border p-4 ${insight.severity === "warning"
                                    ? "border-yellow-200 bg-yellow-50"
                                    : insight.severity === "success"
                                        ? "border-green-200 bg-green-50"
                                        : "border-blue-200 bg-blue-50"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{insight.icon}</span>
                                <div>
                                    <p className="font-semibold">{insight.title}</p>
                                    <p className="mt-1 text-sm text-black/70">{insight.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold">Berlin Noise & Commute Overlay</h2>
                        <p className="mt-1 text-sm text-black/60">
                            OpenStreetMap tiles with LOR-compatible overlay data. When no official GeoJSON URL is configured,
                            the app falls back to lightweight district geometries so the experience stays available.
                        </p>
                    </div>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/70">
                        Source: {mapOverlay?.source ?? "loading"}
                    </span>
                </div>

                {mapLoading && <div className="h-[420px] animate-pulse rounded-2xl bg-black/5" />}
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
                    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Price Trends</h2>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="rounded-xl border border-black/20 px-3 py-2 text-sm"
                            >
                                <option value="">All Berlin</option>
                                {Object.keys(districtRentBenchmarkPerM2).map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex h-64 items-end justify-between gap-2 rounded-xl bg-black/5 p-4">
                            {[65, 72, 68, 75, 82, 78, 85, 88, 84, 90, 92, 95].map((height, i) => (
                                <div
                                    key={i}
                                    className="flex-1 rounded-t-lg bg-gradient-to-t from-black to-black/60 transition hover:from-black/80 hover:to-black"
                                    style={{ height: `${height}%` }}
                                    title={`Month ${i + 1}: €${1000 + height * 3}`}
                                />
                            ))}
                        </div>
                        <div className="mt-3 flex justify-between text-xs text-black/50">
                            <span>Jan</span>
                            <span>Mar</span>
                            <span>Jun</span>
                            <span>Sep</span>
                            <span>Dec</span>
                        </div>
                    </section>

                    {/* District Comparison */}
                    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold">District Comparison</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-black/10 text-left">
                                        <th className="pb-3 font-semibold">District</th>
                                        <th className="pb-3 font-semibold">Avg Rent/m²</th>
                                        <th className="pb-3 font-semibold">Avg Total Rent</th>
                                        <th className="pb-3 font-semibold">Listings</th>
                                        <th className="pb-3 font-semibold">Trend</th>
                                        <th className="pb-3 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {districtStats.map((stat) => (
                                        <tr key={stat.district} className="border-b border-black/5">
                                            <td className="py-3 font-medium">{stat.district}</td>
                                            <td className="py-3">€{stat.pricePerM2}/m²</td>
                                            <td className="py-3">€{stat.avgRent}</td>
                                            <td className="py-3">{stat.listings}</td>
                                            <td className={`py-3 ${Number(stat.trend) > 0 ? "text-red-600" : "text-green-600"}`}>
                                                {Number(stat.trend) > 0 ? "↑" : "↓"} {Math.abs(Number(stat.trend))}%
                                            </td>
                                            <td className="py-3">
                                                <Link
                                                    href={`/search?district=${encodeURIComponent(stat.district)}`}
                                                    className="text-black underline hover:text-black/70"
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
                            className="rounded-xl border border-black/10 bg-white p-5 shadow-sm transition hover:border-black"
                        >
                            <div className="flex items-start justify-between">
                                <h3 className="font-semibold">{stat.district}</h3>
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
                                    <span className="text-black/60">Price/m²</span>
                                    <span className="font-medium">€{stat.pricePerM2}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-black/60">Avg Rent</span>
                                    <span className="font-medium">€{stat.avgRent}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-black/60">Active Listings</span>
                                    <span className="font-medium">{stat.listings}</span>
                                </div>
                            </div>
                            <Link
                                href={`/search?district=${encodeURIComponent(stat.district)}`}
                                className="mt-4 block w-full rounded-lg bg-black/5 py-2 text-center text-sm font-medium transition hover:bg-black/10"
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
                    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold">🔮 AI Predictions</h2>
                        <div className="space-y-4">
                            <PredictionCard
                                title="Best Districts Next Month"
                                prediction="Based on current trends, Friedrichshain and Wedding show increasing supply with stable prices."
                                confidence={78}
                                tags={["Friedrichshain", "Wedding"]}
                            />
                            <PredictionCard
                                title="Price Forecast"
                                prediction="Average rents expected to rise 2-3% in Q2 2026 due to seasonal demand increase."
                                confidence={65}
                                tags={["Berlin-wide", "Q2 2026"]}
                            />
                            <PredictionCard
                                title="Genossenschaft Opportunities"
                                prediction="3 co-ops expected to open applications in April. Your profile matches 2 of them."
                                confidence={82}
                                tags={["Genossenschaft", "High Match"]}
                                isPositive
                            />
                        </div>
                    </section>

                    {/* Success Probability Calculator */}
                    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold">📊 Success Probability Calculator</h2>
                        <p className="mb-4 text-sm text-black/60">
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
                                        className="rounded-xl border border-black/10 bg-white p-4 transition hover:border-black hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold">{listing.title}</p>
                                                <p className="text-sm text-black/60">{listing.district}</p>
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
                                            <span className="text-black/60">€{listing.monthlyRentEur}/month</span>
                                            <span className="text-black/60">
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
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/10 text-xl">
                    {icon}
                </div>
                <div
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${isPositiveTrend
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                >
                    {isPositiveTrend ? "↑" : "↓"} {Math.abs(trend)}%
                </div>
            </div>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="text-sm text-black/60">{label}</p>
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
                    ? "bg-black text-white"
                    : "border border-black/20 bg-white hover:bg-black/5"
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
            className={`rounded-xl border p-4 ${isPositive ? "border-green-200 bg-green-50" : "border-black/10 bg-white"
                }`}
        >
            <div className="flex items-start justify-between">
                <h3 className="font-semibold">{title}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-black/50">Confidence</span>
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
            <p className="mt-2 text-sm text-black/70">{prediction}</p>
            <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="rounded-full bg-black/10 px-2 py-1 text-xs text-black/70"
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
    monthlyRentEur: number;
    district: string;
    source: string;
}): number {
    // Mock probability calculation
    let prob = 50;

    if (listing.monthlyRentEur < 1000) prob += 20;
    if (listing.monthlyRentEur > 1500) prob -= 15;
    if (listing.source === "genossenschaft") prob += 10;
    if (listing.district === "Lichtenberg" || listing.district === "Pankow") prob += 10;
    if (listing.district === "Prenzlauer Berg") prob -= 10;

    return Math.min(95, Math.max(15, prob));
}
