import { z } from 'zod';

export const FreeAnalysisSchema = z.object({
  url: z.string().url('Geçerli bir URL girin'),
  email: z.string().email('Geçerli bir e-posta girin'),
});

export const PaidAnalysisSchema = z.object({
  url: z.string().url('Geçerli bir URL girin'),
  email: z.string().email('Geçerli bir e-posta girin'),
  package: z.enum(['starter', 'pro', 'expert']),
  payment_provider: z.enum(['stripe', 'paypal']).default('stripe'),
  locale: z.string().max(10).optional().default('tr'),
});

export const AnalysisListParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['free', 'pending', 'processing', 'completed', 'failed']).optional(),
  package_slug: z.enum(['free', 'starter', 'pro', 'expert']).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type FreeAnalysisInput = z.infer<typeof FreeAnalysisSchema>;
export type PaidAnalysisInput = z.infer<typeof PaidAnalysisSchema>;
export type AnalysisListParams = z.infer<typeof AnalysisListParamsSchema>;
