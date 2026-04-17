import type { Listing } from '@prisma/client';
import {
    getBezugsfertigkeit,
    lookupMietspiegel,
    maxLegalRentPerM2,
    type Wohnlage,
} from '../mietspiegel-table';

export interface MietpreisbremseAssessment {
    listingId: string;
    assumptions: string[];
    input: {
        areaM2: number;
        coldRentEur: number;
        coldRentPerM2: number;
        wohnlage: Wohnlage;
        buildingYear: number;
        isOst: boolean;
    };
    mietspiegel: {
        zeile: number;
        lower: number;
        mid: number;
        upper: number;
        maxLegalPerM2: number;
    };
    result: {
        differencePerM2: number;
        overpaymentMonthlyEur: number;
        verdict: 'COMPLIANT' | 'BORDERLINE' | 'EXCEEDS_RENT_CAP';
    };
    disclaimer: string[];
}

export interface MietpreisbremseOptions {
    wohnlage?: Wohnlage;
    buildingYear?: number;
    isOst?: boolean;
    areaM2?: number;
    coldRentAmount?: number;
    warmRentAmount?: number;
    operatingCostsPerM2?: number;
}

function inferWohnlageFromAddress(address: string | null): Wohnlage {
    if (!address) return 'mittel';
    const value = address.toLowerCase();

    if (
        value.includes('charlottenburg') ||
        value.includes('wilmersdorf') ||
        value.includes('zehlendorf') ||
        value.includes('steglitz')
    ) {
        return 'gut';
    }

    if (
        value.includes('marzahn') ||
        value.includes('hellersdorf') ||
        value.includes('lichtenberg') ||
        value.includes('spandau') ||
        value.includes('reinickendorf')
    ) {
        return 'einfach';
    }

    return 'mittel';
}

function inferIsOstFromAddress(address: string | null): boolean {
    if (!address) return false;
    const value = address.toLowerCase();
    return (
        value.includes('friedrichshain') ||
        value.includes('pankow') ||
        value.includes('marzahn') ||
        value.includes('hellersdorf') ||
        value.includes('lichtenberg') ||
        value.includes('treptow') ||
        value.includes('köpenick') ||
        value.includes('koepenick') ||
        value.includes('weissensee') ||
        value.includes('weißensee')
    );
}

function toNumber(input: unknown): number | null {
    if (input === null || input === undefined) return null;
    if (typeof input === 'number') return Number.isFinite(input) ? input : null;
    const parsed = Number(input);
    return Number.isFinite(parsed) ? parsed : null;
}

export function calculateMietpreisbremseAssessment(
    listing: Listing,
    options: MietpreisbremseOptions,
): MietpreisbremseAssessment | null {
    const assumptions: string[] = [];

    const areaM2 = options.areaM2 ?? toNumber(listing.areaM2);
    if (!areaM2 || areaM2 <= 0) {
        return null;
    }

    const operatingCostsPerM2 = options.operatingCostsPerM2 ?? 3;

    let coldRentAmount =
        options.coldRentAmount ??
        toNumber(listing.coldRentAmount) ??
        null;

    if (coldRentAmount === null) {
        const warm = options.warmRentAmount ?? toNumber(listing.warmRentAmount) ?? null;
        if (warm === null) return null;
        coldRentAmount = Math.max(0, warm - operatingCostsPerM2 * areaM2);
        assumptions.push(
            `Cold rent estimated from warm rent using ${operatingCostsPerM2.toFixed(2)} EUR/m2 operating costs.`,
        );
    }

    const buildingYear = options.buildingYear ?? listing.yearOfConstruction ?? null;
    if (!buildingYear) {
        return null;
    }

    const isOst = options.isOst ?? inferIsOstFromAddress(listing.address);
    if (options.isOst === undefined) {
        assumptions.push('Ost/West inferred from address text.');
    }

    const wohnlage = options.wohnlage ?? inferWohnlageFromAddress(listing.address);
    if (options.wohnlage === undefined) {
        assumptions.push('Wohnlage inferred heuristically from district in address.');
    }

    const bezugsfertigkeit = getBezugsfertigkeit(buildingYear, isOst);
    if (bezugsfertigkeit === null) {
        return null;
    }

    const entry = lookupMietspiegel(wohnlage, bezugsfertigkeit, areaM2);
    if (entry === null) {
        return null;
    }

    const coldRentPerM2 = Math.round((coldRentAmount / areaM2) * 100) / 100;
    const maxLegalPerM2Value = maxLegalRentPerM2(entry);
    const differencePerM2 = Math.round((coldRentPerM2 - maxLegalPerM2Value) * 100) / 100;
    const overpaymentMonthlyEur = Math.max(0, Math.round(differencePerM2 * areaM2 * 100) / 100);

    const verdict =
        differencePerM2 <= 0
            ? 'COMPLIANT'
            : differencePerM2 <= 0.3
                ? 'BORDERLINE'
                : 'EXCEEDS_RENT_CAP';

    return {
        listingId: listing.id,
        assumptions,
        input: {
            areaM2,
            coldRentEur: Math.round(coldRentAmount * 100) / 100,
            coldRentPerM2,
            wohnlage,
            buildingYear,
            isOst,
        },
        mietspiegel: {
            zeile: entry.zeile,
            lower: entry.lower,
            mid: entry.mid,
            upper: entry.upper,
            maxLegalPerM2: maxLegalPerM2Value,
        },
        result: {
            differencePerM2,
            overpaymentMonthlyEur,
            verdict,
        },
        disclaimer: [
            'This check is informational and not legally binding.',
            'For legal advice, consult Berliner Mieterverein or a Mietrecht lawyer.',
            'Mietspiegel comparison is based on Nettokaltmiete.',
        ],
    };
}
