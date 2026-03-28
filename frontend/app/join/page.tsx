import { Suspense } from "react";
import { JoinWaitlistClient } from "./join-waitlist-client";

export default function JoinPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-[70vh] bg-surface-container-low py-16 md:py-24">
                    <div className="mx-auto max-w-lg px-6 text-center font-sans text-on-background/70">Loading…</div>
                </main>
            }
        >
            <JoinWaitlistClient />
        </Suspense>
    );
}
