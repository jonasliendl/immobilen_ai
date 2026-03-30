import { z } from 'zod';

// ─── Tenant ──────────────────────────────────────────────────────

export const CreateTenantSchema = z.object({
    email: z.email(),
    name: z.string().min(1).max(200),
    phone: z.string().max(30).optional(),
    whatsappNumber: z.string().max(30).optional(),
    monthlyNetIncomeEur: z.number().int().min(0).optional(),
    householdSize: z.number().int().min(1).max(20).default(1),
    hasPets: z.boolean().default(false),
    hasSchufa: z.boolean().default(false),
});

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;

export const UpdateTenantSchema = z.object({
    email: z.email().optional(),
    name: z.string().min(1).max(200).optional(),
    phone: z.string().max(30).optional(),
    whatsappNumber: z.string().max(30).optional(),
    monthlyNetIncomeEur: z.number().int().min(0).optional(),
    householdSize: z.number().int().min(1).max(20).optional(),
    hasPets: z.boolean().optional(),
    hasSchufa: z.boolean().optional(),
});

export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;

// ─── Tenant Preferences ──────────────────────────────────────────

export const UpsertPreferencesSchema = z.object({
    minRooms: z.number().min(0).optional(),
    maxRooms: z.number().min(0).optional(),
    maxColdRent: z.number().min(0).optional(),
    maxWarmRent: z.number().min(0).optional(),
    minAreaM2: z.number().min(0).optional(),
    preferredDistricts: z.array(z.string()).default([]),
    wbsRequired: z.boolean().optional(),
    autoApplyEnabled: z.boolean().default(false),
});

export type UpsertPreferencesInput = z.infer<typeof UpsertPreferencesSchema>;

// ─── Application ─────────────────────────────────────────────────

export const CreateApplicationSchema = z.object({
    listingId: z.string().min(1),
    coverLetter: z.string().max(5000).optional(),
});

export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;

// ─── Auto Apply ────────────────────────────────────────────────

export const RunAutoApplySchema = z.object({
    maxListings: z.number().int().min(1).max(100).default(20),
    dryRun: z.boolean().default(false),
});

export type RunAutoApplyInput = z.infer<typeof RunAutoApplySchema>;

export const RunAutoApplyBatchSchema = RunAutoApplySchema;

export type RunAutoApplyBatchInput = z.infer<typeof RunAutoApplyBatchSchema>;
