import { ChatRequest, ChatResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = (await request.json()) as Partial<ChatRequest>;
    const message = (body.message ?? "").trim();

    if (!message) {
        return NextResponse.json(
            { error: "Missing required body field: message" },
            { status: 400 },
        );
    }

    const lower = message.toLowerCase();

    let reply =
        "I can help with listing search, tenant scoring, and Genossenschaft matching. Ask me for commute, noise, or application tips.";

    if (lower.includes("genossenschaft")) {
        reply =
            "For Genossenschaften, I check SCHUFA, employment stability, and income-to-rent ratio, then route you to a handoff application link.";
    } else if (lower.includes("cover")) {
        reply =
            "I can generate a personalized cover letter per listing and landlord. Provide a listing id to start.";
    } else if (lower.includes("price") || lower.includes("overpriced")) {
        reply =
            "I compare listing rent against district benchmarks in EUR per m2 and flag overpricing risk with a confidence score.";
    }

    const payload: ChatResponse = {
        reply,
        timestamp: new Date().toISOString(),
    };

    return NextResponse.json(payload);
}
