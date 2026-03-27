import {
    GenossenschaftMatch,
    Listing,
    PriceAssessment,
    SuccessProbability,
    TenantProfile,
    TenantScoreBreakdown,
} from "@/lib/types";
import { districtRentBenchmarkPerM2 } from "@/lib/data";

export function assessPrice(listing: Listing): PriceAssessment {
    const baselinePerM2 = districtRentBenchmarkPerM2[listing.district] ?? 18;
    const expectedRentEur = Math.round(baselinePerM2 * listing.sizeM2);
    const deltaEur = listing.monthlyRentEur - expectedRentEur;

    return {
        listingId: listing.id,
        expectedRentEur,
        deltaEur,
        isOverpriced: deltaEur > 120,
        confidence: 0.71,
    };
}

// Alias for backwards compatibility
export const calculatePriceAssessment = assessPrice;

export function calculateTenantScore(
    tenant: TenantProfile,
    listing: Listing,
): TenantScoreBreakdown {
    const incomeCoverage = tenant.monthlyNetIncomeEur / Math.max(listing.monthlyRentEur, 1);
    const incomeStability = Math.min(40, Math.round(incomeCoverage * 12));

    const documentCompleteness = tenant.hasSchufa ? 30 : 10;

    let householdFit = 10;
    if (tenant.householdSize <= 2 && listing.rooms >= 2) householdFit += 10;
    if (tenant.preferredDistricts.includes(listing.district)) householdFit += 10;

    const total = Math.min(100, incomeStability + documentCompleteness + householdFit);

    const notes: string[] = [];
    if (!tenant.hasSchufa) notes.push("Missing SCHUFA reduces application competitiveness.");
    if (!tenant.preferredDistricts.includes(listing.district)) {
        notes.push("District mismatch lowers preference fit.");
    }
    if (incomeCoverage < 2.7) {
        notes.push("Income-to-rent ratio is below the ideal threshold.");
    }

    return {
        total,
        incomeStability,
        documentCompleteness,
        householdFit,
        notes,
    };
}

export function estimateSuccessProbability(
    tenantScore: TenantScoreBreakdown,
    listing: Listing,
): SuccessProbability {
    let probability = tenantScore.total * 0.78;

    if (listing.source === "genossenschaft") probability += 5;
    if (listing.noiseScore > 55) probability -= 4;

    const bounded = Math.max(5, Math.min(95, Math.round(probability)));
    const reasons = [
        `Tenant profile score contributes ${Math.round(tenantScore.total * 0.7)} points.`,
        listing.source === "genossenschaft"
            ? "Genossenschaft listing gives an extra trust premium."
            : "Marketplace listing tends to be more competitive.",
    ];

    return {
        listingId: listing.id,
        probability: bounded,
        reasons,
    };
}

export function matchGenossenschaft(
    tenant: TenantProfile,
    listing: Listing,
): GenossenschaftMatch | null {
    if (listing.source !== "genossenschaft" || !listing.genossenschaftName) {
        return null;
    }

    const reasons: string[] = [];
    let eligible = true;

    const rentRatio = tenant.monthlyNetIncomeEur / Math.max(listing.monthlyRentEur, 1);
    if (rentRatio < 2.5) {
        eligible = false;
        reasons.push("Income-to-rent ratio below required threshold (2.5x).");
    } else {
        reasons.push("Income-to-rent ratio meets threshold.");
    }

    if (!tenant.hasSchufa) {
        eligible = false;
        reasons.push("Valid SCHUFA is required for this Genossenschaft.");
    } else {
        reasons.push("SCHUFA available.");
    }

    if (tenant.stableEmploymentMonths < 12) {
        eligible = false;
        reasons.push("Stable employment below 12 months.");
    } else {
        reasons.push("Employment stability requirement met.");
    }

    return {
        listingId: listing.id,
        genossenschaftName: listing.genossenschaftName,
        isEligible: eligible,
        eligibilityReasons: reasons,
        handoffUrl: `https://apply.example.com/genossenschaften/${encodeURIComponent(listing.genossenschaftName)}`,
    };
}
