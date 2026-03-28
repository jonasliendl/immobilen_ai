/** Server-side: Fastify base URL (no trailing slash). */
export function getBackendApiBase(): string {
    const raw = process.env.BACKEND_API_URL ?? "http://localhost:8080";
    return raw.replace(/\/$/, "");
}

/** Public site origin for QR payloads (no trailing slash). */
export function getPublicAppUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (explicit) return explicit.replace(/\/$/, "");
    const vercel = process.env.VERCEL_URL?.trim();
    if (vercel) return `https://${vercel}`.replace(/\/$/, "");
    return "http://localhost:3000";
}

export function getWaitlistQrTargetUrl(): string {
    return `${getPublicAppUrl()}/join?via=qr`;
}
