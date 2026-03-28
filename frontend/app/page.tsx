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
        text: "Budenfinder pulls listings from every major Berlin platform, deduplicates them, and prioritises affordable, member-aligned homes. Tell us your Genossenschaft (Wohnungsgenossenschaft) and share tier — we weight offers that fit cooperative rules and your budget.",
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
            "I found my Berlin apartment in 4 days. As a non-German speaker I was terrified of scams — Budenfinder made the whole process feel safe and simple.",
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
        bio: "Architecture, AI/ML hooks, and data pipelines that power Budenfinder.",
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
            {/* SECTION 1 — HERO (starts below fixed nav via MainContent pt-20; extra inner padding for title) */}
            <header className="relative flex min-h-[calc(100dvh-5rem)] flex-col overflow-hidden bg-hero-dark text-white">
                <div className="cube-texture-dark pointer-events-none absolute inset-0 z-0" aria-hidden />
                <div
                    className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tr from-primary/10 via-transparent to-white/5"
                    aria-hidden
                />

                <ScrollReveal className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pt-8 text-center md:px-8 md:pt-14">
                    <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/5 px-3 py-1 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary-container backdrop-blur-md">
                        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary" aria-hidden />
                        Berlin · AI-Powered Rental Intelligence
                    </div>
                    <h1 className="mt-6 font-sans text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                        Find Your Berlin Apartment.
                        <br />
                        Before Anyone Else Does.
                    </h1>
                    <p className="mx-auto mt-8 max-w-lg font-sans text-base font-light leading-relaxed text-slate-300 md:mt-10 md:text-lg">
                        Budenfinder finds fair, affordable Berlin homes for Genossenschaft members — one feed,
                        smart applications, and chat before you apply.
                    </p>
                    <div className="mt-12 flex w-full max-w-md flex-col items-stretch justify-center gap-5 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center md:mt-14 md:gap-6">
                        <Link
                            href="/search"
                            className="btn-primary-gradient inline-flex min-h-[52px] w-full min-w-[14rem] items-center justify-center rounded-xl px-8 py-3.5 text-center font-bold text-on-primary shadow-lg transition hover:-translate-y-0.5 sm:w-auto"
                        >
                            Start Searching
                        </Link>
                        <a
                            href="#waitlist"
                            className="inline-flex min-h-[52px] w-full min-w-[14rem] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-center font-medium text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto"
                        >
                            Join the Waitlist →
                        </a>
                    </div>
                </ScrollReveal>

                <div className="relative z-10 mx-auto mt-auto flex w-full max-w-4xl flex-col items-center px-6 pb-10 pt-6 md:px-8 md:pb-14 md:pt-10">
                    <ScrollReveal className="w-full">
                        <div className="glass-box rounded-2xl border border-white/10 px-5 py-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] md:px-10 md:py-8">
                            <p className="mb-4 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-container/90 md:mb-5 md:text-xs">
                                Why renters choose us
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 md:gap-x-4 md:gap-y-4">
                                {[
                                    "🏠 10,000+ Listings Daily",
                                    "✅ Mietpreisbremse Verified",
                                    "🚨 Scam-Free Filtered",
                                    "🌐 English & German",
                                ].map((pill, idx, arr) => (
                                    <Fragment key={pill}>
                                        <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/95 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/15 md:text-sm">
                                            {pill}
                                        </span>
                                        {idx < arr.length - 1 ? (
                                            <span
                                                className="hidden text-white/25 sm:inline md:text-lg"
                                                aria-hidden="true"
                                            >
                                                ·
                                            </span>
                                        ) : null}
                                    </Fragment>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </header>

            {/* SECTION 2+3 — PROBLEM → SOLUTION (stitch_aimmobilie_landing_page_black_white) */}
            <section className="brand-gradient relative overflow-visible py-24 md:py-48">
                <div className="cube-texture pointer-events-none absolute inset-0 z-0" aria-hidden />
                <ScrollReveal className="relative z-10 mx-auto max-w-screen-xl px-6 md:px-8">
                    <div className="mx-auto mb-12 max-w-5xl rounded-[2rem] bg-white p-10 shadow-floating transition-transform duration-500 hover:scale-[1.01] md:mb-20 md:-mt-16 md:p-16 lg:-mt-24">
                        <div className="max-w-3xl">
                            <p className="mb-6 font-sans text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
                                The Problem
                            </p>
                            <h2 className="mb-8 font-sans text-3xl font-extrabold leading-tight tracking-tight text-on-background md:text-4xl lg:text-5xl">
                                Berlin&apos;s rental market is broken.
                            </h2>
                            <p className="mb-12 font-sans text-lg font-light leading-relaxed text-muted">
                                Especially for{" "}
                                <strong className="font-semibold text-on-background">Genossenschaft shareholders</strong>
                                — affordable member flats hide across ten portals while scams and illegal rents crowd
                                the feed.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {problemStats.map((c) => (
                                <div
                                    key={c.label}
                                    className="group rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center transition-all hover:bg-white hover:shadow-lg md:p-8"
                                >
                                    <span className="font-mono text-2xl font-semibold text-slate-800 md:text-3xl">
                                        {c.num}
                                    </span>
                                    <p className="mt-3 font-sans text-sm font-bold text-on-background">{c.label}</p>
                                    <p className="mt-2 font-sans text-xs font-light leading-relaxed text-muted">
                                        {c.sub}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-10 shadow-floating transition-transform duration-500 hover:scale-[1.01] md:p-16">
                        <div className="mb-12 max-w-2xl">
                            <p className="mb-6 font-sans text-sm font-bold uppercase tracking-[0.3em] text-primary">
                                The Solution
                            </p>
                            <h2 className="font-sans text-3xl font-extrabold leading-tight tracking-tight text-on-background md:text-4xl lg:text-5xl">
                                One platform. Every listing. Zero guesswork.
                            </h2>
                        </div>
                        <p className="mb-10 max-w-2xl font-sans text-lg font-light leading-relaxed text-muted">
                            Budenfinder is the <strong className="font-semibold text-on-background">AI layer</strong> for
                            cooperative members: it pulls ads from across Berlin, surfaces the{" "}
                            <strong className="font-semibold text-on-background">cheapest legal rents</strong> that match
                            your shares and filters, and saves hours every week — via the{" "}
                            <strong className="font-semibold text-on-background">tracker</strong> and{" "}
                            <strong className="font-semibold text-on-background">chat</strong> before a landlord opens
                            your folder.
                        </p>
                        <div className="grid gap-6 md:grid-cols-3">
                            {solutionCards.map((c) => (
                                <div
                                    key={c.title}
                                    className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-8 transition-shadow hover:shadow-lg"
                                >
                                    <div
                                        className={`pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-[60px] ${c.color === "text-secondary" ? "bg-secondary/10" : "bg-primary/10"}`}
                                        aria-hidden
                                    />
                                    <div className="relative z-10">
                                        <span className={`material-symbols-outlined text-[32px] ${c.color}`}>
                                            {c.icon}
                                        </span>
                                        <p className="mt-4 font-mono text-xl font-semibold text-primary md:text-2xl">
                                            {c.stat}
                                        </p>
                                        <h3 className="mt-2 font-sans text-lg font-semibold text-on-background">
                                            {c.title}
                                        </h3>
                                        <p className="mt-3 font-sans text-sm font-light leading-relaxed text-muted">
                                            {c.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* SECTION 4 — WHO WE SERVE */}
            <section className="relative overflow-hidden bg-white py-20 md:py-32">
                <div
                    className="cube-texture pointer-events-none absolute inset-0 z-0 [opacity:0.03]"
                    aria-hidden
                />
                <ScrollReveal className="relative z-10 mx-auto max-w-screen-xl px-6 md:px-8">
                    <p className="font-sans text-sm font-bold uppercase tracking-[0.3em] text-slate-400">
                        Who We Serve
                    </p>
                    <h2 className="mt-4 font-sans text-3xl font-bold text-on-background md:text-4xl">
                        Cooperative members & affordable-housing seekers.
                    </h2>
                    <p className="mt-4 max-w-3xl font-sans text-base leading-relaxed text-on-surface/85">
                        Budenfinder is built for people with{" "}
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
                        We have lived the Berlin rental nightmare firsthand. Budenfinder exists because we could not
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

            {/* SECTION 11 — FINAL CTA (stitch_aimmobilie_landing_page_black_white closing band) */}
            <section className="relative overflow-hidden bg-hero-dark py-20 md:py-32">
                <div className="cube-texture-dark pointer-events-none absolute inset-0 z-0" aria-hidden />
                <div
                    className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent to-primary/5"
                    aria-hidden
                />
                <ScrollReveal className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-8">
                    <div className="glass-box rounded-[2rem] border-white/10 p-10 md:rounded-[3rem] md:p-16 lg:p-24">
                        <h2 className="font-sans text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                            Your Berlin Apartment Is Waiting.
                        </h2>
                        <p className="mx-auto mt-6 max-w-2xl font-sans text-lg font-light leading-relaxed text-slate-300 md:text-xl">
                            Stop scrolling 10 portals. Let AI do the work.
                        </p>
                        <div className="mt-12 flex w-full max-w-md flex-col items-stretch justify-center gap-6 sm:mx-auto sm:max-w-none sm:flex-row sm:items-center md:mt-12">
                            <Link
                                href="/search"
                                className="btn-primary-gradient inline-flex min-h-[52px] w-full min-w-[14rem] items-center justify-center rounded-2xl px-10 py-4 text-lg font-bold text-on-primary shadow-2xl transition hover:-translate-y-0.5 sm:w-auto"
                            >
                                Start Searching
                            </Link>
                            <a
                                href="#waitlist"
                                className="inline-flex min-h-[52px] w-full min-w-[14rem] items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-10 py-4 text-lg font-bold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto"
                            >
                                Join the Waitlist
                            </a>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* FOOTER — stitch_aimmobilie_landing_page_black_white */}
            <footer className="w-full border-t border-slate-100 bg-white px-6 py-16 font-sans text-xs font-medium uppercase tracking-widest text-slate-500 dark:border-slate-800 dark:bg-slate-950 md:px-8">
                <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-8 md:grid-cols-2 lg:flex lg:justify-between">
                    <div className="text-lg font-black normal-case tracking-tighter text-slate-900 dark:text-white">
                        Budenfinder
                    </div>
                    <div className="flex max-w-3xl flex-wrap gap-x-10 gap-y-3 normal-case tracking-normal">
                        <Link
                            href="/search"
                            className="transition-colors hover:text-primary hover:underline hover:decoration-primary hover:underline-offset-4"
                        >
                            Search
                        </Link>
                        <Link
                            href="/tracker"
                            className="transition-colors hover:text-primary hover:underline hover:decoration-primary hover:underline-offset-4"
                        >
                            Tracker
                        </Link>
                        <Link
                            href="/intelligence"
                            className="transition-colors hover:text-primary hover:underline hover:decoration-primary hover:underline-offset-4"
                        >
                            Intelligence
                        </Link>
                        <Link
                            href="/chat"
                            className="transition-colors hover:text-primary hover:underline hover:decoration-primary hover:underline-offset-4"
                        >
                            Chat
                        </Link>
                        <Link
                            href="/privacy"
                            className="transition-colors hover:text-primary hover:underline hover:decoration-primary hover:underline-offset-4"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="transition-colors hover:text-primary hover:underline hover:decoration-primary hover:underline-offset-4"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/impressum"
                            className="transition-colors hover:text-primary hover:underline hover:decoration-primary hover:underline-offset-4"
                        >
                            Impressum
                        </Link>
                        <a
                            href="mailto:hello@budenfinder.de"
                            className="transition-colors hover:text-primary hover:underline hover:decoration-primary hover:underline-offset-4"
                        >
                            Contact
                        </a>
                    </div>
                    <div className="normal-case tracking-normal text-slate-500 dark:text-slate-500">
                        © 2026 Budenfinder. Berlin rental search, simplified.
                    </div>
                </div>
                <div className="mx-auto mt-10 max-w-screen-2xl border-t border-slate-100 pt-8 dark:border-slate-800">
                    <p className="text-center font-sans text-xs font-normal normal-case tracking-normal text-slate-500">
                        Search · Tracker · Intelligence · Chat — Mietpreisbremse-aware listings.
                    </p>
                </div>
            </footer>
        </main>
    );
}
