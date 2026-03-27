import { berlinListings, demoTenant } from "@/lib/data";
import { applications, createApplication } from "@/lib/contracts-store";
import {
    ApplicationsResponse,
    CreateApplicationRequest,
    CreateApplicationResponse,
} from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const tenantId = request.nextUrl.searchParams.get("tenantId");

    const filtered = tenantId
        ? applications.filter((item) => item.tenantId === tenantId)
        : applications;

    const payload: ApplicationsResponse = {
        count: filtered.length,
        applications: filtered,
    };

    return NextResponse.json(payload);
}

export async function POST(request: NextRequest) {
    const body = (await request.json()) as Partial<CreateApplicationRequest>;

    if (!body.listingId) {
        return NextResponse.json(
            { error: "Missing required body field: listingId" },
            { status: 400 },
        );
    }

    const listing = berlinListings.find((item) => item.id === body.listingId);
    if (!listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const created = createApplication({
        tenantId: demoTenant.id ?? "tn-1001",
        listingId: body.listingId,
        landlordId: listing.landlordId,
        documentBundleId: body.documentBundleId,
        coverLetter: body.coverLetter,
    });

    const payload: CreateApplicationResponse = { application: created };
    return NextResponse.json(payload, { status: 201 });
}
