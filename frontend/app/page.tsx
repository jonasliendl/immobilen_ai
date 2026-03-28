import { Fragment } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";
import { WaitlistForm } from "@/components/waitlist-form";

function QrPlaceholder() {
    return (
        <svg
            viewBox="0 0 120 120"
            className="mx-auto h-40 w-40 text-on-background"
            aria-hidden
        >
            <rect fill="currentColor" x="8" y="8" width="32" height="32" rx="2" />
            <rect fill="currentColor" x="80" y="8" width="32" height="32" rx="2" />
            <rect fill="currentColor" x="8" y="80" width="32" height="32" rx="2" />
            <rect fill="none" stroke="currentColor" strokeWidth="3" x="14" y="14" width="20" height="20" />
            <rect fill="none" stroke="currentColor" strokeWidth="3" x="86" y="14" width="20" height="20" />
            <rect fill="none" stroke="currentColor" strokeWidth="3" x="14" y="86" width="20" height="20" />
            {[
                [48, 8],
                [64, 8],
                [48, 24],
                [72, 24],
                [48, 40],
                [88, 40],
                [8, 48],
                [24, 56],
                [40, 48],
                [56, 56],
                [72, 48],
                [88, 56],
                [104, 48],
                [48, 72],
                [64, 72],
                [80, 72],
                [48, 88],
                [72, 88],
                [96, 88],
                [104, 104],
                [88, 104],
                [72, 104],
                [56, 104],
            ].map(([x, y], i) => (
                <rect key={i} fill="currentColor" x={x} y={y} width="10" height="10" rx="1" />
            ))}
        </svg>
    );
}

const problemStats = [
    { num: "+12%", label: "Rent increase in 2025", sub: "€15.79/m² median asking rent" },
    { num: "10+", label: "Portals to search manually", sub: "ImmoScout, Immowelt, WG-Gesucht & more" },
    { num: "2×", label: "Higher scam risk for expats", sub: "Non-German speakers most affected" },
    { num: "70%", label: "Listings violate rent caps", sub: "Mietpreisbremse ignored by landlords" },
    { num: "4 mo", label: "Average time to find a flat", sub: "Without the right tools or connections" },
];

const solutionCards = [
    {
        icon: "hub",
        stat: "All portals",
        title: "Scrape · Match · Genossenschaft-first",
        text: "Lucid Intelligence pulls listings from every major Berlin platform, deduplicates them, and prioritises affordable, member-aligned homes. Tell us your Genossenschaft (Wohnungsgenossenschaft) and share tier — we weight offers that fit cooperative rules and your budget.",
        color: "text-primary-container",
    },
    {
        icon: "tune",
        stat: "Live filters",
        title: "Location · Price · m² · Rooms",
        text: "Refine district, cold rent, square metres, and room count. Our models re-rank the feed so the cheapest compliant listings surface first while respecting your preferences and eligibility.",
        color: "text-primary",
    },
    {
        icon: "verified_user",
        stat: "Secure + LLM",
        title: "Applications · SCHUFA · Chat",
        text: "Upload SCHUFA, income proofs, and documents once — stored safely for the Application Tracker. An LLM helps polish cover letters and answers. Use Chat to ask anything before you hit send.",
        color: "text-secondary",
    },
];

const whoWeServe = [
    {
        icon: "🤝",
        stat: "Genossenschaft",
        title: "Shareholders & cooperative members",
        text: "You hold shares in a Berlin Wohnungsgenossenschaft but still struggle to find a flat at the rates your community promises. We cross-scan portals and cooperative channels so member-priced inventory does not get lost in the noise.",
    },
    {
        icon: "🏠",
        stat: "Affordable first",
        title: "Below-market housing seekers",
        text: "We optimise for the lowest legal rent that matches your profile — Mietpreisbremse checks, duplicate removal, and ranking that favours genuine affordable stock over inflated asks.",
    },
    {
        icon: "🔐",
        stat: "Vault",
        title: "Documents & SCHUFA, protected",
        text: "Keep Mieterselbstauskunft, SCHUFA, payslips, and IDs in one encrypted workflow. Feed them into the Application Tracker and LLM-assisted applications without emailing PDFs to random inboxes.",
    },
    {
        icon: "💬",
        stat: "Pre-apply",
        title: "Chat before you commit",
        text: "Unsure about Genossenschaft clauses, Nebenkosten, or Anmeldung timing? Talk to the AI assistant first — then apply with confidence from the same platform.",
    },
];

type ShareTier = {
    id: string;
    name: string;
    popular?: boolean;
    founding?: boolean;
    sharesBadge: string;
    sharesBadgeMuted?: boolean;
    price: string;
    priceClass: string;
    perMonth: string;
    perMonthClass?: string;
    shareCost: string;
    shareCostClass?: string;
    benefits: string[];
    cta: { label: string; href: string; variant: "outline-green" | "gradient" | "outline-mint" };
};

