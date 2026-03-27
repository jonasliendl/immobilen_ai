import { createDocument, storedDocuments } from "@/lib/contracts-store";
import {
    CreateDocumentRequest,
    CreateDocumentResponse,
    DocumentsResponse,
} from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const tenantId = request.nextUrl.searchParams.get("tenantId");
    const type = request.nextUrl.searchParams.get("type");

    let filtered = tenantId
        ? storedDocuments.filter((item) => item.tenantId === tenantId)
        : storedDocuments;

    if (type) {
        filtered = filtered.filter((item) => item.type === type);
    }

    const payload: DocumentsResponse = {
        count: filtered.length,
        documents: filtered,
    };

    return NextResponse.json(payload);
}

export async function POST(request: NextRequest) {
    const body = (await request.json()) as Partial<CreateDocumentRequest>;

    if (!body.tenantId || !body.type || !body.fileName) {
        return NextResponse.json(
            {
                error: "Missing required body fields: tenantId, type, fileName",
            },
            { status: 400 },
        );
    }

    const validTypes = [
        "schufa",
        "payslip",
        "id",
        "employment-proof",
        "residence-permit",
        "other",
    ];
    if (!validTypes.includes(body.type)) {
        return NextResponse.json(
            { error: `Invalid document type. Must be one of: ${validTypes.join(", ")}` },
            { status: 400 },
        );
    }

    const created = createDocument({
        tenantId: body.tenantId,
        type: body.type,
        fileName: body.fileName,
    });

    const payload: CreateDocumentResponse = { document: created };
    return NextResponse.json(payload, { status: 201 });
}
