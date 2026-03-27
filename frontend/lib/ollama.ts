import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const defaultBaseUrl = "http://127.0.0.1:11434/v1";
const defaultModel = "qwen2.5:7b-instruct";

const provider = createOpenAICompatible({
    name: "ollama",
    apiKey: process.env.OLLAMA_API_KEY ?? "ollama",
    baseURL: process.env.OLLAMA_BASE_URL ?? defaultBaseUrl,
    includeUsage: true,
});

export function getOllamaModel(modelId = process.env.OLLAMA_MODEL ?? defaultModel) {
    return provider(modelId);
}

export function getOllamaConfig() {
    return {
        baseUrl: process.env.OLLAMA_BASE_URL ?? defaultBaseUrl,
        model: process.env.OLLAMA_MODEL ?? defaultModel,
    };
}

export function isOllamaConfigured() {
    return Boolean(process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL);
}

export async function isOllamaReachable(timeoutMs = 1500) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const { baseUrl, model } = getOllamaConfig();
        const response = await fetch(`${baseUrl}/models`, {
            method: "GET",
            signal: controller.signal,
            headers: {
                Authorization: `Bearer ${process.env.OLLAMA_API_KEY ?? "ollama"}`,
            },
        });

        if (!response.ok) return false;

        const data = (await response.json()) as {
            data?: Array<{ id?: string; name?: string }>;
        };

        const availableModels = (data.data ?? []).flatMap((item) =>
            [item.id, item.name].filter((value): value is string => Boolean(value)),
        );

        return availableModels.includes(model);
    } catch {
        return false;
    } finally {
        clearTimeout(timeoutId);
    }
}
