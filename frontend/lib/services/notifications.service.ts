import { Prisma } from '@prisma/client';
import { getDb } from '../db';
import { getDbRo } from '../db-ro';
import { sendEmail } from './email.sender';
import { sendWhatsappMessage } from './whatsapp.sender';
import type {
    ApplicationSubmittedNotificationInput,
    ListingAlertNotificationInput,
    NotificationChannel,
    NotificationType,
} from './notifications.types';

interface NotificationPayload {
    [key: string]: unknown;
}

interface ListingAlertDispatchSummary {
    channelsCreated: number;
    channelsSent: number;
    channelsFailed: number;
    channelsSkippedDuplicate: number;
}

async function createNotificationRecord(
    tenantId: string,
    type: NotificationType,
    channel: NotificationChannel,
    payload: NotificationPayload,
): Promise<string> {
    const db = getDb();
    const rows = await db.$queryRaw<Array<{ id: string }>>(
        Prisma.sql`
      INSERT INTO "Notification" (
        "id", "tenantId", "type", "channel", "payload", "status", "createdAt"
      )
      VALUES (
        gen_random_uuid()::text,
        ${tenantId},
        ${type},
        ${channel},
        ${JSON.stringify(payload)}::jsonb,
        'pending',
        NOW()
      )
      RETURNING "id"
    `,
    );

    return rows[0].id;
}

async function markNotificationSent(notificationId: string): Promise<void> {
    const db = getDb();
    await db.$queryRaw(
        Prisma.sql`
      UPDATE "Notification"
      SET "status" = 'sent', "sentAt" = NOW()
      WHERE "id" = ${notificationId}
    `,
    );
}

async function markNotificationFailed(notificationId: string, error: string): Promise<void> {
    const db = getDb();
    await db.$queryRaw(
        Prisma.sql`
      UPDATE "Notification"
      SET
        "status" = 'failed',
        "payload" = "payload" || ${JSON.stringify({ error })}::jsonb
      WHERE "id" = ${notificationId}
    `,
    );
}

export async function getNotificationsByTenant(tenantId: string) {
    const db = getDbRo();
    return db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`
      SELECT * FROM "Notification"
      WHERE "tenantId" = ${tenantId}
      ORDER BY "createdAt" DESC
    `,
    );
}

export async function notifyApplicationSubmitted(
    input: ApplicationSubmittedNotificationInput,
): Promise<void> {
    const messageText =
        `Hi ${input.tenantName}, your application was submitted for listing ${input.listingId}. ` +
        `Application ID: ${input.applicationId}.`;

    const payload = {
        applicationId: input.applicationId,
        listingId: input.listingId,
        event: 'application-submitted',
    };

    if (input.tenantEmail) {
        const notificationId = await createNotificationRecord(
            input.tenantId,
            'application-submitted',
            'email',
            payload,
        );

        try {
            const result = await sendEmail({
                to: input.tenantEmail,
                subject: 'Application submitted',
                text: messageText,
                html: `<p>${messageText}</p>`,
            });

            if (result.success) {
                await markNotificationSent(notificationId);
            } else {
                await markNotificationFailed(notificationId, result.error ?? 'EMAIL_SEND_FAILED');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'EMAIL_SEND_FAILED';
            await markNotificationFailed(notificationId, message);
        }
    }

    if (input.tenantWhatsappNumber) {
        const notificationId = await createNotificationRecord(
            input.tenantId,
            'application-submitted',
            'whatsapp',
            payload,
        );

        try {
            const result = await sendWhatsappMessage({
                to: input.tenantWhatsappNumber,
                text: messageText,
            });

            if (result.success) {
                await markNotificationSent(notificationId);
            } else {
                await markNotificationFailed(notificationId, result.error ?? 'WHATSAPP_SEND_FAILED');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'WHATSAPP_SEND_FAILED';
            await markNotificationFailed(notificationId, message);
        }
    }
}

async function hasListingAlertNotification(
    tenantId: string,
    listingId: string,
    channel: NotificationChannel,
): Promise<boolean> {
    const db = getDbRo();
    const rows = await db.$queryRaw<Array<{ exists: boolean }>>(
        Prisma.sql`
      SELECT EXISTS (
        SELECT 1
        FROM "Notification"
        WHERE "tenantId" = ${tenantId}
          AND "type" = 'listing-alert'
          AND "channel" = ${channel}
          AND "payload"->>'listingId' = ${listingId}
      ) AS "exists"
    `,
    );

    return rows[0]?.exists === true;
}

export async function notifyListingAlert(
    input: ListingAlertNotificationInput,
): Promise<ListingAlertDispatchSummary> {
    let channelsCreated = 0;
    let channelsSent = 0;
    let channelsFailed = 0;
    let channelsSkippedDuplicate = 0;

    const messageText =
        `Hi ${input.tenantName}, a new listing matching your preferences was found: ` +
        `${input.listingTitle}. ${input.listingUrl}`;

    const payload = {
        event: 'listing-alert',
        listingId: input.listingId,
        listingTitle: input.listingTitle,
        listingUrl: input.listingUrl,
    };

    if (input.tenantEmail) {
        const alreadyNotified = await hasListingAlertNotification(input.tenantId, input.listingId, 'email');
        if (!alreadyNotified) {
            channelsCreated += 1;
            const notificationId = await createNotificationRecord(
                input.tenantId,
                'listing-alert',
                'email',
                payload,
            );

            try {
                const result = await sendEmail({
                    to: input.tenantEmail,
                    subject: 'New listing alert',
                    text: messageText,
                    html: `<p>${messageText}</p>`,
                });

                if (result.success) {
                    channelsSent += 1;
                    await markNotificationSent(notificationId);
                } else {
                    channelsFailed += 1;
                    await markNotificationFailed(notificationId, result.error ?? 'EMAIL_SEND_FAILED');
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'EMAIL_SEND_FAILED';
                channelsFailed += 1;
                await markNotificationFailed(notificationId, message);
            }
        } else {
            channelsSkippedDuplicate += 1;
        }
    }

    if (input.tenantWhatsappNumber) {
        const alreadyNotified = await hasListingAlertNotification(
            input.tenantId,
            input.listingId,
            'whatsapp',
        );
        if (!alreadyNotified) {
            channelsCreated += 1;
            const notificationId = await createNotificationRecord(
                input.tenantId,
                'listing-alert',
                'whatsapp',
                payload,
            );

            try {
                const result = await sendWhatsappMessage({
                    to: input.tenantWhatsappNumber,
                    text: messageText,
                });

                if (result.success) {
                    channelsSent += 1;
                    await markNotificationSent(notificationId);
                } else {
                    channelsFailed += 1;
                    await markNotificationFailed(notificationId, result.error ?? 'WHATSAPP_SEND_FAILED');
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'WHATSAPP_SEND_FAILED';
                channelsFailed += 1;
                await markNotificationFailed(notificationId, message);
            }
        } else {
            channelsSkippedDuplicate += 1;
        }
    }

    return {
        channelsCreated,
        channelsSent,
        channelsFailed,
        channelsSkippedDuplicate,
    };
}
