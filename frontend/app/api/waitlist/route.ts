import { getBackendApiBase } from "@/lib/waitlist-config";
import { NextRequest, NextResponse } from "next/server";

const sources = new Set(["landing_form", "qr_landing"]);

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const obj = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const email = typeof obj.email === "string" ? obj.email.trim() : "";
    const sourceRaw = typeof obj.source === "string" ? obj.source : "landing_form";
    const source = sources.has(sourceRaw) ? sourceRaw : "landing_form";

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!basic) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    try {
        const res = await fetch(`${getBackendApiBase()}/api/v1/waitlist`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, source }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: unknown; success?: boolean };
        if (!res.ok) {
            return NextResponse.json(
                { error: typeof data.error === "string" ? data.error : "Upstream error" },
                { status: res.status >= 500 ? 502 : res.status },
            );
        }
        return NextResponse.json({ success: data.success !== false });
    } catch {
        return NextResponse.json({ error: "Waitlist service unavailable" }, { status: 502 });
    }
}
