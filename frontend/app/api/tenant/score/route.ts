import { berlinListings, demoTenant } from "@/lib/data";
import {
    calculateTenantScore,
    estimateSuccessProbability,
    matchGenossenschaft,
} from "@/lib/scoring";
import { TenantScoreResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const listingId = request.nextUrl.searchParams.get("listingId");

    if (!listingId) {
        return NextResponse.json(
            { error: "Missing required query parameter: listingId" },
            { status: 400 },
        );
    }

    const listing = berlinListings.find((item) => item.id === listingId);

    if (!listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const tenantScore = calculateTenantScore(demoTenant, listing);
    const success = estimateSuccessProbability(tenantScore, listing);
    const genossenschaftMatch = matchGenossenschaft(demoTenant, listing);

    const payload: TenantScoreResponse = {
        tenant: demoTenant,
        listing,
        tenantScore,
        success,
        genossenschaftMatch,
    };

    return NextResponse.json(payload);
}
