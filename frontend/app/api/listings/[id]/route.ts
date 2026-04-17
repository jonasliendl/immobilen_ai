import { NextRequest, NextResponse } from "next/server";
import { getListingById } from "@/lib/services/listings.service";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    try {
        const listing = await getListingById(id);
        if (!listing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ data: listing });
    } catch (error) {
        console.error('GET /api/listings/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
