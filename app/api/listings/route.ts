import { berlinListings } from "@/lib/data";
import { assessPrice } from "@/lib/scoring";
import { ListingsQuery, ListingsResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const query: ListingsQuery = {
        district: request.nextUrl.searchParams.get("district") ?? undefined,
        source:
            (request.nextUrl.searchParams.get("source") as ListingsQuery["source"]) ??
            undefined,
        maxRent: request.nextUrl.searchParams.get("maxRent")
            ? Number(request.nextUrl.searchParams.get("maxRent"))
            : undefined,
    };

    const district = query.district?.toLowerCase();
    const source = query.source?.toLowerCase();
    const maxRentRaw = request.nextUrl.searchParams.get("maxRent");
    const maxRent = maxRentRaw ? Number(maxRentRaw) : undefined;

    const listings = berlinListings
        .filter((listing) => {
            if (district && listing.district.toLowerCase() !== district) return false;
            if (source && listing.source.toLowerCase() !== source) return false;
            if (maxRent !== undefined && listing.monthlyRentEur > maxRent) return false;
            return true;
        })
        .map((listing) => ({
            ...listing,
            priceAssessment: assessPrice(listing),
        }));

    const payload: ListingsResponse = {
        count: listings.length,
        listings,
    };

    return NextResponse.json(payload);
}
