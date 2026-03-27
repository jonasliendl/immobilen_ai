"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
    const pathname = usePathname();

    const navItems = [
        { href: "/search", label: "Search", icon: "🔍" },
        { href: "/tracker", label: "Tracker", icon: "📊" },
        { href: "/intelligence", label: "Intelligence", icon: "🧠" },
        { href: "/chat", label: "Chat", icon: "💬" },
    ];

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname?.startsWith(href);
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-lg text-white">
                        🏠
                    </span>
                    <span className="font-bold">Immobilen AI</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                                isActive(item.href)
                                    ? "bg-black text-white"
                                    : "text-black/70 hover:bg-black/5"
                            }`}
                        >
                            <span>{item.icon}</span>
                            <span className="hidden lg:inline">{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                    <button className="hidden rounded-xl border border-black/20 px-4 py-2 text-sm font-medium transition hover:bg-black/5 md:block">
                        Sign In
                    </button>
                    <button className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80">
                        Get Started
                    </button>

                    {/* Mobile Menu Button */}
                    <button className="rounded-lg p-2 hover:bg-black/5 md:hidden">
                        ☰
                    </button>
                </div>
            </div>
        </nav>
    );
}

export function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    const navItems = [
        { href: "/search", label: "Search", icon: "🔍" },
        { href: "/tracker", label: "Tracker", icon: "📊" },
        { href: "/intelligence", label: "Intelligence", icon: "🧠" },
        { href: "/chat", label: "Chat", icon: "💬" },
    ];

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname?.startsWith(href);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 md:hidden" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50" />
            <div
                className="absolute right-0 top-0 h-full w-64 bg-white p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between">
                    <span className="font-bold">Menu</span>
                    <button onClick={onClose} className="rounded-lg p-2 hover:bg-black/5">
                        ✕
                    </button>
                </div>
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                isActive(item.href)
                                    ? "bg-black text-white"
                                    : "text-black/70 hover:bg-black/5"
                            }`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
