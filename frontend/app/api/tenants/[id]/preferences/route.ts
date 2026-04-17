import { NextRequest, NextResponse } from "next/server";
import { UpsertPreferencesSchema } from "@/lib/services/tenants.types";
import { getPreferences, upsertPreferences } from "@/lib/services/tenants.service";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    try {
        const prefs = await getPreferences(id);
        if (!prefs) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ data: prefs });
    } catch (error) {
        console.error('GET /api/tenants/[id]/preferences error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = UpsertPreferencesSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    try {
        const prefs = await upsertPreferences(id, parsed.data);
        return NextResponse.json({ data: prefs });
    } catch (error) {
        console.error('PUT /api/tenants/[id]/preferences error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
