import { ScrollReveal } from "@/components/scroll-reveal";
import { WaitlistForm } from "@/components/waitlist-form";
import { ListingFeedAnimation } from "@/components/listing-feed-animation";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const whatWeDo = [
    {
        icon: "travel_explore",
        problem: "Listings scattered across 15+ portals",
        solution: "AI scraper aggregates all Berlin portals into 1 unified real-time feed",
    },
    {
        icon: "schedule",
        problem: "Students waste 10–20 hrs/week searching",
        solution: "Personalised questionnaire matches listings instantly",
    },
    {
        icon: "translate",
        problem: "Non-German speakers face language barriers",
        solution: "English-first, multilingual UX built for expats",
    },
    {
        icon: "description",
        problem: "Complex paperwork: SCHUFA, cover letters",
        solution: "Upload once — AI auto-applies everywhere",
    },
    {
        icon: "groups",
        problem: "~250 applicants compete per listing",
        solution: "1-click AI auto-apply gives you a head start",
    },
    {
        icon: "gavel",
        problem: "Mietpreisbremse violations go undetected",
        solution: "Automated rent-cap compliance checker on every listing",
    },
    {
        icon: "security",
        problem: "Scam listings waste your time and money",
        solution: "ML fraud detection flags suspicious listings instantly",
    },
];

const howItWorks = [
    {
        step: "01",
        title: "Sign Up Free",
        desc: "No credit card. No commitment. Start in 30 seconds.",
        tier: null,
    },
    {
        step: "02",
        title: "Complete Your Profile",
        desc: "Budget, lifestyle, commute, pet policy, noise level — tell us what home means to you.",
        tier: null,
    },
    {
        step: "03",
        title: "Get Your Personalised Feed",
        desc: "All Berlin apartments in one AI-ranked feed, updated in real time.",
        tier: null,
    },
    {
        step: "04",
        title: "Upgrade for Alerts",
        desc: "Daily or weekly email digests of the cheapest new listings matching your profile.",
        tier: "Premium",
    },
    {
        step: "05",
        title: "Let AI Apply for You",
        desc: "Upload SCHUFA, income proof, and ID once. AI generates a cover letter and auto-applies.",
        tier: "Premium",
    },
    {
        step: "06",
        title: "Track Everything",
        desc: "Full application timeline, reminders, and rejection analysis in one dashboard.",
        tier: "Premium",
    },
];

const solutionFeatures = [
    { icon: "search", title: "Multi-source aggregation", text: "All 15+ Berlin portals in one unified feed." },
    { icon: "auto_awesome", title: "AI cover letter", text: "Listing-specific, personalised, generated instantly." },
    { icon: "bolt", title: "1-click AI auto-apply", text: "Upload documents once, apply everywhere." },
    { icon: "notifications", title: "Daily email alerts", text: "Cheapest new listings delivered to your inbox." },
    { icon: "gavel", title: "Mietpreisbremse checker", text: "Automated rent-cap compliance on every listing." },
    { icon: "security", title: "ML fraud detection", text: "Every listing scanned before it reaches you." },
    { icon: "person_check", title: "Tenant profile score", text: "Explainability + rejection analysis built in." },
    { icon: "language", title: "English-first, multilingual", text: "Built for expats and international students." },
];

type CompetitorValue = boolean | "partial";

const comparisonRows: {
    feature: string;
    budenfinder: CompetitorValue;
    is24: CompetitorValue;
    wgGesucht: CompetitorValue;
    kleinanzeigen: CompetitorValue;
    immowelt: CompetitorValue;
}[] = [
    { feature: "Multi-portal aggregation (15+)", budenfinder: true, is24: false, wgGesucht: false, kleinanzeigen: false, immowelt: false },
    { feature: "AI personalised matching",        budenfinder: true, is24: false, wgGesucht: false, kleinanzeigen: false, immowelt: false },
    { feature: "1-click AI auto-apply",           budenfinder: true, is24: false, wgGesucht: false, kleinanzeigen: false, immowelt: false },
    { feature: "AI cover letter generation",      budenfinder: true, is24: false, wgGesucht: false, kleinanzeigen: false, immowelt: false },
    { feature: "Mietpreisbremse compliance",      budenfinder: true, is24: "partial", wgGesucht: false, kleinanzeigen: false, immowelt: "partial" },
    { feature: "ML fraud detection",              budenfinder: true, is24: false, wgGesucht: "partial", kleinanzeigen: "partial", immowelt: false },
    { feature: "English-first / multilingual UX", budenfinder: true, is24: "partial", wgGesucht: true, kleinanzeigen: false, immowelt: false },
    { feature: "Application tracker & analytics", budenfinder: true, is24: false, wgGesucht: false, kleinanzeigen: false, immowelt: false },
];

