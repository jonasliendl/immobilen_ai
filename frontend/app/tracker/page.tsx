"use client";

import { useState } from "react";
import Link from "next/link";
import { FeaturePageIntro } from "@/components/feature-page-intro";

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
            <FeaturePageIntro
                eyebrow="Application Tracker"
                title="Every application, one secure timeline"
                description="Upload SCHUFA, payslips, and landlord documents once. The tracker keeps statuses, landlord replies, and viewing dates in one place. An LLM can help polish cover letters and summaries from the same profile data — without scattering PDFs across email."
                howItWorks={[
                    "Demo data below shows how boards and cards will look once your applications sync in.",
                    "Each row tracks submitted → viewed → shortlisted → viewing → offer, with notes and landlord messages.",
                    "Link back to Search to add more flats; use Chat to rehearse questions before a viewing.",
                    "Future releases will attach your encrypted document vault directly to each application packet.",
                ]}
            />
            <section className="flex flex-col justify-between gap-4 rounded-2xl bg-surface-container-low px-6 py-4 shadow-sm sm:flex-row sm:items-center">
                <h2 className="font-sans text-lg font-bold text-on-background">Your pipeline</h2>
                <Link
                    href="/search"
                    className="rounded-xl bg-primary px-4 py-2 text-center font-medium text-on-primary transition hover:bg-primary/90"
                >
                    + New Application
                </Link>
            </section>

            {/* Stats Cards */}
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard label="Total Applications" value={stats.total} icon="📊" />
                <StatCard label="Active" value={stats.active} icon="🔄" color="blue" />
                <StatCard label="Viewings" value={stats.viewings} icon="📅" color="yellow" />
                <StatCard label="Shortlisted" value={stats.shortlisted} icon="⭐" color="purple" />
            </section>

            {/* Pipeline View */}
            <section className="ds-card p-6">
                <h2 className="text-title mb-4 text-on-background">Application Pipeline</h2>
                <div className="overflow-x-auto">
                    <div className="flex min-w-max gap-4">
                        {Object.entries(statusConfig).map(([status, config]) => {
                            const appsInStatus = applications.filter((a) => a.status === status);
                            if (appsInStatus.length === 0) return null;
                            return (
                                <div
                                    key={status}
                                    className="w-48 shrink-0 rounded-xl bg-surface-low p-3"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-on-background">{config.label}</span>
                                        <span className="rounded-full bg-surface-high px-2 py-0.5 text-xs text-muted">
                                            {appsInStatus.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {appsInStatus.map((app) => (
                                            <button
                                                key={app.id}
                                                onClick={() => setSelectedApp(app)}
                                                className="ds-card w-full p-2 text-left text-sm"
                                            >
                                                <p className="font-medium text-on-background line-clamp-1">{app.title}</p>
                                                <p className="text-xs text-muted">{app.district}</p>
                                                <p className="text-xs font-medium text-primary">€{app.rent}</p>
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
            <section className="ds-card p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-title text-on-background">All Applications</h2>
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
                            className="ds-card flex cursor-pointer items-center justify-between p-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-low text-2xl">
                                    🏠
                                </div>
                                <div>
                                    <h3 className="font-semibold text-on-background">{app.title}</h3>
                                    <p className="text-sm text-muted">
                                        {app.district} · {app.rooms} rooms · {app.size}m²
                                    </p>
                                    <p className="text-xs text-muted">
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
                                <span className="text-lg font-bold text-on-background">€{app.rent}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Timeline Activity */}
            <section className="ds-section">
                <h2 className="text-title mb-4 text-on-background">Recent Activity</h2>
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4"
                    onClick={() => setSelectedApp(null)}
                >
                    <div
                        className="ds-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-on-background">{selectedApp.title}</h2>
                                <p className="text-sm text-muted">{selectedApp.address}</p>
                            </div>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="rounded-lg p-2 hover:bg-surface-low"
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
                            <h3 className="font-semibold text-on-background">Notes</h3>
                            <p className="mt-2 text-sm text-muted">{selectedApp.notes}</p>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Link
                                href={`/listings/${selectedApp.listingId}`}
                                className="btn-secondary flex-1 inline-flex items-center justify-center"
                            >
                                View Listing
                            </Link>
                            <Link
                                href={`/apply/${selectedApp.listingId}?step=review`}
                                className="btn-primary flex-1 inline-flex items-center justify-center"
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
        <div className="ds-card p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-on-background">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${color === "blue" ? "bg-secondary-fixed" :
                        color === "yellow" ? "bg-yellow-100" :
                            color === "purple" ? "bg-purple-100" :
                                "bg-surface-low"
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
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${active
                    ? "bg-primary text-white"
                    : "bg-surface-card ghost-border hover:bg-surface-low"
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-low">
                {icon}
            </div>
            <div className="flex-1">
                <p className="font-medium text-on-background">{title}</p>
                <p className="text-sm text-muted">{description}</p>
                <p className="text-xs text-muted">{time}</p>
            </div>
        </div>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-surface-low p-3 text-center">
            <p className="text-label text-muted">{label}</p>
            <p className="mt-1 text-lg font-bold text-on-background">{value}</p>
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
