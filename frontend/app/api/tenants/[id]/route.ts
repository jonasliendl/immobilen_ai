import { NextRequest, NextResponse } from "next/server";
import { UpdateTenantSchema } from "@/lib/services/tenants.types";
import { getTenantById, updateTenant, deleteTenant } from "@/lib/services/tenants.service";
import { Prisma } from "@prisma/client";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    try {
        const tenant = await getTenantById(id);
        if (!tenant) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ data: tenant });
    } catch (error) {
        console.error('GET /api/tenants/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
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

    const parsed = UpdateTenantSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    try {
        const tenant = await updateTenant(id, parsed.data);
        if (!tenant) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ data: tenant });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }
        console.error('PATCH /api/tenants/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    try {
        const deleted = await deleteTenant(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('DELETE /api/tenants/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
