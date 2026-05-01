import { z } from 'zod';

/** Campos editables del perfil (FR-006); alineado a `StudentBusinessProfile`. */
export const businessProfileFormSchema = z.object({
  business_name: z.string().max(200),
  industry: z.string().max(120),
  business_model: z.string().max(300),
  target_customer: z.string().max(500),
  main_goal: z.string().max(500),
  main_challenge: z.string().max(500),
  current_stage: z.string().max(120),
  country: z.string().max(120),
  notes: z.string().max(5000),
});

export type BusinessProfileFormInput = z.infer<typeof businessProfileFormSchema>;
