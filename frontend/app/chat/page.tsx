"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

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

        // Simulate API response
        setTimeout(() => {
            const response = generateResponse(content);
            setMessages((prev) => [...prev, response]);
            setIsLoading(false);
        }, 1000 + Math.random() * 1000);
    }

    function generateResponse(userMessage: string): Message {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes("document")) {
            return {
                id: Date.now().toString(),
                role: "assistant",
                content: `Here's a complete checklist of documents you'll need for apartment applications in Berlin:

**Essential Documents:**
1. **SCHUFA credit report** - Get this from schufa.de (€30-40)
2. **Proof of income** - Last 3 payslips or employment contract
3. **ID/Passport copy** - Valid identification
4. **Mietschuldenfreiheitsbescheinigung** - Proof of no rent arrears from previous landlord
5. **Self-disclosure form** (Selbstauskunft) - Standard rental application form

**Additional (if applicable):**
- Visa/residence permit
- Student enrollment certificate
- Bank statements (last 3 months)
- References from previous landlords

💡 **Pro tip:** Have all documents ready as PDFs before applying. Complete applications get 3x more responses!`,
                timestamp: new Date(),
                suggestions: [
                    "How do I get a SCHUFA report?",
                    "What if I don't have a German bank account?",
                    "Help me write a cover letter",
                ],
            };
        }

        if (lowerMessage.includes("genossenschaft") || lowerMessage.includes("co-op")) {
            return {
                id: Date.now().toString(),
                role: "assistant",
                content: `**Wohnungsgenossenschaften** (housing cooperatives) are a great affordable housing option in Berlin!

**How they work:**
- You become a member by buying shares (€500-2000 typically)
- Pay below-market rent as a member
- Often require waiting lists, but worth it for long-term stability

**Popular Genossenschaften in Berlin:**
1. Berliner Heim eG - 2,000+ units
2. NordWohn eG - Family-friendly options
3. GEHAG - Large portfolio across Berlin
4. Bauverein Lichtenberg - East Berlin focus

**Application tips:**
✅ Apply to multiple co-ops simultaneously
✅ Highlight long-term commitment
✅ Mention family situation if applicable
✅ Be patient - waiting lists can be 6-24 months

Would you like me to help you find available Genossenschaft listings?`,
                timestamp: new Date(),
                suggestions: [
                    "Show me Genossenschaft listings",
                    "How do I check eligibility?",
                    "What are the membership fees?",
                ],
            };
        }

        if (lowerMessage.includes("budget") || lowerMessage.includes("cost") || lowerMessage.includes("price")) {
            return {
                id: Date.now().toString(),
                role: "assistant",
                content: `**Berlin Rent Budget Guide 2026:**

**By household size:**
- Studio (1 person): €800-1,200 warm
- 1-2 bedroom (1-2 people): €1,200-1,800 warm
- Family apartment (3+ people): €1,500-2,500+ warm

**By district (avg. cold rent/m²):**
- Expensive: Mitte (€18+), Prenzlauer Berg (€16+)
- Mid-range: Friedrichshain (€14), Neukölln (€13)
- Affordable: Lichtenberg (€11), Marzahn (€9)

**Rule of thumb:**
Your net income should be 3x the cold rent. Landlords typically require this ratio.

**Additional costs to budget:**
- Internet: €30-50/month
- Electricity: €40-80/month (often not included)
- GEZ broadcasting fee: €18.36/month (mandatory)

Want me to analyze specific listings for fair pricing?`,
                timestamp: new Date(),
                suggestions: [
                    "Analyze a listing for me",
                    "Show affordable districts",
                    "Calculate my budget",
                ],
            };
        }

        if (lowerMessage.includes("cover letter") || lowerMessage.includes("anschreiben")) {
            return {
                id: Date.now().toString(),
                role: "assistant",
                content: `I can help you write a compelling cover letter! Here's a template:

---

**Betreff: Wohnungsbewerbung - [Address/Listing ID]**

Sehr geehrte(r) Frau/Herr [Landlord Name],

mit großem Interesse habe ich Ihr Wohnungsangebot gelesen und bewerbe mich hiermit um die Wohnung in der [Address].

**Über mich:**
- Name: [Your name]
- Beruf: [Your occupation] bei [Employer]
- Nettoeinkommen: €[X]/Monat
- Einzugsdatum: [Date]

Ich bin ein ruhiger, zuverlässiger Mieter und suche eine langfristige Wohnung. Meine SCHUFA-Auskunft und Gehaltsnachweise liegen vor.

Über eine Besichtigungstermin würde ich mich sehr freuen.

Mit freundlichen Grüßen,
[Your name]
[Phone]
[Email]

---

💡 **Tips:**
- Keep it concise (under 200 words)
- Highlight stable income and long-term intent
- Mention if you have all documents ready
- Write in German unless listing is in English

Want me to generate a personalized letter based on your profile?`,
                timestamp: new Date(),
                suggestions: [
                    "Generate personalized letter",
                    "Review my draft",
                    "Translate to German",
                ],
            };
        }

        if (lowerMessage.includes("score") || lowerMessage.includes("profile") || lowerMessage.includes("chance")) {
            return {
                id: Date.now().toString(),
                role: "assistant",
                content: `Let me analyze your tenant profile and success chances!

**Your Profile Summary:**
- Income stability: ⭐⭐⭐⭐⭐ (€3,600/month, 28 months employed)
- Documents: ⭐⭐⭐⭐ (SCHUFA available, need to upload more)
- Household fit: ⭐⭐⭐⭐ (2 people, no pets)
- District preferences: Good match with current budget

**Overall Tenant Score: 78/100** 🎯

**Success probability by listing type:**
- Regular private listings: 65-75%
- Genossenschaft: 45-55% (competitive)
- Below-market rent: 30-40% (high competition)

**To improve your chances:**
1. Upload all documents (proof of income, ID, references)
2. Apply within 2 hours of listing posted
3. Write personalized cover letters
4. Consider Genossenschaft applications now

Want me to analyze a specific listing?`,
                timestamp: new Date(),
                relatedListing: {
                    id: "l-1001",
                    title: "Bright 2-room in Prenzlauer Berg",
                    rent: 1280,
                },
                suggestions: [
                    "Analyze listing l-1001",
                    "Show my application tracker",
                    "What documents should I upload?",
                ],
            };
        }

        // Default response
        return {
            id: Date.now().toString(),
            role: "assistant",
            content: `I'm your Berlin rental assistant! I can help you with:

🏠 **Finding apartments** - Search and filter listings
📊 **Analyzing listings** - Price checks and success probability
✉️ **Applications** - Cover letters and document prep
🤝 **Genossenschaften** - Co-op applications and eligibility
📈 **Market insights** - Trends and neighborhood info
💬 **Q&A** - Any rental-related questions

**Quick start:**
- Ask me about documents you need
- Request help with a cover letter
- Get budget advice for your search
- Learn about Genossenschaften

What would you like to know?`,
            timestamp: new Date(),
            suggestions: [
                "What documents do I need?",
                "Help me write a cover letter",
                "How much should I budget?",
                "Tell me about Genossenschaften",
            ],
        };
    }

    function startNewConversation() {
        setMessages([]);
        setSelectedConversation(null);
        setSidebarOpen(false);
    }

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-black/10 bg-white transition-transform md:relative md:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
                <div className="flex h-full flex-col">
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
                                    className={`w-full rounded-lg p-3 text-left transition ${
                                        selectedConversation === conv.id
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

            {/* Main Chat Area */}
            <main className="flex flex-1 flex-col">
                {/* Chat Header */}
                <header className="flex items-center justify-between border-b border-black/10 bg-white p-4">
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

                {/* Messages */}
                <div className="flex-1 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 px-4 py-12">
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
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                                            message.role === "user"
                                                ? "bg-black text-white"
                                                : "bg-black/10"
                                        }`}
                                    >
                                        {message.role === "user" ? "👤" : "🤖"}
                                    </div>
                                    <div
                                        className={`flex-1 ${
                                            message.role === "user" ? "text-right" : ""
                                        }`}
                                    >
                                        <div
                                            className={`inline-block rounded-2xl px-4 py-3 text-sm ${
                                                message.role === "user"
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

                {/* Input Area */}
                <div className="border-t border-black/10 bg-white p-4">
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
