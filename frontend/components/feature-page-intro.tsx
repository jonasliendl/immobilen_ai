"use client";

import React from "react";

type FeaturePageIntroProps = {
    eyebrow: string;
    title: string;
    description: string;
    howItWorks: string[];
    videoTitle?: string;
};

// Sub-component for rendering the customized animations based on category
const AnimatedVisual = ({ type }: { type: string }) => {
    return (
        <div className="relative flex aspect-video w-full max-w-3xl items-center justify-center overflow-hidden rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-inner">
            <style>{`
                @keyframes pulse-bar {
                    0%, 100% { transform: scaleY(0.4); }
                    50% { transform: scaleY(1); }
                }
                @keyframes msg-float {
                    0% { transform: translateY(10px); opacity: 0; }
                    15% { transform: translateY(0); opacity: 1; }
                    80% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-10px); opacity: 0; }
                }
                @keyframes dot-blink {
                    0%, 100% { opacity: 0.2; }
                    20% { opacity: 1; }
                }
                @keyframes card-slide {
                    0%, 10% { transform: translateX(0); }
                    40%, 60% { transform: translateX(110%); }
                    90%, 100% { transform: translateX(220%); }
                }
                @keyframes grid-fade {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>

            <div className="absolute inset-0 bg-hero-dark opacity-10"></div>

            {type === "Search" && (
                <div className="z-10 flex w-full max-w-sm flex-col gap-4 p-4">
                    <div className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container p-3 shadow-sm">
                        <div className="h-4 w-24 animate-pulse rounded bg-on-surface/20"></div>
                        <div className="h-6 w-12 rounded-full bg-primary/80"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="flex h-24 flex-col items-start justify-end rounded-xl border border-outline-variant/20 bg-surface px-3 py-3 shadow-sm"
                                style={{ animation: `grid-fade ${2 + i * 0.5}s infinite alternate` }}
                            >
                                <div className="mb-2 h-24 w-full rounded bg-surface-high"></div>
                                <div className="mb-1.5 h-2 w-1/2 rounded bg-on-surface/30"></div>
                                <div className="h-2 w-3/4 rounded bg-primary/40"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {type === "Market Intelligence" && (
                <div className="z-10 flex h-full w-full items-end justify-center gap-2 pb-8">
                    {/* Glowing heatmap orbs behind charts */}
                    <div className="absolute left-1/4 top-1/4 h-32 w-32 animate-pulse rounded-full bg-error/20 blur-[40px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 h-40 w-40 animate-pulse rounded-full bg-primary/20 blur-[50px]" style={{ animationDelay: "1s" }}></div>

                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div
                            key={i}
                            className="w-8 origin-bottom rounded-t-md bg-secondary/80 shadow-[0_0_15px_rgba(var(--color-secondary),0.3)]"
                            style={{
                                height: `${30 + (i % 3) * 20}%`,
                                animation: `pulse-bar ${1.5 + (i % 4) * 0.3}s infinite ease-in-out alternate`
                            }}
                        ></div>
                    ))}
                </div>
            )}

            {type === "AI Assistant" && (
                <div className="z-10 flex w-full max-w-sm flex-col gap-5 p-4">
                    <div className="self-end rounded-2xl rounded-tr-sm bg-primary/30 p-4 shadow-sm" style={{ animation: "msg-float 4s infinite" }}>
                        <div className="mb-2 h-2 w-32 rounded bg-primary/70"></div>
                        <div className="h-2 w-48 rounded bg-primary/40"></div>
                    </div>
                    <div className="flex self-start gap-1 rounded-2xl rounded-tl-sm border border-outline-variant/20 bg-surface-container p-4 shadow-sm" style={{ animation: "msg-float 4s infinite 1.5s both" }}>
                        <div className="h-2 w-2 rounded-full bg-on-surface/40" style={{ animation: "dot-blink 1.4s infinite 0s" }}></div>
                        <div className="h-2 w-2 rounded-full bg-on-surface/40" style={{ animation: "dot-blink 1.4s infinite 0.2s" }}></div>
                        <div className="h-2 w-2 rounded-full bg-on-surface/40" style={{ animation: "dot-blink 1.4s infinite 0.4s" }}></div>
                    </div>
                </div>
            )}

            {type === "Application Tracker" && (
                <div className="z-10 flex h-48 w-full max-w-sm justify-between gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-md relative">
                    <div className="flex flex-1 flex-col gap-2 rounded-xl bg-surface-container/50 p-2">
                        <div className="h-2 w-10 text-xs font-bold uppercase text-on-surface/50">SUB</div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 rounded-xl bg-surface-container/50 p-2">
                        <div className="h-2 w-12 text-xs font-bold uppercase text-on-surface/50">SHORT</div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 rounded-xl bg-surface-container/50 p-2">
                        <div className="h-2 w-10 text-xs font-bold uppercase text-on-surface/50">VIEW</div>
                    </div>

                    {/* Sliding Card */}
                    <div
                        className="absolute left-4 top-10 flex h-16 w-24 flex-col justify-center gap-1.5 rounded-lg border border-primary/30 bg-surface px-2 shadow-lg"
                        style={{ animation: "card-slide 6s infinite ease-in-out" }}
                    >
                        <div className="h-1.5 w-1/2 rounded bg-primary"></div>
                        <div className="flex gap-1">
                            <div className="h-3 w-3 rounded-sm bg-success/40"></div>
                            <div className="h-3 w-3 rounded-sm bg-secondary/40"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fallback pattern for unknowns */}
            {!["Search", "Market Intelligence", "AI Assistant", "Application Tracker"].includes(type) && (
                <div className="flex flex-col items-center gap-4 text-on-surface/50">
                    <span className="material-symbols-outlined text-[40px] animate-pulse">auto_awesome</span>
                    <p className="font-mono text-sm uppercase tracking-wider text-on-surface/40">Interactive Demo</p>
                </div>
            )}
        </div>
    );
};

export function FeaturePageIntro({
    eyebrow,
    title,
    description,
    howItWorks,
    videoTitle = "Feature preview",
}: FeaturePageIntroProps) {
    return (
        <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-ambient md:p-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
            <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-on-background md:text-3xl">
                {title}
            </h1>
            <p className="mt-3 max-w-3xl font-sans text-sm leading-relaxed text-on-surface/90 md:text-base">
                {description}
            </p>
            <div className="mt-6 rounded-2xl bg-surface-container-low px-5 py-5">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-secondary">
                    How it works
                </p>
                <ol className="mt-3 list-decimal space-y-2.5 pl-5 font-sans text-sm leading-relaxed text-on-background">
                    {howItWorks.map((line) => (
                        <li key={line}>{line}</li>
                    ))}
                </ol>
            </div>
            <div className="mt-8">
                <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-on-background/70">
                    {videoTitle}
                </p>
                <AnimatedVisual type={eyebrow} />
            </div>
        </section>
    );
}
