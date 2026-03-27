import { generateText } from "ai";
import { getOllamaModel } from "@/lib/ollama";
import { berlinListings, districtRentBenchmarkPerM2 } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

type Prediction = {
    title: string;
    prediction: string;
    confidence: number;
    tags: string[];
    isPositive: boolean;
};

function buildFallbackPredictions(): Prediction[] {
    return [
        {
            title: "Best Districts Next Month",
            prediction:
                "Based on current listing volume, Friedrichshain and Wedding show increasing supply with stable prices, making them favorable for applicants.",
            confidence: 68,
            tags: ["Friedrichshain", "Wedding"],
            isPositive: true,
        },
        {
            title: "Price Forecast",
            prediction:
                "Average rents are expected to rise 2-3% in Q2 2026 due to seasonal demand. Budget-conscious tenants should act before April.",
            confidence: 60,
            tags: ["Berlin-wide", "Q2 2026"],
            isPositive: false,
        },
        {
            title: "Genossenschaft Opportunities",
            prediction:
                "Multiple co-ops typically open spring application rounds. Tenants with complete documents and SCHUFA have the strongest position.",
            confidence: 72,
            tags: ["Genossenschaft", "Spring Cycle"],
            isPositive: true,
        },
    ];
}

export async function GET(request: NextRequest) {
    const timeRange = request.nextUrl.searchParams.get("timeRange") || "30d";

    const districtSummary = Object.entries(districtRentBenchmarkPerM2)
        .map(([district, pricePerM2]) => {
            const count = berlinListings.filter((l) => l.district === district).length;
            const coopCount = berlinListings.filter(
                (l) => l.district === district && l.source === "genossenschaft",
            ).length;
            return `${district}: EUR ${pricePerM2}/m2, ${count} listings (${coopCount} co-op)`;
        })
        .join("\n");

    const totalListings = berlinListings.length;
    const coopListings = berlinListings.filter((l) => l.source === "genossenschaft").length;
    const avgRent = Math.round(
        berlinListings.reduce((sum, l) => sum + l.monthlyRentEur, 0) / totalListings,
    );

    const prompt = [
        "Generate 3 rental market predictions for Berlin based on this data.",
        "",
        `Time period: ${timeRange}`,
        `Total active listings: ${totalListings}`,
        `Co-op listings: ${coopListings}`,
        `Average rent: EUR ${avgRent}/month`,
        "",
        "District breakdown:",
        districtSummary,
        "",
        "Return a JSON array of exactly 3 objects, each with:",
        '- "title": short headline (max 6 words)',
        '- "prediction": 1-2 sentence analysis (plain text, no special characters except EUR and %)',
        '- "confidence": number 50-95',
        '- "tags": string[] of 2-3 relevant labels',
        '- "isPositive": boolean (is this good news for tenants?)',
        "",
        "Focus predictions on: (1) best districts to apply right now, (2) rent price trend, (3) co-op opportunities.",
        "Output ONLY valid JSON array, no markdown fences, no extra text.",
    ].join("\n");

    try {
        const { text } = await generateText({
            model: getOllamaModel(),
            temperature: 0.4,
            maxOutputTokens: 600,
            system: [
                "You are a Berlin rental market analyst.",
                "You produce data-driven predictions for apartment seekers.",
                "Format output as valid JSON only.",
                "Do not use emojis or decorative special characters.",
                "Currency signs (EUR) and accounting notation (%, +, -) are allowed.",
            ].join(" "),
            prompt,
        });

        const cleaned = text.trim();
        const predictions = JSON.parse(cleaned) as Prediction[];

        if (!Array.isArray(predictions) || predictions.length === 0) {
            throw new Error("Invalid predictions format");
        }

        return NextResponse.json({
            predictions,
            provider: "ollama",
            generatedAt: new Date().toISOString(),
        });
    } catch {
        return NextResponse.json({
            predictions: buildFallbackPredictions(),
            provider: "fallback",
            generatedAt: new Date().toISOString(),
        });
    }
}
