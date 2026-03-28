import { getBackendApiBase } from "@/lib/waitlist-config";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const res = await fetch(`${getBackendApiBase()}/api/v1/waitlist/qr-open`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: "{}",
        });
        const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (!res.ok) {
            return NextResponse.json(
                { error: typeof data.error === "string" ? data.error : "Upstream error" },
                { status: res.status >= 500 ? 502 : res.status },
            );
        }
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Waitlist service unavailable" }, { status: 502 });
    }
}
