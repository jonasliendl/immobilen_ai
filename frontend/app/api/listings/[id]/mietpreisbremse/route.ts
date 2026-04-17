import { NextRequest, NextResponse } from "next/server";
import { getListingById } from "@/lib/services/listings.service";
import { calculateMietpreisbremseAssessment } from "@/lib/services/mietpreisbremse.service";
import { MietpreisbremseQuerySchema } from "@/lib/services/listings.types";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = MietpreisbremseQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    try {
        const listing = await getListingById(id);
        if (!listing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const assessment = calculateMietpreisbremseAssessment(listing, parsed.data);
        if (!assessment) {
            return NextResponse.json(
                { error: 'Insufficient data for Mietpreisbremse assessment' },
                { status: 422 },
            );
        }

        return NextResponse.json({ data: assessment });
    } catch (error) {
        console.error('GET /api/listings/[id]/mietpreisbremse error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
