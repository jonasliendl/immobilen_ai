"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
    const pathname = usePathname();

    const navItems = [
        { href: "/search", label: "Search" },
        { href: "/tracker", label: "Tracker" },
        { href: "/intelligence", label: "Intelligence" },
        { href: "/chat", label: "Chat" },
    ];

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname?.startsWith(href);
    };

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 font-sans text-sm font-medium tracking-tight antialiased shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/80 dark:shadow-none">
            <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-8">
                <Link
                    href="/"
                    className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white"
                    title="Budenfinder home"
                >
                    Budenfinder
                </Link>

                <div className="hidden items-center gap-8 md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                isActive(item.href)
                                    ? "border-b-2 border-primary pb-1 font-semibold text-primary transition-colors dark:text-primary"
                                    : "text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                            }
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="hidden px-5 py-2 font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 md:block"
                    >
                        Sign In
                    </button>
                    <Link
                        href="/search"
                        className="rounded-lg bg-primary px-6 py-2 font-semibold text-on-primary shadow-md shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    const navItems = [
        { href: "/search", label: "Search" },
        { href: "/tracker", label: "Tracker" },
        { href: "/intelligence", label: "Intelligence" },
        { href: "/chat", label: "Chat" },
    ];

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname?.startsWith(href);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 md:hidden" onClick={onClose}>
            <div className="absolute inset-0 bg-hero-dark/40 backdrop-blur-sm" />
            <div
                className="absolute right-0 top-0 h-full w-64 bg-surface-container-lowest p-4 shadow-ambient"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Menu</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-600 hover:bg-surface-container-low dark:text-slate-400"
                    >
                        ✕
                    </button>
                </div>
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                                isActive(item.href)
                                    ? "bg-primary/10 font-semibold text-primary"
                                    : "text-slate-600 hover:bg-surface-container-low dark:text-slate-400"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