const pricingTiers = [
    {
        name: "Free",
        price: "€0",
        sub: "per month, forever",
        tagline: "Start searching with no strings attached.",
        features: [
            "Full search access",
            "Personalised listing feed",
            "ML fraud detection",
            "Neighbourhood map",
        ],
        cta: "Get Started Free",
        highlighted: false,
        billingOptions: null as null | { price: string; note: string }[],
    },
    {
        name: "Premium",
        price: "€10",
        sub: "per month · 6-month plan",
        tagline: "Every tool to find and win your flat.",
        features: [
            "Everything in Free",
            "Daily / weekly email alerts",
            "Mietpreisbremse alerts",
            "Advanced filters",
            "AI auto-apply",
            "AI cover letter",
            "Application tracker",
            "Rejection analysis",
            "Tenant profile score",
        ],
        cta: "Get Premium",
        highlighted: true,
        billingOptions: [
            { price: "€9.99 / mo", note: "6-month commitment" },
            { price: "€14.99 / mo", note: "Month-to-month" },
        ] as { price: string; note: string }[],
    },
];

const personas = [
    {
        type: "Expat Student",
        name: "Sofia A.",
        detail: "Master's student · Arrived from Spain",
        meta: "Ages 18–28 · International student",
        quote:
            "I arrived in Berlin for uni and needed a flat within two weeks. Budenfinder found me three options before I'd even unpacked.",
        avatar: { initials: "SA", bgClass: "bg-blue-50", textClass: "text-blue-600", ringClass: "ring-blue-100" },
        stars: 5,
    },
    {
        type: "Working Professional",
        name: "Marcus K.",
        detail: "Software engineer · Relocated from London",
        meta: "Ages 25–45 · Relocating for a job offer",
        quote:
            "I had a start date but no flat. The AI applied to 40 listings overnight while I slept. I signed a lease in 9 days.",
        avatar: { initials: "MK", bgClass: "bg-emerald-50", textClass: "text-emerald-600", ringClass: "ring-emerald-100" },
        stars: 5,
    },
    {
        type: "International Expat",
        name: "Yuki T.",
        detail: "Product designer · Moved from Tokyo",
        meta: "Non-German speaker · New to Berlin",
        quote:
            "Everything was in English. The AI cover letter was in perfect German. My landlord was impressed — I wasn't even asked for a translation.",
        avatar: { initials: "YT", bgClass: "bg-violet-50", textClass: "text-violet-600", ringClass: "ring-violet-100" },
        stars: 5,
    },
];

// ---------------------------------------------------------------------------
// Landing nav
// ---------------------------------------------------------------------------

function LandingNav() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 md:px-10">
                <span className="text-lg font-bold tracking-tighter text-black">Budenfinder</span>

                <nav className="hidden items-center gap-8 md:flex">
                    {[
                        { href: "#what-we-do", label: "What We Do" },
                        { href: "#how-it-works", label: "How It Works" },
                        { href: "#pricing", label: "Pricing" },
                        { href: "#waitlist", label: "Waitlist" },
                    ].map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="relative text-sm font-medium text-gray-500 transition-colors hover:text-black after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-black after:transition-all after:duration-200 hover:after:w-full"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <a
                    href="#waitlist"
                    className="rounded-md bg-black px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
                >
                    Join Waitlist
                </a>
            </div>
        </header>
    );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function CompetitorCell({ value }: { value: CompetitorValue }) {
    if (value === true) return <span className="text-sm font-bold text-white">✓</span>;
    if (value === "partial") return <span className="text-xs text-gray-500">Partial</span>;
    return <span className="text-sm text-gray-600">—</span>;
}

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: count }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs">★</span>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page — scroll-snap container
// ---------------------------------------------------------------------------

