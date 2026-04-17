import { NextResponse } from "next/server";
import { syncAllVerdicts } from "@/lib/services/mietpreisbremse-sync.service";

export async function POST() {
    try {
        const result = await syncAllVerdicts();
        return NextResponse.json({ data: result });
    } catch (error) {
        console.error('POST /api/listings/mietpreisbremse/sync error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