const shareTiers: ShareTier[] = [
    {
        id: "explorer",
        name: "Explorer",
        sharesBadgeMuted: true,
        sharesBadge: "0 shares",
        price: "€0",
        priceClass: "text-on-background",
        perMonth: "/ month · Free forever",
        shareCost: "No share required",
        shareCostClass: "text-[#64748B]",
        benefits: [
            "Basic apartment search",
            "Scam detection",
            "Mietpreisbremse checker",
            "10 saved listings",
        ],
        cta: { label: "Get Started", href: "/search", variant: "outline-green" },
    },
    {
        id: "member",
        name: "Member",
        sharesBadge: "1 share · €50 one-time",
        price: "€4.90",
        priceClass: "text-primary",
        perMonth: "/ month",
        shareCost: "+ €50 refundable share",
        shareCostClass: "text-[#64748B]",
        benefits: [
            "Everything in Explorer",
            "Full AI personalised matching",
            "Priority listing alerts",
            "Unlimited saved listings",
            "AI chat unlimited",
        ],
        cta: { label: "Become a Member", href: "#waitlist", variant: "gradient" },
    },
    {
        id: "shareholder",
        name: "Shareholder",
        popular: true,
        sharesBadge: "3 shares · €150 one-time",
        price: "€9.90",
        priceClass: "text-primary",
        perMonth: "/ month",
        shareCost: "+ €150 refundable share",
        shareCostClass: "text-[#64748B]",
        benefits: [
            "Everything in Member",
            "Hidden & off-market listings",
            "One-click application autofill",
            "Contract review service",
            "Anmeldung registration help",
            "Application optimiser",
            "Community voting rights",
        ],
        cta: { label: "Become a Shareholder", href: "#waitlist", variant: "gradient" },
    },
    {
        id: "founding",
        name: "Founding Shareholder",
        founding: true,
        sharesBadge: "6 shares · €300 one-time",
        price: "€14.90",
        priceClass: "text-primary-container",
        perMonth: "/ month",
        perMonthClass: "text-secondary-fixed",
        shareCost: "+ €300 refundable share",
        shareCostClass: "text-[#A8DADC]",
        benefits: [
            "Everything in Shareholder",
            "Lifetime price lock guaranteed",
            "Direct landlord network access",
            "Dedicated concierge agent",
            "Early feature access",
            "Founding member badge",
        ],
        cta: { label: "Join as Founder", href: "#waitlist", variant: "outline-mint" },
    },
];

const steps = [
    {
        n: "01",
        title: "Build Your Profile",
        body: "Set your budget, district, size, commute, and lifestyle preferences. Takes under 2 minutes.",
    },
    {
        n: "02",
        title: "AI Scans Every Listing",
        body: "Our engine scrapes all Berlin portals every hour, removes duplicates and scams, and checks rent caps automatically.",
    },
    {
        n: "03",
        title: "Get Your Matched Feed",
        body: "Receive a ranked list of apartments scored against your profile. The AI learns and improves with every interaction.",
    },
    {
        n: "04",
        title: "Apply & Move In",
        body: "Autofill applications from your secure document vault. Genossenschaft members get cooperative-aware ranking. Use Chat for last questions, then track every landlord reply in one dashboard.",
    },
];

const features = [
    {
        icon: "travel_explore",
        badge: "10,000+ listings/day",
        title: "Universal Listing Aggregator",
        text: "We scrape ImmoScout24, Immowelt, WG-Gesucht, Kleinanzeigen, and Wunderflats every hour. Listings are deduplicated using address and image hashing, then surfaced in one clean, unified feed.",
        href: "/search",
    },
    {
        icon: "psychology",
        badge: "Learns with every search",
        title: "AI Matching Engine",
        text: "A vector-based recommendation engine scores every listing against your profile. It improves with your thumbs-up and thumbs-down feedback — getting sharper the more you use it.",
        href: "/search",
    },
    {
        icon: "insights",
        badge: "Live market data",
        title: "Market Intelligence",
        text: "Track rent trends by district, compare your shortlist against neighbourhood benchmarks, and see a live Berlin map overlay of pricing and availability signals.",
        href: "/intelligence",
    },
    {
        icon: "fact_check",
        badge: "100% listings checked",
        title: "Mietpreisbremse Verifier",
        text: "Every listing is automatically checked against Berlin's legal rent cap. Overpriced listings are flagged in red so you always know your rights before you apply.",
        href: "/search",
    },
    {
        icon: "chat",
        badge: "Multi-provider AI",
        title: "AI Rental Assistant",
        text: "Ask anything about Berlin renting — contracts, districts, Anmeldung, Genossenschaft eligibility. Powered by Ollama locally with Hugging Face fallback for always-on availability.",
        href: "/chat",
    },
    {
        icon: "rocket_launch",
        badge: "5× faster applications",
        title: "Application Optimiser",
        text: "Connect your existing rental profile and we analyse it against what Berlin landlords actually want. Get a scored tenant report and an AI-generated cover letter in seconds.",
        href: "/tracker",
    },
];