export default function HomePage() {
    return (
        <>
            <LandingNav />

            {/* Scroll-snap container: starts below fixed nav, fills remaining viewport */}
            <main
                className="mt-16 overflow-y-auto scroll-smooth md:h-[calc(100vh-4rem)] md:overflow-y-scroll md:snap-y md:snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
            >
                {/* ── Hero ─────────────────────────────────────────────── */}
                <section className="min-h-screen snap-start flex items-center bg-white px-6 py-20 md:py-0 md:h-full md:px-10 lg:px-16">
                    <div className="mx-auto w-full max-w-6xl grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                        {/* Left: headline + CTAs */}
                        <ScrollReveal>
                            <h1 className="text-5xl font-black leading-none tracking-tight text-black md:text-6xl lg:text-7xl">
                                Every Rental
                                <br />
                                in Berlin.
                                <br />
                                <span className="text-gray-400">1 Intelligence</span>
                                <br />
                                <span className="text-gray-400">Feed.</span>
                            </h1>

                            <p className="mt-8 max-w-sm text-base leading-relaxed text-gray-500 md:text-lg">
                                AI matching your budget, lifestyle, and legal rights — finding your
                                home faster, safer, and smarter.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-4">
                                <a
                                    href="#waitlist"
                                    className="inline-block rounded-md bg-black px-8 py-4 text-base font-bold text-white transition-colors hover:bg-gray-900"
                                >
                                    Start Searching for Free
                                </a>
                                <a
                                    href="#how-it-works"
                                    className="inline-block rounded-md border border-gray-300 px-8 py-4 text-base font-bold text-black transition-colors hover:bg-gray-50"
                                >
                                    See How It Works
                                </a>
                            </div>
                        </ScrollReveal>

                        {/* Right: live feed animation */}
                        <div className="hidden md:flex md:justify-end">
                            <ListingFeedAnimation />
                        </div>
                    </div>
                </section>

                {/* ── What We Do ───────────────────────────────────────── */}
                <section
                    id="what-we-do"
                    className="min-h-screen snap-start flex items-center bg-black px-6 py-20 md:py-0 md:h-full md:px-10 lg:px-16"
                >
                    <div className="mx-auto w-full max-w-6xl">
                        <ScrollReveal>
                            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-gray-400">
                                What We Do
                            </p>
                            <h2 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
                                Berlin&apos;s rental market is broken.
                                <br />
                                We fix it.
                            </h2>

                            {/* Two-column problem / solution table */}
                            <div className="mt-8 md:mt-10 border-t border-l border-white/15">
                                {/* Header row */}
                                <div className="grid grid-cols-2 border-b border-r border-white/15">
                                    <div className="border-r border-white/15 px-6 py-3 md:px-8">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-500">
                                            The Problem
                                        </span>
                                    </div>
                                    <div className="px-6 py-3 md:px-8">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-500">
                                            Our Solution
                                        </span>
                                    </div>
                                </div>
                                {/* Data rows */}
                                {whatWeDo.map((row, i) => (
                                    <div
                                        key={i}
                                        className="group grid grid-cols-2 border-b border-r border-white/15 transition-colors duration-150 hover:bg-zinc-900"
                                    >
                                        <div className="border-r border-white/15 px-6 py-4 md:px-8 flex items-center gap-3">
                                            <span
                                                className="material-symbols-outlined shrink-0 text-gray-600 transition-colors duration-200 group-hover:text-gray-400"
                                                style={{ fontSize: "18px", fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 20' }}
                                            >
                                                {row.icon}
                                            </span>
                                            <p className="text-sm leading-snug text-gray-400">{row.problem}</p>
                                        </div>
                                        <div className="px-6 py-4 md:px-8 flex items-center gap-3">
                                            <span
                                                className="material-symbols-outlined shrink-0 text-white/30 transition-all duration-300 group-hover:text-white group-hover:scale-110"
                                                style={{ fontSize: "18px", fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 20' }}
                                            >
                                                check_circle
                                            </span>
                                            <p className="text-sm leading-snug text-white transition-colors duration-200 group-hover:text-white">
                                                {row.solution}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── How We Work ──────────────────────────────────────── */}
                <section
                    id="how-it-works"
                    className="min-h-screen snap-start flex items-center bg-white px-6 py-20 md:py-0 md:h-full md:px-10 lg:px-16"
                >
                    <div className="mx-auto w-full max-w-6xl">
                        <ScrollReveal>
                            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-gray-400">
                                How We Work
                            </p>
                            <h2 className="max-w-xl text-4xl font-black tracking-tight text-black md:text-5xl">
                                From signup to
                                <br />
                                signed lease.
                            </h2>

                            <div className="mt-8 md:mt-12 grid border-t border-l border-gray-200 sm:grid-cols-2 md:grid-cols-3">
                                {howItWorks.map((s) => (
                                    <div
                                        key={s.step}
                                        className="group cursor-default border-b border-r border-gray-200 bg-white p-8 transition-colors duration-200 hover:bg-gray-50 md:p-10 relative"
                                    >
                                        {s.tier && (
                                            <span
                                                className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-black text-white"
                                            >
                                                {s.tier}
                                            </span>
                                        )}
                                        <span className="font-mono text-3xl font-black text-gray-200 transition-colors duration-200 group-hover:text-gray-300">
                                            {s.step}
                                        </span>
                                        <h3 className="mt-4 text-base font-bold text-black">
                                            {s.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                            {s.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── How We Offer a Solution ───────────────────────────── */}
                <section
                    id="solutions"
                    className="min-h-screen snap-start flex items-center bg-black px-6 py-20 md:py-0 md:h-full md:px-10 lg:px-16"
                >
                    <div className="mx-auto w-full max-w-6xl">
                        <ScrollReveal>
                            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-gray-400">
                                How We Offer a Solution
                            </p>
                            <h2 className="max-w-xl text-4xl font-black tracking-tight text-white md:text-5xl">
                                Every edge.
                                <br />
                                Built in.
                            </h2>

                            {/* Feature grid — 4 cols */}
                            <div className="mt-6 md:mt-8 grid grid-cols-2 border-t border-l border-white/15 md:grid-cols-4">
                                {solutionFeatures.map((f) => (
                                    <div
                                        key={f.title}
                                        className="group cursor-default border-b border-r border-white/15 bg-black p-5 transition-colors duration-200 hover:bg-zinc-950 md:p-6"
                                    >
                                        <span
                                            className="material-symbols-outlined inline-block text-white transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5"
                                            style={{ fontSize: "28px", fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 28' }}
                                        >
                                            {f.icon}
                                        </span>
                                        <h3 className="mt-3 text-sm font-bold text-white">{f.title}</h3>
                                        <p className="mt-1 text-xs leading-relaxed text-gray-400">{f.text}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Comparison table */}
                            <div className="mt-6 overflow-x-auto">
                                <div className="min-w-[640px] border-t border-l border-white/15">
                                    {/* Header */}
                                    <div className="grid grid-cols-[1fr_120px_110px_120px_100px] border-b border-r border-white/15">
                                        <div className="border-r border-white/15 px-4 py-2 md:px-6">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Feature</span>
                                        </div>
                                        <div className="border-r border-white/15 px-3 py-2 text-center">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">Budenfinder</span>
                                        </div>
                                        <div className="border-r border-white/15 px-3 py-2 text-center">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">ImmoScout24</span>
                                        </div>
                                        <div className="border-r border-white/15 px-3 py-2 text-center">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">WG-Gesucht</span>
                                        </div>
                                        <div className="border-r border-white/15 px-3 py-2 text-center">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Kleinanzeigen</span>
                                        </div>
                                    </div>
                                    {comparisonRows.map((row, i) => (
                                        <div
                                            key={i}
                                            className="group grid grid-cols-[1fr_120px_110px_120px_100px] border-b border-r border-white/15 transition-colors duration-150 hover:bg-zinc-950"
                                        >
                                            <div className="border-r border-white/15 px-4 py-2.5 md:px-6">
                                                <span className="text-xs text-gray-300">{row.feature}</span>
                                            </div>
                                            <div className="border-r border-white/15 px-3 py-2.5 text-center">
                                                <CompetitorCell value={row.budenfinder} />
                                            </div>
                                            <div className="border-r border-white/15 px-3 py-2.5 text-center">
                                                <CompetitorCell value={row.is24} />
                                            </div>
                                            <div className="border-r border-white/15 px-3 py-2.5 text-center">
                                                <CompetitorCell value={row.wgGesucht} />
                                            </div>
                                            <div className="border-r border-white/15 px-3 py-2.5 text-center">
                                                <CompetitorCell value={row.kleinanzeigen} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── Pricing ──────────────────────────────────────────── */}
                <section
                    id="pricing"
                    className="min-h-screen snap-start flex items-center bg-black px-6 py-20 md:py-0 md:h-full md:px-10 lg:px-16"
                >
                    <div className="mx-auto w-full max-w-6xl">
                        <ScrollReveal>
                            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-gray-400">
                                Pricing
                            </p>
                            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                                Simple, honest pricing.
                            </h2>
                            <p className="mt-4 text-base text-gray-400">
                                Start free. Upgrade when you need more firepower.
                            </p>

                            <div className="mt-8 md:mt-10 grid border-t border-l border-white/15 md:grid-cols-2">
                                {pricingTiers.map((tier) => (
                                    <div
                                        key={tier.name}
                                        className={`group cursor-default flex flex-col gap-5 border-b border-r border-white/15 p-8 transition-colors duration-200 md:p-10 ${
                                            tier.highlighted
                                                ? "bg-white hover:bg-gray-50"
                                                : "bg-black hover:bg-zinc-950"
                                        }`}
                                    >
                                        {tier.highlighted && (
                                            <span className="self-start font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
                                                Most Popular
                                            </span>
                                        )}

                                        <div>
                                            <p
                                                className={`font-mono text-xs uppercase tracking-widest ${
                                                    tier.highlighted ? "text-gray-500" : "text-gray-400"
                                                }`}
                                            >
                                                {tier.name}
                                            </p>

                                            {tier.billingOptions ? (
                                                <div className="mt-3 grid grid-cols-2 gap-3">
                                                    {tier.billingOptions.map((opt, i) => (
                                                        <div
                                                            key={i}
                                                            className="rounded-md border border-gray-200 px-4 py-3"
                                                        >
                                                            <p className="text-2xl font-black tracking-tight text-black">
                                                                {opt.price}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-gray-400">{opt.note}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <>
                                                    <p
                                                        className={`mt-2 text-4xl font-black tracking-tight transition-transform duration-300 group-hover:scale-[1.03] origin-left md:text-5xl ${
                                                            tier.highlighted ? "text-black" : "text-white"
                                                        }`}
                                                    >
                                                        {tier.price}
                                                    </p>
                                                    <p
                                                        className={`mt-1 text-xs ${
                                                            tier.highlighted ? "text-gray-400" : "text-gray-500"
                                                        }`}
                                                    >
                                                        {tier.sub}
                                                    </p>
                                                </>
                                            )}

                                            <p
                                                className={`mt-3 text-sm ${
                                                    tier.highlighted ? "text-gray-600" : "text-gray-300"
                                                }`}
                                            >
                                                {tier.tagline}
                                            </p>
                                        </div>

                                        <ul className="flex flex-1 flex-col gap-2">
                                            {tier.features.map((f) => (
                                                <li
                                                    key={f}
                                                    className={`flex items-start gap-2 text-sm ${
                                                        tier.highlighted ? "text-black" : "text-gray-300"
                                                    }`}
                                                >
                                                    <span
                                                        className={`mt-0.5 leading-none ${
                                                            tier.highlighted ? "text-black" : "text-gray-400"
                                                        }`}
                                                    >
                                                        ✓
                                                    </span>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        <a
                                            href="#waitlist"
                                            className={`rounded-md py-3 text-center text-sm font-semibold transition-colors ${
                                                tier.highlighted
                                                    ? "bg-black text-white hover:bg-gray-900"
                                                    : "border border-white/30 text-white hover:border-white hover:bg-white/5"
                                            }`}
                                        >
                                            {tier.cta}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── Social Proof / Target Audience ───────────────────── */}
                <section
                    id="social-proof"
                    className="min-h-screen snap-start flex items-center bg-white px-6 py-20 md:py-0 md:h-full md:px-10 lg:px-16"
                >
                    <div className="mx-auto w-full max-w-6xl">
                        <ScrollReveal>
                            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-gray-400">
                                Who We Build For
                            </p>
                            <h2 className="max-w-xl text-4xl font-black tracking-tight text-black md:text-5xl">
                                Built for every
                                <br />
                                Berlin arrival.
                            </h2>

                            <div className="mt-8 md:mt-12 grid border-t border-l border-gray-200 md:grid-cols-3">
                                {personas.map((p) => (
                                    <div
                                        key={p.type}
                                        className="group cursor-default flex flex-col gap-5 border-b border-r border-gray-200 bg-white p-8 transition-colors duration-200 hover:bg-gray-50 md:p-10"
                                    >
                                        {/* Avatar */}
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4 ${p.avatar.bgClass} ${p.avatar.ringClass} transition-transform duration-300 group-hover:scale-105`}
                                            >
                                                <span className={`text-sm font-bold ${p.avatar.textClass}`}>
                                                    {p.avatar.initials}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-black">{p.name}</p>
                                                <p className="text-xs text-gray-400">{p.detail}</p>
                                            </div>
                                        </div>

                                        {/* Star rating */}
                                        <StarRating count={p.stars} />

                                        {/* Label + meta */}
                                        <div>
                                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-400">
                                                {p.type}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-400">{p.meta}</p>
                                        </div>

                                        <blockquote className="flex-1 text-sm leading-relaxed text-gray-600">
                                            {"\u201C"}{p.quote}{"\u201D"}
                                        </blockquote>

                                        <div className="h-px w-8 bg-gray-200 transition-all duration-300 group-hover:w-16" />
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* ── Waitlist + Footer ────────────────────────────────── */}
                <section
                    id="waitlist"
                    className="min-h-screen snap-start flex flex-col bg-white md:h-full"
                >
                    {/* Centered form area */}
                    <div className="flex flex-1 items-center justify-center px-6 md:px-10">
                        <ScrollReveal className="w-full max-w-md text-center">
                            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-gray-400">
                                Early Access
                            </p>
                            <h2 className="text-4xl font-black tracking-tight text-black md:text-5xl">
                                Start Searching
                                <br />
                                for Free.
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-gray-500">
                                No credit card needed. Join the waitlist and get priority access
                                with early-bird pricing when we launch.
                            </p>

                            <div className="mt-10">
                                <WaitlistForm />
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Footer */}
                    <footer className="border-t border-gray-100 px-6 py-6 md:px-10">
                        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-gray-400 md:flex-row">
                            <span className="font-bold tracking-tighter text-black">
                                Budenfinder
                            </span>

                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
                                {[
                                    { href: "#what-we-do", label: "About" },
                                    { href: "#pricing", label: "Pricing" },
                                    { href: "/legal", label: "Legal (DSGVO/GDPR)" },
                                    { href: "/blog", label: "Blog" },
                                    { href: "mailto:hello@budenfinder.de", label: "Contact" },
                                    { href: "/impressum", label: "Impressum" },
                                ].map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="text-xs transition-colors hover:text-black"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>

                            <span className="text-xs">© 2026 Budenfinder</span>
                        </div>
                    </footer>
                </section>
            </main>
        </>
    );
}
