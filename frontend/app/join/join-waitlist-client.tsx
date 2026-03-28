"use client";

import { WaitlistForm } from "@/components/waitlist-form";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const SESSION_KEY = "budenfinder.waitlist.qr-open";

export function JoinWaitlistClient() {
    const searchParams = useSearchParams();
    const via = searchParams.get("via");
    const didTrackRef = useRef(false);

    useEffect(() => {
        if (via !== "qr" || didTrackRef.current) return;
        if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) return;
        didTrackRef.current = true;
        if (typeof window !== "undefined") {
            sessionStorage.setItem(SESSION_KEY, "1");
        }
        void fetch("/api/waitlist/qr-open", { method: "POST" }).catch(() => {});
    }, [via]);

    const source = via === "qr" ? "qr_landing" : "landing_form";

    return (
        <main className="min-h-[70vh] bg-surface-container-low py-16 md:py-24">
            <div className="mx-auto max-w-lg px-6 md:px-8">
                <p className="text-center font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                    Early Access
                </p>
                <h1 className="mt-4 text-center font-sans text-3xl font-bold text-on-background">
                    Join the waitlist
                </h1>
                <p className="mx-auto mt-4 max-w-md text-center font-sans text-base text-on-background/90">
                    Updates and listing alerts before we go public.
                </p>
                <div className="mt-10 rounded-2xl bg-surface-container-lowest p-8 shadow-ambient">
                    <WaitlistForm source={source} />
                </div>
                <p className="mt-8 text-center font-sans text-sm text-[#64748B]">
                    <Link href="/" className="text-primary underline-offset-4 hover:underline">
                        Back to home
                    </Link>
                </p>
            </div>
        </main>
    );
}