const useCases = [
    {
        accent: "border-t-primary-container",
        icon: "✈️",
        scenario: "Relocating from abroad",
        stat: "Found in 4 days",
        text: "Sarah moved from London to Berlin for a tech job. She set her profile in 90 seconds, got 12 matched listings by morning, and signed a lease within 4 days — fully in English.",
        tag: "Expat · Prenzlauer Berg · €950/mo",
    },
    {
        accent: "border-t-primary",
        icon: "💻",
        scenario: "Freelancer on a budget",
        stat: "18% below market rate",
        text: "Karim used the Market Intelligence feature to find a Mitte flat priced 18% below the district benchmark. The Mietpreisbremse checker flagged 3 of his shortlisted flats as overpriced before he wasted time applying.",
        tag: "Freelancer · Mitte · €780/mo",
    },
    {
        accent: "border-t-secondary",
        icon: "🎓",
        scenario: "Student optimising their application",
        stat: "5 viewing invites in 1 week",
        text: "Julia's rental applications were getting ignored. The Application Optimiser scored her profile, rewrote her cover letter, and she went from zero responses to 5 viewing invitations in 7 days.",
        tag: "Student · Neukölln · €620/mo",
    },
];

const testimonials = [
    {
        quote:
            "I found my Berlin apartment in 4 days. As a non-German speaker I was terrified of scams — Ai.mmobilie made the whole process feel safe and simple.",
        name: "Sarah M.",
        role: "Software Engineer · Relocated from London",
        tag: "Prenzlauer Berg",
        initials: "SM",
    },
    {
        quote:
            "The AI matched me to a flat 18% below market rate and flagged 3 overpriced listings on my shortlist before I wasted time applying. Genuinely impressive.",
        name: "Karim A.",
        role: "Freelance Designer · Cairo → Berlin",
        tag: "Mitte",
        initials: "KA",
    },
    {
        quote:
            "The Application Optimiser rewrote my cover letter and I went from zero responses to 5 viewing invitations in one week. Worth every cent.",
        name: "Julia B.",
        role: "Erasmus Student · Freie Universität",
        tag: "Neukölln",
        initials: "JB",
    },
];

const team = [
    {
        initials: "JS",
        name: "Justice Samuel",
        role: "CEO · Engineer",
        bio: "Product vision, Berlin rental tech, and end-to-end delivery.",
    },
    {
        initials: "JL",
        name: "Jonas Liendl",
        role: "CTO · Engineer",
        bio: "Architecture, AI/ML hooks, and data pipelines that power Lucid Intelligence.",
    },
    {
        initials: "TB",
        name: "Tim Brand",
        role: "CMO · UI/UX Designer",
        bio: "Brand, marketing, and product experience — editorial interfaces and renter-first flows.",
    },
    {
        initials: "AS",
        name: "Ahmed Sohail",
        role: "COO · Engineer",
        bio: "Delivery rhythm, cross-functional alignment, and platform engineering.",
    },
];

