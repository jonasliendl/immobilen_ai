"use client";

import { useState } from "react";
import Link from "next/link";

type ApplicationStatus = "draft" | "submitted" | "viewed" | "shortlisted" | "rejected" | "viewing" | "offered" | "signed";

type Application = {
    id: string;
    listingId: string;
    title: string;
    district: string;
    address: string;
    rent: number;
    size: number;
    rooms: number;
    status: ApplicationStatus;
    appliedDate: string;
    lastUpdate: string;
    viewingDate?: string;
    notes: string;
    landlordName: string;
    landlordResponse?: string;
};

const demoApplications: Application[] = [
    {
        id: "app-001",
        listingId: "l-1001",
        title: "Bright 2-room in Prenzlauer Berg",
        district: "Prenzlauer Berg",
        address: "Knaackstrasse 17, 10405 Berlin",
        rent: 1280,
        size: 54,
        rooms: 2,
        status: "viewing",
        appliedDate: "2026-03-20",
        lastUpdate: "2026-03-25",
        viewingDate: "2026-03-28T14:00:00",
        notes: "Landlord seemed interested. Bring all documents to viewing.",
        landlordName: "UrbanHaus GmbH",
        landlordResponse: "Thank you for your application. We'd like to invite you for a viewing.",
    },
    {
        id: "app-002",
        listingId: "l-1002",
        title: "Family flat near Tempelhofer Feld",
        district: "Neukoelln",
        address: "Oderstrasse 6, 12051 Berlin",
        rent: 1650,
        size: 79,
        rooms: 3,
        status: "submitted",
        appliedDate: "2026-03-24",
        lastUpdate: "2026-03-24",
        notes: "Waiting for response",
        landlordName: "Brix Property",
    },
    {
        id: "app-003",
        listingId: "l-2001",
        title: "Genossenschaft apartment in Lichtenberg",
        district: "Lichtenberg",
        address: "Siegfriedstrasse 112, 10365 Berlin",
        rent: 980,
        size: 58,
        rooms: 2,
        status: "shortlisted",
        appliedDate: "2026-03-18",
        lastUpdate: "2026-03-23",
        notes: "Genossenschaft requires membership application first",
        landlordName: "Berliner Heim eG",
        landlordResponse: "Your profile matches our criteria. Please complete membership application.",
    },
    {
        id: "app-004",
        listingId: "l-1003",
        title: "Compact studio in Moabit",
        district: "Moabit",
        address: "Turmstrasse 85, 10551 Berlin",
        rent: 890,
        size: 31,
        rooms: 1,
        status: "rejected",
        appliedDate: "2026-03-15",
        lastUpdate: "2026-03-22",
        notes: "Rent was too high for income ratio",
        landlordName: "R. Fischer",
        landlordResponse: "Unfortunately, we've decided to move forward with another candidate.",
    },
];

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: string }> = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: "📝" },
    submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700", icon: "📤" },
    viewed: { label: "Viewed", color: "bg-cyan-100 text-cyan-700", icon: "👁️" },
    shortlisted: { label: "Shortlisted", color: "bg-purple-100 text-purple-700", icon: "⭐" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: "❌" },
    viewing: { label: "Viewing Scheduled", color: "bg-yellow-100 text-yellow-700", icon: "📅" },
    offered: { label: "Offered", color: "bg-green-100 text-green-700", icon: "🎉" },
    signed: { label: "Signed", color: "bg-emerald-100 text-emerald-700", icon: "✍️" },
};

