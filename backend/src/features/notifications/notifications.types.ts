export type NotificationChannel = 'email' | 'whatsapp';

export type NotificationType =
    | 'listing-alert'
    | 'application-submitted'
    | 'application-response';

export interface NotificationDispatchResult {
    success: boolean;
    providerMessageId?: string;
    error?: string;
}

export interface ApplicationSubmittedNotificationInput {
    tenantId: string;
    tenantName: string;
    tenantEmail: string | null;
    tenantWhatsappNumber: string | null;
    applicationId: string;
    listingId: string;
}

export interface ListingAlertNotificationInput {
    tenantId: string;
    tenantName: string;
    tenantEmail: string | null;
    tenantWhatsappNumber: string | null;
    listingId: string;
    listingTitle: string;
    listingUrl: string;
}
