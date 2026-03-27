import { rejectionAnalyses } from "@/lib/contracts-store";
import { RejectionAnalysesResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const applicationId = request.nextUrl.searchParams.get("applicationId");

    const analyses = applicationId
        ? rejectionAnalyses.filter((item) => item.applicationId === applicationId)
        : rejectionAnalyses;

    const payload: RejectionAnalysesResponse = {
        count: analyses.length,
        analyses,
    };

    return NextResponse.json(payload);
}
