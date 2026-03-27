import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { getOllamaModel } from "@/lib/ollama";
import { ChatRequest, ChatResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

const requestedOllamaChatModel = process.env.OLLAMA_CHAT_MODEL ?? "gtp-oss:120b-cloude";

const hfProvider = createOpenAICompatible({
    name: "huggingface",
    apiKey: process.env.HUGGINGFACE_API_KEY ?? "",
    baseURL: process.env.HUGGINGFACE_BASE_URL ?? "https://router.huggingface.co/v1",
    includeUsage: true,
});

function getHuggingFaceModel(
    modelId = process.env.HUGGINGFACE_MODEL ?? "openai/gpt-oss-120b:cerebras",
) {
    return hfProvider(modelId);
}

function buildFallbackReply(message: string) {
    const lower = message.toLowerCase();

    let reply =
        "I can help with listing search, tenant scoring, and Genossenschaft matching. Ask me for commute, noise, or application tips.";

    if (lower.includes("genossenschaft")) {
        reply =
            "For Genossenschaften, I check SCHUFA, employment stability, and income-to-rent ratio, then route you to a handoff application link.";
    } else if (lower.includes("cover")) {
        reply =
            "I can generate a personalized cover letter per listing and landlord. Provide a listing id to start.";
    } else if (lower.includes("price") || lower.includes("overpriced")) {
        reply =
            "I compare listing rent against district benchmarks in EUR per m2 and flag overpricing risk with a confidence score.";
    }

    return reply;
}

async function generateWithOllama(message: string) {
    const candidateModels = Array.from(
        new Set(
            [
                requestedOllamaChatModel,
                process.env.OLLAMA_CHAT_MODEL,
                process.env.OLLAMA_MODEL,
                "gpt-oss:120b-cloud",
                "gtp-oss:120b-cloude",
            ].filter((value): value is string => Boolean(value)),
        ),
    );

    let lastError: unknown;

    for (const modelId of candidateModels) {
        try {
            const { text } = await generateText({
                model: getOllamaModel(modelId),
                temperature: 0.3,
                maxOutputTokens: 320,
                system: [
                    "You are an expert Berlin rental assistant.",
                    "Give concise, practical answers for apartment search, applications, and tenant readiness.",
                    "Prefer direct next-step guidance.",
                ].join(" "),
                prompt: message,
            });

            const cleaned = text.trim();
            if (cleaned) {
                return cleaned;
            }
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError ?? new Error("No Ollama model produced a response.");
}

async function generateWithHuggingFace(message: string) {
    const hfKey = process.env.HUGGINGFACE_API_KEY;

    if (!hfKey) {
        throw new Error("HUGGINGFACE_API_KEY is not configured.");
    }

    const { text } = await generateText({
        model: getHuggingFaceModel(),
        temperature: 0.3,
        maxOutputTokens: 320,
        system: [
            "You are an expert Berlin rental assistant.",
            "Give concise, practical answers for apartment search, applications, and tenant readiness.",
            "Prefer direct next-step guidance.",
        ].join(" "),
        prompt: message,
    });

    const cleaned = text.trim();
    if (!cleaned) {
        throw new Error("Hugging Face model returned an empty response.");
    }

    return cleaned;
}

export async function POST(request: NextRequest) {
    const body = (await request.json()) as Partial<ChatRequest>;
    const message = (body.message ?? "").trim();

    if (!message) {
        return NextResponse.json(
            { error: "Missing required body field: message" },
            { status: 400 },
        );
    }

    let reply = "";
    let provider: "ollama" | "huggingface" | "fallback" = "fallback";

    try {
        reply = await generateWithOllama(message);
        provider = "ollama";
    } catch {
        try {
            reply = await generateWithHuggingFace(message);
            provider = "huggingface";
        } catch {
            reply = buildFallbackReply(message);
            provider = "fallback";
        }
    }

    const payload: ChatResponse = {
        reply,
        provider,
        timestamp: new Date().toISOString(),
    };

    return NextResponse.json(payload);
}