export default function TrackerPage() {
    const [applications] = useState<Application[]>(demoApplications);
    const [filter, setFilter] = useState<"all" | "active" | "archived">("active");
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    const filteredApps = applications.filter((app) => {
        if (filter === "active") return !["rejected", "signed"].includes(app.status);
        if (filter === "archived") return ["rejected", "signed"].includes(app.status);
        return true;
    });

    const stats = {
        total: applications.length,
        active: applications.filter((a) => !["rejected", "signed"].includes(a.status)).length,
        viewings: applications.filter((a) => a.status === "viewing").length,
        shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    };

    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<ApplicationStatus, number>);

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            {/* Header */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Application Tracker</h1>
                        <p className="mt-1 text-sm text-black/70">
                            Track all your rental applications in one place
                        </p>
                    </div>
                    <Link
                        href="/search"
                        className="rounded-xl bg-black px-4 py-2 font-medium text-white transition hover:bg-black/80"
                    >
                        + New Application
                    </Link>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard label="Total Applications" value={stats.total} icon="📊" />
                <StatCard label="Active" value={stats.active} icon="🔄" color="blue" />
                <StatCard label="Viewings" value={stats.viewings} icon="📅" color="yellow" />
                <StatCard label="Shortlisted" value={stats.shortlisted} icon="⭐" color="purple" />
            </section>

            {/* Pipeline View */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Application Pipeline</h2>
                <div className="overflow-x-auto">
                    <div className="flex min-w-max gap-4">
                        {Object.entries(statusConfig).map(([status, config]) => {
                            const appsInStatus = applications.filter((a) => a.status === status);
                            if (appsInStatus.length === 0) return null;
                            return (
                                <div
                                    key={status}
                                    className="w-48 shrink-0 rounded-xl bg-black/5 p-3"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-semibold">{config.label}</span>
                                        <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                                            {appsInStatus.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {appsInStatus.map((app) => (
                                            <button
                                                key={app.id}
                                                onClick={() => setSelectedApp(app)}
                                                className="w-full rounded-lg border border-black/10 bg-white p-2 text-left text-sm transition hover:border-black hover:shadow-sm"
                                            >
                                                <p className="font-medium line-clamp-1">{app.title}</p>
                                                <p className="text-xs text-black/60">{app.district}</p>
                                                <p className="text-xs font-medium">€{app.rent}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Applications List */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">All Applications</h2>
                    <div className="flex gap-2">
                        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
                            All
                        </FilterButton>
                        <FilterButton active={filter === "active"} onClick={() => setFilter("active")}>
                            Active
                        </FilterButton>
                        <FilterButton active={filter === "archived"} onClick={() => setFilter("archived")}>
                            Archived
                        </FilterButton>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredApps.map((app) => (
                        <div
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className="flex cursor-pointer items-center justify-between rounded-xl border border-black/10 bg-white p-4 transition hover:border-black hover:shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/10 text-2xl">
                                    🏠
                                </div>
                                <div>
                                    <h3 className="font-semibold">{app.title}</h3>
                                    <p className="text-sm text-black/60">
                                        {app.district} · {app.rooms} rooms · {app.size}m²
                                    </p>
                                    <p className="text-xs text-black/50">
                                        Applied {formatDate(app.appliedDate)} · {app.landlordName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${statusConfig[app.status].color}`}
                                >
                                    <span>{statusConfig[app.status].icon}</span>
                                    <span className="hidden md:inline">{statusConfig[app.status].label}</span>
                                </span>
                                <span className="text-lg font-bold">€{app.rent}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Timeline Activity */}
            <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
                <div className="space-y-4">
                    <TimelineItem
                        icon="📅"
                        title="Viewing scheduled"
                        description="Bright 2-room in Prenzlauer Berg - March 28, 2:00 PM"
                        time="2 hours ago"
                    />
                    <TimelineItem
                        icon="⭐"
                        title="Shortlisted"
                        description="Genossenschaft apartment in Lichtenberg - Berliner Heim eG"
                        time="4 days ago"
                    />
                    <TimelineItem
                        icon="📤"
                        title="Application submitted"
                        description="Family flat near Tempelhofer Feld"
                        time="3 days ago"
                    />
                    <TimelineItem
                        icon="❌"
                        title="Application declined"
                        description="Compact studio in Moabit"
                        time="5 days ago"
                    />
                </div>
            </section>

            {/* Detail Modal */}
            {selectedApp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setSelectedApp(null)}
                >
                    <div
                        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold">{selectedApp.title}</h2>
                                <p className="text-sm text-black/60">{selectedApp.address}</p>
                            </div>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="rounded-lg p-2 hover:bg-black/5"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <InfoCard label="Rent" value={`€${selectedApp.rent}/month`} />
                            <InfoCard label="Size" value={`${selectedApp.size}m²`} />
                            <InfoCard label="Rooms" value={selectedApp.rooms.toString()} />
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">Status</h3>
                            <span
                                className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig[selectedApp.status].color}`}
                            >
                                <span>{statusConfig[selectedApp.status].icon}</span>
                                {statusConfig[selectedApp.status].label}
                            </span>
                        </div>

                        {selectedApp.landlordResponse && (
                            <div className="mt-4 rounded-xl bg-blue-50 p-4">
                                <p className="text-sm font-medium text-blue-800">Message from landlord:</p>
                                <p className="mt-2 text-sm text-blue-700">{selectedApp.landlordResponse}</p>
                            </div>
                        )}

                        {selectedApp.viewingDate && (
                            <div className="mt-4 rounded-xl bg-yellow-50 p-4">
                                <p className="text-sm font-medium text-yellow-800">📅 Viewing Scheduled</p>
                                <p className="mt-1 text-sm text-yellow-700">
                                    {new Date(selectedApp.viewingDate).toLocaleString("en-GB", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                                <button className="mt-3 rounded-lg bg-yellow-200 px-3 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-300">
                                    Add to Calendar
                                </button>
                            </div>
                        )}

                        <div className="mt-4">
                            <h3 className="font-semibold">Notes</h3>
                            <p className="mt-2 text-sm text-black/70">{selectedApp.notes}</p>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Link
                                href={`/listings/${selectedApp.listingId}`}
                                className="flex-1 rounded-xl border border-black/20 px-4 py-2 text-center font-medium transition hover:bg-black/5"
                            >
                                View Listing
                            </Link>
                            <Link
                                href={`/apply/${selectedApp.listingId}?step=review`}
                                className="flex-1 rounded-xl bg-black px-4 py-2 text-center font-medium text-white"
                            >
                                Edit Application
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function StatCard({
    label,
    value,
    icon,
    color = "black",
}: {
    label: string;
    value: number;
    icon: string;
    color?: string;
}) {
    return (
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-black/60">{label}</p>
                    <p className="mt-1 text-3xl font-bold">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                    color === "blue" ? "bg-blue-100" :
                    color === "yellow" ? "bg-yellow-100" :
                    color === "purple" ? "bg-purple-100" :
                    "bg-black/10"
                }`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function FilterButton({
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
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                    ? "bg-black text-white"
                    : "border border-black/20 bg-white hover:bg-black/5"
            }`}
        >
            {children}
        </button>
    );
}

function TimelineItem({
    icon,
    title,
    description,
    time,
}: {
    icon: string;
    title: string;
    description: string;
    time: string;
}) {
    return (
        <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/10">
                {icon}
            </div>
            <div className="flex-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-black/60">{description}</p>
                <p className="text-xs text-black/40">{time}</p>
            </div>
        </div>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-black/10 bg-black/5 p-3 text-center">
            <p className="text-xs text-black/60">{label}</p>
            <p className="mt-1 text-lg font-bold">{value}</p>
        </div>
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
