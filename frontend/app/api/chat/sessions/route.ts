import { chatbotSessions } from "@/lib/contracts-store";
import { ChatbotSessionsResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const tenantId = request.nextUrl.searchParams.get("tenantId");

    const sessions = tenantId
        ? chatbotSessions.filter((item) => item.tenantId === tenantId)
        : chatbotSessions;

    const payload: ChatbotSessionsResponse = {
        count: sessions.length,
        sessions,
    };

    return NextResponse.json(payload);
}
