import type { NotificationDispatchResult } from './notifications.types';

interface SendWhatsappInput {
    to: string;
    text: string;
}

export async function sendWhatsappMessage(
    input: SendWhatsappInput,
): Promise<NotificationDispatchResult> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION ?? 'v23.0';

    if (!token || !phoneNumberId) {
        return { success: false, error: 'WHATSAPP_NOT_CONFIGURED' };
    }

    const response = await fetch(
        `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: input.to,
                type: 'text',
                text: { body: input.text },
            }),
        },
    );

    const payload = (await response.json().catch(() => ({}))) as {
        messages?: Array<{ id: string }>;
        error?: { message?: string };
    };

    if (!response.ok) {
        return {
            success: false,
            error: payload.error?.message ?? `WHATSAPP_SEND_FAILED:${response.status}`,
        };
    }

    return {
        success: true,
        providerMessageId: payload.messages?.[0]?.id,
    };
}
