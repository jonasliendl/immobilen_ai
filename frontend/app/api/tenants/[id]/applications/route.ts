import { NextRequest, NextResponse } from "next/server";
import { CreateApplicationSchema } from "@/lib/services/tenants.types";
import { getApplicationsByTenant, createApplication } from "@/lib/services/tenants.service";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    try {
        const applications = await getApplicationsByTenant(id);
        return NextResponse.json({ data: applications });
    } catch (error) {
        console.error('GET /api/tenants/[id]/applications error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(
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

    const parsed = CreateApplicationSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    try {
        const application = await createApplication(id, parsed.data);
        return NextResponse.json({ data: application }, { status: 201 });
    } catch (error) {
        console.error('POST /api/tenants/[id]/applications error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
