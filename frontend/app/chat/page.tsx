"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FeaturePageIntro } from "@/components/feature-page-intro";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    suggestions?: string[];
    relatedListing?: {
        id: string;
        title: string;
        rent: number;
    };
};

type Conversation = {
    id: string;
    title: string;
    date: string;
    preview: string;
};

const demoConversations: Conversation[] = [
    { id: "c-1", title: "Apartment hunting tips", date: "Today", preview: "What documents do I need..." },
    { id: "c-2", title: "Genossenschaft questions", date: "Yesterday", preview: "How do I apply for..." },
    { id: "c-3", title: "Rental contract review", date: "Mar 24", preview: "Is this clause normal..." },
];

const quickActions = [
    { icon: "📄", label: "Documents needed", query: "What documents do I need to apply for an apartment in Berlin?" },
    { icon: "💰", label: "Budget advice", query: "How much should I budget for rent in Berlin?" },
    { icon: "🤝", label: "Genossenschaft info", query: "How do Wohnungsgenossenschaften work?" },
    { icon: "📊", label: "Check my score", query: "Analyze my tenant profile and success chances" },
    { icon: "✉️", label: "Write cover letter", query: "Help me write a cover letter for an apartment" },
    { icon: "🔍", label: "Find apartments", query: "Show me available apartments in my preferred districts" },
];

