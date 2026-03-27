import { berlinListings, demoTenant } from "@/lib/data";
import { matchGenossenschaft } from "@/lib/scoring";
import { NextResponse } from "next/server";

export async function GET() {
    const matches = berlinListings
        .filter((listing) => listing.source === "genossenschaft")
        .map((listing) => ({
            listing,
            match: matchGenossenschaft(demoTenant, listing),
        }));

    return NextResponse.json({
        tenant: demoTenant,
        matches,
    });
}
