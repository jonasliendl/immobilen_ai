import { neighborhoods } from "@/lib/contracts-store";
import { getNeighborhoodMapOverlay } from "@/lib/berlin-open-data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const district = request.nextUrl.searchParams.get("district")?.toLowerCase();

    const filtered = district
        ? neighborhoods.filter((item) => item.district.toLowerCase() === district)
        : neighborhoods;

    const payload = await getNeighborhoodMapOverlay(filtered);

    return NextResponse.json(payload, {
        headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
