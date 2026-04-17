import { NextRequest, NextResponse } from "next/server";
import { getWaitlistStats } from "@/lib/services/waitlist.service";

const ADMIN_SECRET = process.env.WAITLIST_ADMIN_SECRET;

export async function GET(request: NextRequest) {
    if (!ADMIN_SECRET) {
        return NextResponse.json({ error: 'Not configured' }, { status: 404 });
    }

    const providedSecret = request.headers.get('x-waitlist-admin-secret');
    if (providedSecret !== ADMIN_SECRET) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const stats = await getWaitlistStats();
        return NextResponse.json({ data: stats });
    } catch (error) {
        console.error('GET /api/waitlist/stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
