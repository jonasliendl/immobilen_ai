"use client";

type FeaturePageIntroProps = {
    eyebrow: string;
    title: string;
    description: string;
    howItWorks: string[];
    videoTitle?: string;
};

export function FeaturePageIntro({
    eyebrow,
    title,
    description,
    howItWorks,
    videoTitle = "Walkthrough video",
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
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-on-background/70">
                    {videoTitle}
                </p>
                <div
                    className="mt-3 flex aspect-video w-full max-w-3xl items-center justify-center rounded-2xl bg-hero-dark"
                    role="img"
                    aria-label="Walkthrough video placeholder"
                >
                    <div className="px-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                            <span className="material-symbols-outlined text-[40px]">play_circle</span>
                        </div>
                        <p className="mt-4 font-sans text-sm font-semibold text-white">Video walkthrough coming soon</p>
                        <p className="mt-1 font-sans text-xs text-white/65">
                            A short screen recording will go here so you can see this feature end-to-end.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
