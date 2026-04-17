import { NextRequest, NextResponse } from "next/server";
import { ListingsQuerySchema } from "@/lib/services/listings.types";
import { getListings } from "@/lib/services/listings.service";

export async function GET(request: NextRequest) {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = ListingsQuerySchema.safeParse(params);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    try {
        const result = await getListings(parsed.data);
        return NextResponse.json(result);
    } catch (error) {
        console.error('GET /api/listings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