const welcomeTips = [
    {
        icon: "🎯",
        title: "Get personalized advice",
        description: "Share your preferences and budget for tailored recommendations",
    },
    {
        icon: "📋",
        title: "Document checklist",
        description: "Get a complete list of documents needed for your applications",
    },
    {
        icon: "💡",
        title: "Market insights",
        description: "Ask about neighborhood trends, pricing, and availability",
    },
    {
        icon: "🤝",
        title: "Genossenschaft guidance",
        description: "Learn how to apply for housing cooperatives",
    },
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>(demoConversations);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function sendMessage(content: string) {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ message: content }),
            });

            if (!res.ok) {
                throw new Error(`Chat API responded with ${res.status}`);
            }

            const data = (await res.json()) as {
                reply: string;
                provider?: string;
                timestamp: string;
            };

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.reply,
                timestamp: new Date(data.timestamp),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I couldn't reach the AI service right now. Please try again.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }



    function startNewConversation() {
        setMessages([]);
        setSelectedConversation(null);
        setSidebarOpen(false);
    }

    return (
        <div className="flex h-[calc(100dvh-5rem)] min-h-0 w-full max-w-full flex-col overflow-hidden md:flex-row">
            {/* Mobile: drawer under nav. Desktop: column in row with main. */}
            <aside
                className={`fixed bottom-0 left-0 top-20 z-40 flex w-72 shrink-0 flex-col border-r border-black/10 bg-white shadow-lg transition-transform md:relative md:top-auto md:z-auto md:h-full md:translate-x-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                <div className="flex min-h-0 flex-1 flex-col">
                    <div className="border-b border-black/10 p-4">
                        <button
                            onClick={startNewConversation}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:bg-black/80"
                        >
                            <span>+</span>
                            New Chat
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                        <p className="px-2 text-xs font-medium text-black/50">Recent Conversations</p>
                        <div className="mt-2 space-y-1">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => {
                                        setSelectedConversation(conv.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full rounded-lg p-3 text-left transition ${selectedConversation === conv.id
                                        ? "bg-black text-white"
                                        : "hover:bg-black/5"
                                        }`}
                                >
                                    <p className="text-sm font-medium">{conv.title}</p>
                                    <p className={`text-xs ${selectedConversation === conv.id ? "text-white/70" : "text-black/50"}`}>
                                        {conv.date}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-black/10 p-4">
                        <Link
                            href="/tracker"
                            className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-black/5"
                        >
                            <span>📊</span>
                            Application Tracker
                        </Link>
                        <Link
                            href="/search"
                            className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-black/5"
                        >
                            <span>🏠</span>
                            Search Listings
                        </Link>
                        <Link
                            href="/intelligence"
                            className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-black/5"
                        >
                            <span>🧠</span>
                            Market Intelligence
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main: full width on mobile (sidebar is overlay); shares row on md+ */}
            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
                <header className="flex shrink-0 items-center justify-between border-b border-black/10 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="rounded-lg p-2 hover:bg-black/5 md:hidden"
                        >
                            ☰
                        </button>
                        <div>
                            <h1 className="font-semibold">AI Rental Assistant</h1>
                            <p className="text-xs text-black/60">Your guide to finding a home in Berlin</p>
                        </div>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {messages.length === 0 ? (
                        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-8">
                            <FeaturePageIntro
                                eyebrow="AI Assistant"
                                title="Ask anything before you apply"
                                description="This chat connects to the Ai.mmobilie AI stack (Ollama with Hugging Face fallback). Use it to sanity-check Genossenschaft rules, decode contract clauses, rehearse landlord questions, or understand SCHUFA impact — without leaving the platform."
                                howItWorks={[
                                    "Type a question or tap a quick action to seed the conversation.",
                                    "The model answers with Berlin rental context; verify critical legal points with a professional.",
                                    "Use threads alongside Search and Tracker: copy insights into your application notes.",
                                    "Nothing you send here replaces regulated legal advice — it accelerates your research.",
                                ]}
                            />
                            <div className="text-center">
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-black text-4xl text-white">
                                    🤖
                                </div>
                                <h2 className="text-2xl font-bold">Welcome to your Rental Assistant</h2>
                                <p className="mt-2 text-black/60">
                                    I'm here to help you find and secure your perfect home in Berlin
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="w-full">
                                <p className="mb-3 text-sm font-medium text-black/60">Quick actions:</p>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.label}
                                            onClick={() => sendMessage(action.query)}
                                            className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-4 text-left transition hover:border-black hover:shadow-sm"
                                        >
                                            <span className="text-xl">{action.icon}</span>
                                            <span className="text-sm font-medium">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="grid gap-4 md:grid-cols-2">
                                {welcomeTips.map((tip) => (
                                    <div
                                        key={tip.title}
                                        className="rounded-xl border border-black/10 bg-white p-4"
                                    >
                                        <span className="text-2xl">{tip.icon}</span>
                                        <p className="mt-2 font-medium">{tip.title}</p>
                                        <p className="text-sm text-black/60">{tip.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-3xl px-4 py-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`mb-6 flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${message.role === "user"
                                            ? "bg-black text-white"
                                            : "bg-black/10"
                                            }`}
                                    >
                                        {message.role === "user" ? "👤" : "🤖"}
                                    </div>
                                    <div
                                        className={`flex-1 ${message.role === "user" ? "text-right" : ""
                                            }`}
                                    >
                                        <div
                                            className={`inline-block rounded-2xl px-4 py-3 text-sm ${message.role === "user"
                                                ? "bg-black text-white"
                                                : "bg-black/5"
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap text-left">{message.content}</p>
                                        </div>

                                        {message.suggestions && message.suggestions.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {message.suggestions.map((suggestion) => (
                                                    <button
                                                        key={suggestion}
                                                        onClick={() => sendMessage(suggestion)}
                                                        className="rounded-full border border-black/20 bg-white px-3 py-1.5 text-xs font-medium transition hover:bg-black/5"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {message.relatedListing && (
                                            <Link
                                                href={`/listings/${message.relatedListing.id}`}
                                                className="mt-3 flex w-full items-center justify-between rounded-xl border border-black/10 bg-white p-3 transition hover:border-black"
                                            >
                                                <div>
                                                    <p className="font-medium">{message.relatedListing.title}</p>
                                                    <p className="text-sm text-black/60">€{message.relatedListing.rent}/month</p>
                                                </div>
                                                <span className="text-black/40">→</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="mb-6 flex gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/10 text-lg">
                                        🤖
                                    </div>
                                    <div className="flex items-center gap-1 rounded-2xl bg-black/5 px-4 py-3">
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-black/40" />
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-black/40 [animation-delay:0.15s]" />
                                        <div className="h-2 w-2 animate-bounce rounded-full bg-black/40 [animation-delay:0.3s]" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-black/10 bg-white p-4">
                    <div className="mx-auto flex max-w-3xl gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage(input);
                                }
                            }}
                            placeholder="Ask about apartments, applications, documents..."
                            className="flex-1 rounded-xl border border-black/20 px-4 py-3"
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            className="flex items-center justify-center rounded-xl bg-black px-6 font-medium text-white transition hover:bg-black/80 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                    <p className="mt-2 text-center text-xs text-black/50">
                        AI can make mistakes. Verify important information.
                    </p>
                </div>
            </main>
        </div>
    );
}
