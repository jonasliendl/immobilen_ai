"use client";

import { usePathname } from "next/navigation";

/**
 * Pushes page content below the fixed nav (h-20). Home (/) keeps full-bleed hero with its own padding.
 */
export function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() ?? "";
    const belowNav = pathname !== "/";

    return (
        <div
            className={
                belowNav
                    ? "flex min-h-0 w-full flex-1 flex-col pt-20"
                    : "flex min-h-0 w-full flex-1 flex-col"
            }
        >
            {children}
        </div>
    );
}
