"use client";

/**
 * Pushes all page content below the fixed nav (h-20 = 5rem), including the home hero title block.
 */
export function MainContent({ children }: { children: React.ReactNode }) {
    return <div className="flex min-h-0 w-full flex-1 flex-col pt-20">{children}</div>;
}
