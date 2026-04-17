import { NextResponse } from "next/server";
import { recordQrOpen } from "@/lib/services/waitlist.service";

export async function POST() {
    try {
        await recordQrOpen();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('POST /api/waitlist/qr-open error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
