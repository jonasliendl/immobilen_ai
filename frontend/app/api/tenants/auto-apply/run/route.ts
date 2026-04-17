import { NextRequest, NextResponse } from "next/server";
import { RunAutoApplyBatchSchema } from "@/lib/services/tenants.types";
import { runAutoApplyForEnabledTenants } from "@/lib/services/applicator.service";

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    const parsed = RunAutoApplyBatchSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    try {
        const result = await runAutoApplyForEnabledTenants(parsed.data);
        return NextResponse.json({ data: result });
    } catch (error) {
        console.error('POST /api/tenants/auto-apply/run error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
