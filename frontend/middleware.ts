import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_ENABLED = process.env.NEXT_PUBLIC_APP_ENABLED === "true";

// Paths that are always accessible (landing page + static assets)
const PUBLIC_PATHS = ["/", "/api/waitlist", "/leave-waitlist"];

export function middleware(request: NextRequest) {
    if (APP_ENABLED) return NextResponse.next();

    const { pathname } = request.nextUrl;

    // Allow Next.js internals and static files
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/images") ||
        pathname.startsWith("/fonts") ||
        PUBLIC_PATHS.includes(pathname)
    ) {
        return NextResponse.next();
    }

    // Redirect everything else to the landing page
    return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
