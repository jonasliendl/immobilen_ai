import type {
    ApplicatorInterface,
    ApplicatorSubmissionInput,
    ApplicatorSubmissionResult,
} from '../applicator.types';

export class InBerlinWohnenApplicator implements ApplicatorInterface {
    public readonly id = 'in-berlin-wohnen-applicator';

    public canHandle(sourceId: string): boolean {
        return sourceId === 'in-berlin-wohnen';
    }

    public async submit(input: ApplicatorSubmissionInput): Promise<ApplicatorSubmissionResult> {
        if (input.dryRun) {
            return {
                success: true,
                externalReference: `dry-run:in-berlin-wohnen:${input.applicationId}`,
            };
        }

        if (!input.listingUrl) {
            return { success: false, error: 'LISTING_URL_REQUIRED' };
        }

        // Phase 4 implementation baseline:
        // submission is acknowledged and tracked; source-specific real form automation
        // is added by subsequent applicator iterations.
        return {
            success: true,
            externalReference: `in-berlin-wohnen:${input.applicationId}`,
        };
    }
}
