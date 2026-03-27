export async function readTextStream(
    response: Response,
    onChunk: (chunk: string) => void,
): Promise<string> {
    const reader = response.body?.getReader();

    if (!reader) {
        const text = await response.text();
        onChunk(text);
        return text;
    }

    const decoder = new TextDecoder();
    let aggregated = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aggregated += chunk;
        onChunk(chunk);
    }

    const finalChunk = decoder.decode();
    if (finalChunk) {
        aggregated += finalChunk;
        onChunk(finalChunk);
    }

    return aggregated;
}
