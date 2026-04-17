import { NextRequest, NextResponse } from "next/server";
import { CreateTenantSchema } from "@/lib/services/tenants.types";
import { createTenant } from "@/lib/services/tenants.service";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = CreateTenantSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    try {
        const tenant = await createTenant(parsed.data);
        return NextResponse.json({ data: tenant }, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }
        console.error('POST /api/tenants error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