export default function Home() {
    return (
        <main className="flex w-full flex-1 flex-col">
            {/* SECTION 1 — HERO */}
            <header className="relative flex min-h-screen flex-col overflow-hidden bg-hero-dark pt-20 text-white">
                <div className="cube-texture-dark pointer-events-none absolute inset-0 z-0" aria-hidden />
                <div
                    className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-primary/10 via-transparent to-tertiary/5"
                    aria-hidden
                />

                <ScrollReveal className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 text-center md:px-8">
                    <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary-container">
                        Berlin · AI-Powered Rental Intelligence
                    </p>
                    <h1 className="mt-6 font-sans text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                        Find Your Berlin Apartment.
                        <br />
                        Before Anyone Else Does.
                    </h1>
                    <p className="mx-auto mt-6 max-w-lg font-sans text-base font-normal leading-relaxed text-secondary-fixed md:text-lg">
                        Lucid Intelligence finds fair, affordable Berlin homes for Genossenschaft members — one feed,
                        smart applications, and chat before you apply.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
                        <Link
                            href="/search"
                            className="btn-primary-gradient inline-flex min-h-[48px] items-center justify-center rounded-xl px-8 py-3.5 font-bold text-on-primary shadow-lg transition hover:-translate-y-0.5 hover:shadow-ambient"
                        >
                            Start Searching
                        </Link>
                        <a
                            href="#waitlist"
                            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-primary-container px-8 py-3.5 font-semibold text-white transition hover:bg-white/5"
                        >
                            Join the Waitlist →
                        </a>
                    </div>
                </ScrollReveal>

                <div className="relative z-10 mx-auto mt-auto w-full max-w-4xl px-6 pb-12 md:px-8">
                    <ScrollReveal>
                        <div className="glass-box rounded-2xl px-4 py-5 md:px-8 md:py-6">
                            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                                {[
                                    "🏠 10,000+ Listings Daily",
                                    "✅ Mietpreisbremse Verified",
                                    "🚨 Scam-Free Filtered",
                                    "🌐 English & German",
                                ].map((pill) => (
                                    <span
                                        key={pill}
                                        className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90 md:text-sm"
                                    >
                                        {pill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </header>

            {/* SECTION 2+3 — PROBLEM → SOLUTION (single card, red → green) */}
            <section className="bg-surface py-20 md:py-28">
                <ScrollReveal className="mx-auto max-w-screen-xl px-6 md:px-8">
                    <div className="overflow-hidden rounded-[2rem] shadow-floating">
                        <div className="problem-solution-flow relative">
                            <div
                                className="cube-texture pointer-events-none absolute inset-0 opacity-[0.07]"
                                aria-hidden
                            />
                            {/* Problem zone — red end of gradient */}
                            <div className="relative px-6 pb-10 pt-12 md:px-12 md:pb-14 md:pt-16">
                                <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
                                    The Problem
                                </p>
                                <h2 className="mt-4 max-w-3xl font-sans text-3xl font-bold leading-tight text-white md:text-4xl">
                                    Berlin&apos;s Rental Market Is Broken.
                                </h2>
                                <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-white/80 md:text-base">
                                    Especially for{" "}
                                    <strong className="font-semibold text-white">Genossenschaft shareholders</strong> —
                                    affordable member flats hide across ten portals while scams and illegal rents crowd
                                    the feed.
                                </p>
                                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                    {problemStats.map((c) => (
                                        <div
                                            key={c.label}
                                            className="flex flex-col items-center rounded-2xl bg-white/18 px-4 py-8 text-center shadow-lg backdrop-blur-md"
                                        >
                                            <span className="font-mono text-3xl font-semibold text-white text-shadow-sm md:text-4xl">
                                                {c.num}
                                            </span>
                                            <p className="mt-3 font-sans text-sm font-semibold text-white">{c.label}</p>
                                            <p className="mt-2 font-sans text-xs font-normal leading-relaxed text-white/75">
                                                {c.sub}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Mid transition label */}
                            <div className="relative px-6 md:px-12">
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                                <p className="pt-6 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80 md:text-xs">
                                    Shift to clarity
                                </p>
                            </div>
                            {/* Solution zone — Stitch mint end (#3ECFA0) */}
                            <div className="relative px-6 pb-12 pt-8 md:px-12 md:pb-16 md:pt-10">
                                <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-hero-dark/85">
                                    The Solution
                                </p>
                                <h2 className="mt-4 max-w-3xl font-sans text-3xl font-bold tracking-tight text-hero-dark md:text-4xl">
                                    One platform. Every listing. Zero guesswork.
                                </h2>
                                <p className="mt-5 max-w-2xl text-pretty font-sans text-base font-normal leading-relaxed text-hero-dark/90 md:text-lg">
                                    Ai.mmobilie is the <strong className="font-semibold text-hero-dark">AI layer</strong>{" "}
                                    for cooperative members and community shareholders: it pulls ads from across
                                    Berlin, surfaces the{" "}
                                    <strong className="font-semibold text-hero-dark">cheapest legal rents</strong> that
                                    match your shares and filters, and saves hours every week. Ship stronger
                                    applications through the{" "}
                                    <strong className="font-semibold text-hero-dark">tracker</strong>, talk it through
                                    in <strong className="font-semibold text-hero-dark">chat</strong> — all before a
                                    landlord ever opens your folder.
                                </p>
                                <div className="mt-10 grid gap-6 md:grid-cols-3">
                                    {solutionCards.map((c) => (
                                        <div
                                            key={c.title}
                                            className="rounded-2xl bg-surface-container-lowest/95 p-8 shadow-ambient backdrop-blur-sm"
                                        >
                                            <span className={`material-symbols-outlined text-[32px] ${c.color}`}>
                                                {c.icon}
                                            </span>
                                            <p className="mt-4 font-mono text-xl font-semibold text-primary md:text-2xl">
                                                {c.stat}
                                            </p>
                                            <h3 className="mt-2 font-sans text-lg font-semibold text-on-background">
                                                {c.title}
                                            </h3>
                                            <p className="mt-3 font-sans text-sm font-normal leading-relaxed text-on-surface/85">
                                                {c.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* SECTION 4 — WHO WE SERVE (Genossenschaft & affordable housing) */}
            <section className="bg-surface-container-low py-20 md:py-28">
                <ScrollReveal className="mx-auto max-w-screen-xl px-6 md:px-8">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
                        Who We Serve
                    </p>
                    <h2 className="mt-4 font-sans text-3xl font-bold text-on-background md:text-4xl">
                        Cooperative members & affordable-housing seekers.
                    </h2>
                    <p className="mt-4 max-w-3xl font-sans text-base leading-relaxed text-on-surface/85">
                        Ai.mmobilie is built for people with{" "}
                        <strong className="text-on-background">shares in a Berlin Wohnungsgenossenschaft</strong> and
                        anyone chasing <strong className="text-on-background">truly affordable</strong> rents. Lucid
                        Intelligence maps portal data to your membership, filters, and documents so you spend less time
                        searching and more time moving in.
                    </p>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2">
                        {whoWeServe.map((p) => (
                            <div
                                key={p.title}
                                className="rounded-2xl bg-surface-container-high p-8 shadow-ambient"
                            >
                                <span className="text-3xl">{p.icon}</span>
                                <p className="mt-4 font-mono text-lg font-semibold text-primary md:text-xl">{p.stat}</p>
                                <h3 className="mt-2 font-sans text-lg font-semibold text-on-background">{p.title}</h3>
                                <p className="mt-3 font-sans text-sm leading-relaxed text-on-surface/80">{p.text}</p>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </section>

            {/* MEMBERSHIP & SHARES — business model */}
            <section className="scroll-mt-20 bg-surface-container-low py-20 md:py-28">
                <ScrollReveal className="mx-auto max-w-screen-xl px-6 md:px-8">
                    <p className="text-center font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                        Membership &amp; Shares
                    </p>
                    <h2 className="mt-4 text-center font-sans text-3xl font-bold text-on-background md:text-4xl">
                        Own a Share. Unlock the Platform.
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-center font-sans text-base leading-relaxed text-[#64748B]">
                        Inspired by Berlin&apos;s Genossenschaft cooperative housing model. Buy 1–6 shares at €50 each —
                        fully refundable if you leave. More shares unlock higher tiers and more community voting weight.
                    </p>

                    <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {shareTiers.map((tier) => (
                            <div
                                key={tier.id}
                                className={`relative flex flex-col rounded-2xl p-6 shadow-floating md:p-7 ${tier.founding
                                    ? "bg-hero-dark text-white"
                                    : "bg-surface-container-lowest"
                                    } ${tier.popular ? "border-t-4 border-primary-container pt-8" : "pt-6"}`}
                            >
                                {tier.popular && (
                                    <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary-container px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-hero-dark md:text-xs">
                                        Most Popular
                                    </span>
                                )}

                                <h3 className="font-sans text-lg font-bold text-inherit">{tier.name}</h3>

                                <p
                                    className={`mt-3 font-mono text-xs font-medium ${tier.sharesBadgeMuted ? "text-[#64748B]" : "text-primary-container"} ${tier.founding ? "!text-primary-container" : ""}`}
                                >
                                    {tier.sharesBadge}
                                </p>

                                <div className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-0">
                                    <span className={`font-mono text-3xl font-bold tracking-tight ${tier.priceClass}`}>
                                        {tier.price}
                                    </span>
                                    <span
                                        className={`font-sans text-sm ${tier.perMonthClass ?? (tier.founding ? "text-secondary-fixed" : "text-on-surface/70")}`}
                                    >
                                        {tier.perMonth}
                                    </span>
                                </div>

                                <p
                                    className={`mt-2 font-sans text-sm ${tier.shareCostClass ?? "text-[#64748B]"}`}
                                >
                                    {tier.shareCost}
                                </p>

                                <div
                                    className={`my-5 border-t ${tier.founding ? "border-white/10" : "border-outline-variant/25"}`}
                                />

                                <ul className="flex-1 space-y-2.5 font-sans text-sm">
                                    {tier.benefits.map((b) => (
                                        <li
                                            key={b}
                                            className={`flex gap-2 leading-snug ${tier.founding ? "text-secondary-fixed" : "text-on-surface/85"}`}
                                        >
                                            <span className="shrink-0 text-primary-container">✓</span>
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-8">
                                    {tier.cta.variant === "outline-green" && (
                                        <Link
                                            href={tier.cta.href}
                                            className="flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-primary px-4 py-3 text-center font-semibold text-primary transition hover:bg-primary/5"
                                        >
                                            {tier.cta.label}
                                        </Link>
                                    )}
                                    {tier.cta.variant === "gradient" && (
                                        <a
                                            href={tier.cta.href}
                                            className="btn-primary-gradient flex min-h-[48px] w-full items-center justify-center rounded-xl px-4 py-3 text-center font-bold text-on-primary shadow-md transition hover:-translate-y-0.5 hover:shadow-ambient"
                                        >
                                            {tier.cta.label}
                                        </a>
                                    )}
                                    {tier.cta.variant === "outline-mint" && (
                                        <a
                                            href={tier.cta.href}
                                            className="flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-primary-container px-4 py-3 text-center font-semibold text-primary-container transition hover:bg-white/5"
                                        >
                                            {tier.cta.label}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mx-auto mt-12 max-w-2xl text-center font-sans text-sm italic leading-relaxed text-[#64748B]">
                        All shares are fully refundable when you leave — just like a real Berlin Genossenschaft. Zero
                        risk.
                    </p>
                </ScrollReveal>
            </section>

            {/* SECTION 5 — HOW IT WORKS */}
            <section className="relative overflow-hidden bg-hero-dark py-20 md:py-28">
                <div className="cube-texture-dark pointer-events-none absolute inset-0 z-0 opacity-80" aria-hidden />
                <ScrollReveal className="relative z-10 mx-auto max-w-screen-xl px-6 md:px-8">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary-container">
                        How It Works
                    </p>
                    <h2 className="mt-4 font-sans text-3xl font-bold text-white md:text-4xl">
                        From Sign-Up to Moving In — 4 Steps.
                    </h2>

                    <div className="mt-14 md:hidden">
                        <div className="relative space-y-10 border-l-2 border-dashed border-primary-container pl-8">
                            {steps.map((s) => (
                                <div key={s.n} className="relative">
                                    <span className="absolute -left-[2.125rem] top-0 flex h-8 w-8 -translate-x-px items-center justify-center rounded-full bg-hero-dark font-mono text-sm font-semibold text-primary-container">
                                        {s.n}
                                    </span>
                                    <h3 className="font-sans text-base font-semibold text-white">{s.title}</h3>
                                    <p className="mt-2 font-sans text-sm leading-relaxed text-secondary-fixed">
                                        {s.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-14 hidden md:flex md:items-start md:justify-between">
                        {steps.map((s, i) => (
                            <Fragment key={s.n}>
                                <div className="min-w-0 flex-1 px-2 text-center">
                                    <span className="font-mono text-3xl font-semibold text-primary-container">
                                        {s.n}
                                    </span>
                                    <h3 className="mt-3 font-sans text-base font-semibold text-white">{s.title}</h3>
                                    <p className="mt-2 font-sans text-sm leading-relaxed text-secondary-fixed">
                                        {s.body}
                                    </p>
                                </div>
                                {i < steps.length - 1 && (
                                    <div
                                        className="mx-1 mt-8 h-0 w-6 shrink-0 self-start border-t-2 border-dashed border-primary-container md:w-10 lg:w-14"
                                        aria-hidden
                                    />
                                )}
                            </Fragment>
                        ))}
                    </div>
                </ScrollReveal>
            </section>

            {/* SECTION 6 — FEATURES */}
            <section className="bg-surface py-20 md:py-28">
                <ScrollReveal className="mx-auto max-w-screen-xl px-6 md:px-8">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                        Platform Features
                    </p>
                    <h2 className="mt-4 font-sans text-3xl font-bold text-on-background md:text-4xl">
                        Everything You Need to Win the Berlin Rental Market.
                    </h2>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="flex flex-col rounded-2xl bg-surface-container-lowest p-6 shadow-ambient"
                            >
                                <span className="material-symbols-outlined text-[32px] text-primary-container">
                                    {f.icon}
                                </span>
                                <span className="mt-4 inline-flex w-fit rounded-lg bg-primary px-2.5 py-1 font-mono text-xs font-medium text-on-primary">
                                    {f.badge}
                                </span>
                                <h3 className="mt-4 font-sans text-lg font-semibold text-on-background">{f.title}</h3>
                                <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-on-surface/80">
                                    {f.text}
                                </p>
                                <Link
                                    href={f.href}
                                    className="mt-6 inline-flex w-fit items-center rounded-lg bg-surface-container px-3 py-2 text-xs font-medium text-on-secondary-container transition hover:bg-surface-container-high"
                                >
                                    🔒 Available after sign-up
                                </Link>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </section>

            {/* SECTION 7 — USE CASES */}
            <section className="bg-surface-container-low py-20 md:py-28">
                <ScrollReveal className="mx-auto max-w-screen-xl px-6 md:px-8">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
                        Use Cases
                    </p>
                    <h2 className="mt-4 font-sans text-3xl font-bold text-on-background md:text-4xl">
                        Real Scenarios. Real Results.
                    </h2>
                    <div className="mt-12 grid gap-6 lg:grid-cols-3">
                        {useCases.map((u) => (
                            <div
                                key={u.scenario}
                                className={`flex flex-col rounded-2xl border-t-4 bg-surface-container-lowest p-8 shadow-floating ${u.accent}`}
                            >
                                <span className="text-3xl">{u.icon}</span>
                                <p className="mt-4 font-sans text-sm font-semibold text-on-surface/70">{u.scenario}</p>
                                <p className="mt-2 font-mono text-xl font-semibold text-primary">{u.stat}</p>
                                <p className="mt-4 flex-1 font-sans text-sm leading-relaxed text-on-surface/80">
                                    {u.text}
                                </p>
                                <p className="mt-6 font-mono text-xs text-on-surface/60">{u.tag}</p>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </section>

            {/* SECTION 8 — TESTIMONIALS */}
            <section className="bg-surface py-20 md:py-28">
                <ScrollReveal className="mx-auto max-w-screen-xl px-6 md:px-8">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                        What People Say
                    </p>
                    <h2 className="mt-4 font-sans text-3xl font-bold text-on-background md:text-4xl">
                        Trusted by Berlin Renters.
                    </h2>
                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {testimonials.map((t) => (
                            <div
                                key={t.name}
                                className="rounded-2xl bg-surface-container-low p-8 shadow-ambient"
                            >
                                <p className="text-primary-container">⭐⭐⭐⭐⭐</p>
                                <p className="mt-4 font-sans text-sm italic leading-relaxed text-on-background">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-sm font-semibold text-on-primary">
                                        {t.initials}
                                    </div>
                                    <div>
                                        <p className="font-sans text-sm font-semibold text-on-background">{t.name}</p>
                                        <p className="font-sans text-xs text-on-surface/70">{t.role}</p>
                                        <p className="mt-1 font-mono text-xs text-primary">{t.tag}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </section>

            {/* SECTION 9 — TEAM */}
            <section className="relative overflow-hidden bg-hero-dark py-20 md:py-28">
                <div className="cube-texture-dark pointer-events-none absolute inset-0 z-0" aria-hidden />
                <ScrollReveal className="relative z-10 mx-auto max-w-screen-xl px-6 text-center md:px-8">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary-container">
                        The Team
                    </p>
                    <h2 className="mt-4 font-sans text-3xl font-bold text-white md:text-4xl">
                        Built by Renters. For Renters.
                    </h2>
                    <p className="mx-auto mt-6 max-w-lg font-sans text-base font-normal leading-relaxed text-secondary-fixed">
                        We have lived the Berlin rental nightmare firsthand. Ai.mmobilie exists because we could not
                        find a tool that actually worked — so we built one.
                    </p>
                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {team.map((m) => (
                            <div key={m.name} className="glass-box rounded-2xl p-6 text-left">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 font-mono text-lg font-semibold text-white">
                                    {m.initials}
                                </div>
                                <p className="mt-4 font-sans text-base font-semibold text-white">{m.name}</p>
                                <p className="mt-1 font-sans text-sm text-primary-container">{m.role}</p>
                                <p className="mt-3 font-sans text-sm leading-relaxed text-secondary-fixed">{m.bio}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-12 font-mono text-xs text-primary-container">
                        Backed by EXIST · Berlin Startup Scholarship · Earlybird Network
                    </p>
                </ScrollReveal>
            </section>

            {/* SECTION 10 — WAITLIST */}
            <section id="waitlist" className="scroll-mt-20 bg-surface-container-low py-20 md:py-28">
                <ScrollReveal className="mx-auto max-w-screen-lg px-6 md:px-8">
                    <p className="text-center font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                        Early Access
                    </p>
                    <h2 className="mt-4 text-center font-sans text-3xl font-bold text-on-background md:text-4xl">
                        Be First in Berlin.
                    </h2>
                    <p className="mx-auto mt-6 max-w-md text-center font-sans text-base text-on-background/90">
                        Join the waitlist for early access, shareholder pricing, and priority listing alerts before we
                        go public.
                    </p>
                    <div className="mx-auto mt-12 flex max-w-2xl flex-col items-stretch justify-center gap-10 sm:flex-row sm:gap-16">
                        <div className="flex flex-1 flex-col items-center text-center">
                            <span className="font-mono text-4xl font-semibold text-primary">847</span>
                            <span className="mt-1 font-sans text-sm text-on-surface/80">Early members joined</span>
                        </div>
                        <div className="flex flex-1 flex-col items-center text-center">
                            <span className="font-mono text-4xl font-semibold text-primary">€9.90</span>
                            <span className="mt-1 font-sans text-sm text-on-surface/80">Shareholder price locked in</span>
                        </div>
                        <div className="flex flex-1 flex-col items-center text-center">
                            <span className="font-mono text-4xl font-semibold text-primary">2 hrs</span>
                            <span className="mt-1 font-sans text-sm text-on-surface/80">Early listing access advantage</span>
                        </div>
                    </div>
                    <div className="mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-2 lg:gap-12">
                        <div>
                            <WaitlistForm />
                        </div>
                        <div className="flex flex-col justify-center rounded-2xl bg-surface-container-lowest p-8 shadow-ambient">
                            <div className="glass-box rounded-xl border border-primary-container/20 bg-white/60 p-8">
                                <p className="text-center font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                                    Scan to Join
                                </p>
                                <div className="mt-6 text-primary">
                                    <QrPlaceholder />
                                </div>
                                <p className="mt-4 text-center font-sans text-sm text-on-background">
                                    Scan with your phone camera
                                </p>
                                <p className="mt-2 text-center font-sans text-xs text-[#64748B]">
                                    Share with a friend moving to Berlin
                                </p>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* SECTION 11 — FINAL CTA */}
            <section className="relative overflow-hidden bg-hero-dark py-20 md:py-24">
                <div className="cube-texture-dark pointer-events-none absolute inset-0 z-0" aria-hidden />
                <ScrollReveal className="relative z-10 mx-auto max-w-3xl px-6 text-center md:px-8">
                    <h2 className="font-sans text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
                        Your Berlin Apartment Is Waiting.
                    </h2>
                    <p className="mt-6 font-sans text-lg text-secondary-fixed">
                        Stop scrolling 10 portals. Let AI do the work.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/search"
                            className="btn-primary-gradient inline-flex min-h-[48px] items-center justify-center rounded-xl px-10 py-3.5 font-bold text-on-primary shadow-lg transition hover:-translate-y-0.5"
                        >
                            Start Searching
                        </Link>
                        <a
                            href="#waitlist"
                            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-primary-container px-10 py-3.5 font-semibold text-white transition hover:bg-white/5"
                        >
                            Join the Waitlist
                        </a>
                    </div>
                </ScrollReveal>
            </section>

            {/* FOOTER */}
            <footer className="bg-[#0A1220] px-6 py-16 text-white md:px-8">
                <div className="mx-auto grid max-w-screen-xl gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    <div>
                        <p className="bg-gradient-to-r from-primary-container to-primary bg-clip-text text-xl font-bold tracking-tighter text-transparent">
                            Ai.mmobilie
                        </p>
                        <p className="mt-3 font-sans text-sm text-white/70">
                            Lucid Intelligence for Berlin Renters
                        </p>
                        <div className="mt-6 flex gap-4">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-white/60 transition hover:text-primary-container"
                                aria-label="Twitter"
                            >
                                𝕏
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-white/60 transition hover:text-primary-container"
                                aria-label="LinkedIn"
                            >
                                in
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-white/60 transition hover:text-primary-container"
                                aria-label="Instagram"
                            >
                                ◎
                            </a>
                        </div>
                    </div>
                    <div>
                        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary-container">
                            Platform
                        </p>
                        <ul className="mt-4 space-y-2 font-sans text-sm text-white/80">
                            <li>
                                <Link href="/search" className="transition hover:text-primary-container">
                                    Search Listings
                                </Link>
                            </li>
                            <li>
                                <Link href="/intelligence" className="transition hover:text-primary-container">
                                    Market Intelligence
                                </Link>
                            </li>
                            <li>
                                <Link href="/chat" className="transition hover:text-primary-container">
                                    AI Assistant
                                </Link>
                            </li>
                            <li>
                                <Link href="/tracker" className="transition hover:text-primary-container">
                                    Application Tracker
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary-container">
                            Community
                        </p>
                        <ul className="mt-4 space-y-2 font-sans text-sm text-white/80">
                            <li>
                                <a href="#waitlist" className="transition hover:text-primary-container">
                                    Shareholder Benefits
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="/search?source=Genossenschaft"
                                    className="transition hover:text-primary-container"
                                >
                                    Genossenschaft Match
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="transition hover:text-primary-container">
                                    Partner Agencies
                                </a>
                            </li>
                            <li>
                                <a href="#" className="transition hover:text-primary-container">
                                    Refer a Friend
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary-container">
                            Legal
                        </p>
                        <ul className="mt-4 space-y-2 font-sans text-sm text-white/80">
                            <li>
                                <Link href="/privacy" className="transition hover:text-primary-container">
                                    Privacy Policy (DSGVO)
                                </Link>
                            </li>
                            <li>
                                <Link href="/impressum" className="transition hover:text-primary-container">
                                    Impressum
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="transition hover:text-primary-container">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="mailto:hello@ai.mmobilie.de"
                                    className="transition hover:text-primary-container"
                                >
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mx-auto mt-14 max-w-screen-xl border-t border-white/10 pt-8">
                    <p className="text-center font-sans text-xs text-[#64748B]">
                        © 2026 Ai.mmobilie. Built in Berlin with ❤️ for Berlin renters. All listings verified against
                        Mietpreisbremse law.
                    </p>
                </div>
            </footer>
        </main>
    );
}
