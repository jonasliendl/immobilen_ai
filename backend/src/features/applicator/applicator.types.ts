export interface ApplicatorSubmissionInput {
    applicationId: string;
    tenantId: string;
    tenantName: string;
    tenantEmail: string | null;
    listingId: string;
    listingSource: string;
    listingTitle: string;
    listingUrl: string;
    coverLetter: string | null;
    dryRun: boolean;
}

export interface ApplicatorSubmissionResult {
    success: boolean;
    externalReference?: string;
    error?: string;
}

export interface ApplicatorInterface {
    readonly id: string;
    canHandle(sourceId: string): boolean;
    submit(input: ApplicatorSubmissionInput): Promise<ApplicatorSubmissionResult>;
}

export interface AutoApplyRunResult {
    tenantId: string;
    autoApplyEnabled: boolean;
    dryRun: boolean;
    consideredListings: number;
    applicationsPlanned: number;
    applicationsCreated: number;
    applicationsSubmitted: number;
    applicationsFailed: number;
    skippedExisting: number;
    skippedNoApplicator: number;
    applicatorsUsed: string[];
}

export interface AutoApplyBatchRunResult {
    dryRun: boolean;
    tenantsConsidered: number;
    tenantsProcessed: number;
    tenantsSkippedDisabled: number;
    totalConsideredListings: number;
    totalApplicationsPlanned: number;
    totalApplicationsCreated: number;
    totalApplicationsSubmitted: number;
    totalApplicationsFailed: number;
    perTenant: AutoApplyRunResult[];
}
