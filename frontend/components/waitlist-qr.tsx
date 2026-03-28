import Image from "next/image";

/** Encodes `${NEXT_PUBLIC_APP_URL}/join?via=qr` (see `app/api/waitlist/qr-image`). */
export function WaitlistQr() {
    return (
        <div className="relative mx-auto h-40 w-40">
            <Image
                src="/api/waitlist/qr-image"
                alt="QR code: open Budenfinder waitlist on your phone"
                width={160}
                height={160}
                className="h-40 w-40 rounded-lg bg-white object-contain p-1"
                unoptimized
                priority
            />
        </div>
    );
}
