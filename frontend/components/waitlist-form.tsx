"use client";

import { useState, FormEvent } from "react";

export type WaitlistFormSource = "landing_form" | "qr_landing";

type Props = {
    source?: WaitlistFormSource;
};

export function WaitlistForm({ source = "landing_form" }: Props) {
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        const trimmed = email.trim();
        if (!trimmed) {
            setError("Please enter your email.");
            return;
        }

        setPending(true);
        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: trimmed, source }),
            });
            const data = (await res.json()) as { success?: boolean; error?: string };
            if (!res.ok) {
                setError(data.error ?? "Something went wrong.");
                return;
            }
            // Any 2xx from this route means joined; don't rely on body shape alone.
            setSuccess(true);
        } catch {
            setError("Network error. Try again.");
        } finally {
            setPending(false);
        }
    }

    if (success) {
        return (
            <div className="rounded-2xl bg-primary/5 px-6 py-8 text-center">
                <p className="text-lg font-medium text-primary">
                    ✅ You&apos;re on the list! We&apos;ll be in touch soon.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full rounded-xl border-2 border-primary-container bg-surface px-4 py-3.5 font-sans text-on-background placeholder:text-on-surface/40 outline-none transition focus:border-primary focus:bg-surface-container-lowest"
            />
            <button
                type="submit"
                disabled={pending}
                className="btn-primary-gradient w-full rounded-xl py-4 font-bold text-on-primary shadow-lg transition hover:-translate-y-0.5 hover:shadow-ambient disabled:opacity-60"
            >
                {pending ? "Joining…" : "Join the Waitlist"}
            </button>
            {error && <p className="text-sm text-error">{error}</p>}
            <p className="text-center text-sm text-[#64748B]">
                No spam. No credit card. Unsubscribe anytime.
            </p>
        </form>
    );
}
