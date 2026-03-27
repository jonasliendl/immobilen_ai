import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email =
        typeof body === "object" &&
        body !== null &&
        "email" in body &&
        typeof (body as { email: unknown }).email === "string"
            ? (body as { email: string }).email.trim()
            : "";

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const basic =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!basic) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    console.log("[waitlist]", email);

    return NextResponse.json({ success: true });
}
