import { getDb } from '../../database/client';
import { getDbRo } from '../../database/client-ro';
import { calculateMietpreisbremseAssessment } from './mietpreisbremse.service';
import type { Listing, MietpreisbremseVerdict } from '@prisma/client';

/**
 * Recompute and persist Mietpreisbremse verdict for a single listing.
 * Returns true if the listing was updated with a verdict, false if insufficient data.
 */
export async function syncListingVerdict(listing: Listing): Promise<boolean> {
    const db = getDb();
    const assessment = calculateMietpreisbremseAssessment(listing, {});

    if (assessment === null) {
        // Clear any stale verdict if data is now insufficient
        if (listing.mietpreisbremseVerdict !== null) {
            await db.listing.update({
                where: { id: listing.id },
                data: {
                    mietpreisbremseVerdict: null,
                    mietpreisbremseMaxLegalPerM2: null,
                    mietpreisbremseListingRentPerM2: null,
                    mietpreisbremseOverpaymentPercent: null,
                },
            });
        }
        return false;
    }

    const overpaymentPercent =
        assessment.mietspiegel.maxLegalPerM2 > 0
            ? Math.round(
                ((assessment.input.coldRentPerM2 - assessment.mietspiegel.maxLegalPerM2) /
                    assessment.mietspiegel.maxLegalPerM2) *
                10000,
            ) / 100
            : 0;

    await db.listing.update({
        where: { id: listing.id },
        data: {
            mietpreisbremseVerdict: assessment.result.verdict as MietpreisbremseVerdict,
            mietpreisbremseMaxLegalPerM2: assessment.mietspiegel.maxLegalPerM2,
            mietpreisbremseListingRentPerM2: assessment.input.coldRentPerM2,
            mietpreisbremseOverpaymentPercent: overpaymentPercent,
        },
    });

    return true;
}

/**
 * Recompute Mietpreisbremse verdicts for ALL listings in the database.
 * Returns counts of updated and skipped listings.
 */
export async function syncAllVerdicts(): Promise<{
    total: number;
    updated: number;
    skipped: number;
}> {
    const dbRo = getDbRo();
    const batchSize = 200;
    let cursor: string | undefined;
    let total = 0;
    let updated = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const batch: Listing[] = await dbRo.listing.findMany({
            take: batchSize,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            orderBy: { id: 'asc' },
        });

        if (batch.length === 0) break;

        for (const listing of batch) {
            total++;
            const wasUpdated = await syncListingVerdict(listing);
            if (wasUpdated) updated++;
        }

        cursor = batch[batch.length - 1].id;
    }

    return { total, updated, skipped: total - updated };
}
