import { NextRequest, NextResponse } from "next/server";
import { RunAutoApplySchema } from "@/lib/services/tenants.types";
import { runAutoApplyForTenant } from "@/lib/services/applicator.service";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    const parsed = RunAutoApplySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    try {
        const result = await runAutoApplyForTenant(id, parsed.data);
        if (!result) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        return NextResponse.json({ data: result });
    } catch (error) {
        console.error('POST /api/tenants/[id]/auto-apply/run error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
