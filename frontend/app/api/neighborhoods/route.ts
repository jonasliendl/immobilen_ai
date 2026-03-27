import { neighborhoods } from "@/lib/contracts-store";
import { NeighborhoodMetricsResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const district = request.nextUrl.searchParams.get("district")?.toLowerCase();

    const filtered = district
        ? neighborhoods.filter((item) => item.district.toLowerCase() === district)
        : neighborhoods;

    const payload: NeighborhoodMetricsResponse = {
        count: filtered.length,
        neighborhoods: filtered,
    };

    return NextResponse.json(payload);
}
