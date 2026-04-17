import type { ApplicatorInterface, ApplicatorSubmissionInput, ApplicatorSubmissionResult } from '../applicator.types';

export class EmailApplicator implements ApplicatorInterface {
    public readonly id = 'email-applicator';

    public canHandle(_sourceId: string): boolean {
        return true;
    }

    public async submit(input: ApplicatorSubmissionInput): Promise<ApplicatorSubmissionResult> {
        if (input.dryRun) {
            return {
                success: true,
                externalReference: `dry-run:email:${input.applicationId}`,
            };
        }

        if (!input.tenantEmail) {
            return { success: false, error: 'TENANT_EMAIL_REQUIRED' };
        }

        if (!input.listingUrl) {
            return { success: false, error: 'LISTING_URL_REQUIRED' };
        }

        // Phase 4 baseline: emulate an external submission handshake.
        return {
            success: true,
            externalReference: `email:${input.applicationId}`,
        };
    }
}
