"use client";

import Link from "next/link";

export default function Home() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-12 md:px-8">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-black to-black/80 p-8 text-white md:p-12">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold md:text-5xl">
                        Find Your Home in Berlin
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-white/80">
                        AI-powered apartment search, application tracking, and Genossenschaft matching.
                        Get your dream home faster with intelligent recommendations.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link
                            href="/search"
                            className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
                        >
                            Start Searching →
                        </Link>
                        <Link
                            href="/chat"
                            className="rounded-xl border border-white/30 px-6 py-3 font-semibold transition hover:bg-white/10"
                        >
                            Ask AI Assistant
                        </Link>
                    </div>
                </div>
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            </section>

            {/* Quick Stats */}
            <section className="grid gap-4 md:grid-cols-4">
                <StatCard value="2,500+" label="Active Listings" subtext="Across Berlin" />
                <StatCard value="85%" label="Application Success" subtext="With our tools" />
                <StatCard value="50+" label="Genossenschaften" subtext="Partner network" />
                <StatCard value="24/7" label="AI Support" subtext="Always available" />
            </section>

            {/* Main Features Grid */}
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FeatureCard
                    icon="🔍"
                    title="Smart Search"
                    description="Filter by district, price, size, and vibe. AI ranks listings by your success probability."
                    href="/search"
                    cta="Browse Listings"
                />
                <FeatureCard
                    icon="📊"
                    title="Application Tracker"
                    description="Track all your applications in one place. Never miss a viewing or response."
                    href="/tracker"
                    cta="View Dashboard"
                />
                <FeatureCard
                    icon="🧠"
                    title="Market Intelligence"
                    description="AI-powered price analysis, district trends, and success predictions."
                    href="/intelligence"
                    cta="Explore Insights"
                />
                <FeatureCard
                    icon="✉️"
                    title="AI Cover Letters"
                    description="Generate personalized cover letters in seconds. Stand out from the crowd."
                    href="/chat"
                    cta="Try AI Writer"
                />
                <FeatureCard
                    icon="🤝"
                    title="Genossenschaft Match"
                    description="Find housing cooperatives you're eligible for. Affordable, long-term homes."
                    href="/search?source=genossenschaft"
                    cta="Find Co-ops"
                />
                <FeatureCard
                    icon="💬"
                    title="24/7 Chat Assistant"
                    description="Get instant answers about documents, applications, and Berlin rental market."
                    href="/chat"
                    cta="Start Chatting"
                />
            </section>

            {/* How It Works */}
            <section className="rounded-2xl border border-black/10 bg-white p-8">
                <h2 className="text-center text-2xl font-bold">How It Works</h2>
                <div className="mt-8 grid gap-6 md:grid-cols-4">
                    <StepCard
                        step="1"
                        title="Search"
                        description="Browse AI-curated listings matching your preferences"
                    />
                    <StepCard
                        step="2"
                        title="Analyze"
                        description="Get success probability and price insights for each listing"
                    />
                    <StepCard
                        step="3"
                        title="Apply"
                        description="Submit complete applications with AI-generated cover letters"
                    />
                    <StepCard
                        step="4"
                        title="Track"
                        description="Monitor all applications and viewings in one dashboard"
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="rounded-2xl border border-black/10 bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center">
                <h2 className="text-xl font-bold">Ready to find your home?</h2>
                <p className="mt-2 text-black/60">
                    Join thousands of tenants who found their perfect home in Berlin
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <Link
                        href="/search"
                        className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-black/80"
                    >
                        Start Free Search
                    </Link>
                    <Link
                        href="/intelligence"
                        className="rounded-xl border border-black/20 px-6 py-3 font-semibold transition hover:bg-black/5"
                    >
                        Explore Market Data
                    </Link>
                </div>
            </section>
        </main>
    );
}

function StatCard({ value, label, subtext }: { value: string; label: string; subtext: string }) {
    return (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-bold">{value}</p>
            <p className="mt-1 font-medium">{label}</p>
            <p className="text-sm text-black/50">{subtext}</p>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
    href,
    cta,
}: {
    icon: string;
    title: string;
    description: string;
    href: string;
    cta: string;
}) {
    return (
        <div className="group rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:border-black hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/10 text-2xl">
                {icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-black/60">{description}</p>
            <Link
                href={href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-black underline transition hover:text-black/70"
            >
                {cta} →
            </Link>
        </div>
    );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
    return (
        <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-2xl font-bold text-white">
                {step}
            </div>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-black/60">{description}</p>
        </div>
    );
}
