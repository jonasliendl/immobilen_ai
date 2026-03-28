import { z } from 'zod';

export const WaitlistSourceSchema = z.enum(['landing_form', 'qr_landing']);

export const WaitlistSignupBodySchema = z.object({
  email: z.string().trim().min(1).max(320),
  source: WaitlistSourceSchema.default('landing_form'),
});

export type WaitlistSignupBody = z.infer<typeof WaitlistSignupBodySchema>;
