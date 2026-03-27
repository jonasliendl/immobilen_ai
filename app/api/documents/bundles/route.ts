import { documentBundles, storedDocuments } from "@/lib/contracts-store";
import { DocumentBundlesResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const tenantId = request.nextUrl.searchParams.get("tenantId");

    const bundles = tenantId
        ? documentBundles.filter((item) => item.tenantId === tenantId)
        : documentBundles;

    const documents = tenantId
        ? storedDocuments.filter((item) => item.tenantId === tenantId)
        : storedDocuments;

    const payload: DocumentBundlesResponse = {
        count: bundles.length,
        bundles,
        documents,
    };

    return NextResponse.json(payload);
}
