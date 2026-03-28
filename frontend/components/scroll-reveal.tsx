"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ScrollReveal({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("is-visible");
                    observer.unobserve(el);
                }
            },
            { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`reveal ${className}`.trim()}>
            {children}
        </div>
    );
}
