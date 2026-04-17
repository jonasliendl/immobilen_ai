import type { NotificationDispatchResult } from './notifications.types';

interface SendEmailInput {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export async function sendEmail(input: SendEmailInput): Promise<NotificationDispatchResult> {
    const provider = process.env.EMAIL_PROVIDER?.toUpperCase() ?? 'RESEND';

    if (provider !== 'RESEND') {
        return { success: false, error: `EMAIL_PROVIDER_NOT_SUPPORTED:${provider}` };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !from) {
        return { success: false, error: 'EMAIL_NOT_CONFIGURED' };
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to: [input.to],
            subject: input.subject,
            html: input.html,
            text: input.text,
        }),
    });

    const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string };

    if (!response.ok) {
        return {
            success: false,
            error: payload.message ?? `EMAIL_SEND_FAILED:${response.status}`,
        };
    }

    return {
        success: true,
        providerMessageId: payload.id,
    };
}
