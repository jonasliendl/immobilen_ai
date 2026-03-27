import {
    createDocumentBundle,
    documentBundles,
    storedDocuments,
} from "@/lib/contracts-store";
import {
    CreateDocumentBundleRequest,
    CreateDocumentBundleResponse,
    DocumentBundlesResponse,
} from "@/lib/types";
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

export async function POST(request: NextRequest) {
    const body = (await request.json()) as Partial<CreateDocumentBundleRequest>;

    if (!body.tenantId || !body.documentIds || body.documentIds.length === 0) {
        return NextResponse.json(
            {
                error: "Missing required body fields: tenantId, documentIds (non-empty array)",
            },
            { status: 400 },
        );
    }

    const created = createDocumentBundle({
        tenantId: body.tenantId,
        documentIds: body.documentIds,
    });

    const payload: CreateDocumentBundleResponse = { bundle: created };
    return NextResponse.json(payload, { status: 201 });
}
