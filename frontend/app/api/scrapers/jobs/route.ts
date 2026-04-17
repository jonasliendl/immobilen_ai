import { NextResponse } from "next/server";
import { getDbRo } from "@/lib/db-ro";

export async function GET() {
    try {
        const db = getDbRo();
        const jobs = await db.scraperJob.findMany({
            orderBy: { startedAt: 'desc' },
            take: 50,
        });
        return NextResponse.json({ data: jobs });
    } catch (error) {
        console.error('GET /api/scrapers/jobs error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
