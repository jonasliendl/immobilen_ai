import { getWaitlistQrTargetUrl } from "@/lib/waitlist-config";
import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET() {
    const url = getWaitlistQrTargetUrl();
    try {
        const png = await QRCode.toBuffer(url, {
            type: "png",
            width: 240,
            margin: 2,
            errorCorrectionLevel: "M",
            color: { dark: "#0f172a", light: "#ffffff" },
        });
        return new NextResponse(new Uint8Array(png), {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=300, s-maxage=300",
            },
        });
    } catch {
        return NextResponse.json({ error: "Could not generate QR" }, { status: 500 });
    }
}
