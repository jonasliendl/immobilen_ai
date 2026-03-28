import { streamText } from "ai";
import { berlinListings, demoTenant } from "@/lib/data";
import {
    getOllamaConfig,
    getOllamaModel,
    isOllamaConfigured,
    isOllamaReachable,
} from "@/lib/ollama";
import { CoverLetterRequest } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

function streamFallbackLetter(letter: string) {
    const encoder = new TextEncoder();
    const chunks = letter.split(/(\n\n)/);

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const chunk of chunks) {
                if (!chunk) continue;
                controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-AI-Provider": "fallback-template",
        },
    });
}

function buildFallbackLetter(input: {
    landlordName: string;
    listingTitle: string;
    district: string;
    income: string;
    employmentMonths: string;
    applicantName: string;
    personalMessage?: string;
}) {
    return `Dear ${input.landlordName},\n\nI am very interested in your apartment \"${input.listingTitle}\" in ${input.district}. I have a stable employment record (${input.employmentMonths}), a monthly net income of ${input.income}, and complete application documents including SCHUFA.\n\n${input.personalMessage ? `${input.personalMessage}\n\n` : ""}I would be happy to introduce myself in a viewing and can provide my full document bundle immediately.\n\nKind regards,\n${input.applicantName}`;
}

export async function POST(request: NextRequest) {
    const body = (await request.json()) as Partial<CoverLetterRequest>;
    const listingId = body.listingId;

    if (!listingId) {
        return NextResponse.json(
            { error: "Missing required body field: listingId" },
            { status: 400 },
        );
    }

    const listing = berlinListings.find((item) => item.id === listingId);

    if (!listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const profile = body.profile;
    const applicantName = profile?.name?.trim() || demoTenant.name;
    const income = profile?.monthlyNetIncome?.trim()
        ? `EUR ${profile.monthlyNetIncome.trim()}`
        : `EUR ${demoTenant.monthlyNetIncomeEur}`;
    const employmentMonths = profile?.employmentDuration?.trim()
        ? `${profile.employmentDuration.trim()} months`
        : `${demoTenant.stableEmploymentMonths} months`;

    const fallbackLetter = buildFallbackLetter({
        landlordName: listing.landlordName,
        listingTitle: listing.title,
        district: listing.district,
        income,
        employmentMonths,
        applicantName,
        personalMessage: profile?.message?.trim(),
    });

    try {
        const ollamaConfig = getOllamaConfig();
        if (!isOllamaConfigured()) {
            return streamFallbackLetter(fallbackLetter);
        }

        const reachable = await isOllamaReachable();

        if (!reachable) {
            return streamFallbackLetter(fallbackLetter);
        }

        const result = streamText({
            model: getOllamaModel(),
            temperature: 0.5,
            maxOutputTokens: 420,
            abortSignal: request.signal,
            system: [
                "You write concise, high-conviction apartment application cover letters for Berlin rentals.",
                "Output only the final letter body in English unless the landlord or applicant context explicitly requires German.",
                "Keep the tone professional, warm, and factual.",
                "Mention financial stability, document readiness, and fit for the listing.",
                "IMPORTANT: Output plain text ONLY. Never use markdown formatting.",
                "Do not use asterisks (*), hash symbols (#), horizontal rules (---), pipe tables (|), backticks (`), or angle brackets (>).",
                "Do not wrap words in asterisks for emphasis. Do not prefix lines with # for headings.",
                "Do not use emojis or decorative characters.",
                "Currency signs (EUR, $) and accounting notation (%, +, -) are allowed.",
            ].join(" "),
            prompt: [
                `Provider: Ollama at ${ollamaConfig.baseUrl}`,
                `Model: ${ollamaConfig.model}`,
                `Listing title: ${listing.title}`,
                `District: ${listing.district}`,
                `Address: ${listing.address}`,
                `Landlord: ${listing.landlordName}`,
                `Rent: EUR ${listing.monthlyRentEur}`,
                `Size: ${listing.sizeM2}m2, rooms: ${listing.rooms}`,
                `Listing source: ${listing.source}`,
                `Applicant name: ${applicantName}`,
                `Applicant income: ${income}`,
                `Stable employment: ${employmentMonths}`,
                `Household size: ${profile?.householdSize?.trim() || demoTenant.householdSize}`,
                `Has SCHUFA: ${profile?.hasSchufa ?? demoTenant.hasSchufa ? "yes" : "no"}`,
                `Has pets: ${profile?.hasPets ? `yes (${profile.petsDescription || "details not provided"})` : "no"}`,
                `Move-in date: ${profile?.moveInDate?.trim() || "flexible"}`,
                `Occupation: ${profile?.occupation?.trim() || "not specified"}`,
                `Personal note: ${profile?.message?.trim() || "No custom note provided."}`,
                "Write a polished cover letter in 3-5 short paragraphs.",
            ].join("\n"),
        });

        return result.toTextStreamResponse({
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-AI-Provider": "ollama-ai-sdk",
            },
        });
    } catch {
        return streamFallbackLetter(fallbackLetter);
    }
}
