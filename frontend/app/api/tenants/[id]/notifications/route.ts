import { NextRequest, NextResponse } from "next/server";
import { getNotificationsByTenant } from "@/lib/services/notifications.service";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    try {
        const notifications = await getNotificationsByTenant(id);
        return NextResponse.json({ data: notifications });
    } catch (error) {
        console.error('GET /api/tenants/[id]/notifications error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
