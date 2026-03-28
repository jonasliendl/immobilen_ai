import { berlinListings, demoTenant } from "@/lib/data";
import { matchGenossenschaft } from "@/lib/scoring";
import { generateText } from "ai";
import { getOllamaModel } from "@/lib/ollama";
import { NextResponse } from "next/server";

async function enrichMatchWithAI(
    tenant: typeof demoTenant,
    listing: (typeof berlinListings)[number],
    formulaMatch: NonNullable<ReturnType<typeof matchGenossenschaft>>,
) {
    const prompt = [
        "Analyze this Genossenschaft (housing co-op) application match.",
        "",
        `Genossenschaft: ${listing.genossenschaftName}`,
        `Listing: "${listing.title}" in ${listing.district}, EUR ${listing.monthlyRentEur}/month, ${listing.sizeM2}m2`,
        "",
        `Applicant income: EUR ${tenant.monthlyNetIncomeEur}/month`,
        `Income-to-rent ratio: ${(tenant.monthlyNetIncomeEur / Math.max(listing.monthlyRentEur, 1)).toFixed(1)}x`,
        `Has SCHUFA: ${tenant.hasSchufa ? "yes" : "no"}`,
        `Stable employment: ${tenant.stableEmploymentMonths} months`,
        `Household size: ${tenant.householdSize}`,
        `Rooms: ${listing.rooms}`,
        `Has pets: ${tenant.hasPets}`,
        `Preferred districts: ${tenant.preferredDistricts.join(", ")}`,
        "",
        `Formula eligibility: ${formulaMatch.isEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}`,
        `Formula reasons: ${formulaMatch.eligibilityReasons.join("; ")}`,
        "",
        "Provide a JSON object with exactly these fields:",
        '- "isEligible": boolean (confirm or override the formula result based on your analysis)',
        '- "eligibilityReasons": string[] (3-5 detailed reasons, plain text, no special characters except EUR and %)',
        '- "advice": string (one sentence of actionable advice for the applicant)',
        "",
        "Output ONLY valid JSON, no markdown fences, no extra text.",
    ].join("\n");

    const { text } = await generateText({
        model: getOllamaModel(),
        temperature: 0.3,
        maxOutputTokens: 400,
        system: [
            "You are a Berlin housing co-op (Genossenschaft) eligibility analyst.",
            "You evaluate tenant profiles against co-op requirements.",
            "Format output as valid JSON only.",
            "Do not use emojis or decorative special characters.",
            "Currency signs (EUR) and accounting notation (%, +, -) are allowed.",
        ].join(" "),
        prompt,
    });

    const cleaned = text.trim();
    const parsed = JSON.parse(cleaned) as {
        isEligible: boolean;
        eligibilityReasons: string[];
        advice: string;
    };

    return {
        ...formulaMatch,
        isEligible: parsed.isEligible,
        eligibilityReasons: parsed.eligibilityReasons,
        advice: parsed.advice,
        provider: "ollama" as const,
    };
}

export async function GET() {
    const coopListings = berlinListings.filter(
        (listing) => listing.source === "genossenschaft",
    );

    const matches = await Promise.all(
        coopListings.map(async (listing) => {
            const formulaMatch = matchGenossenschaft(demoTenant, listing);
            if (!formulaMatch) return { listing, match: null };

            try {
                const enriched = await enrichMatchWithAI(
                    demoTenant,
                    listing,
                    formulaMatch,
                );
                return { listing, match: enriched };
            } catch {
                return { listing, match: { ...formulaMatch, provider: "fallback" as const } };
            }
        }),
    );

    return NextResponse.json({
        tenant: demoTenant,
        matches,
    });
}
