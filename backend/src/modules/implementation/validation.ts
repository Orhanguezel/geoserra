import { z } from 'zod';

export const ImplementationRequestSchema = z.object({
  email: z.string().email(),
  domain: z.string().min(3).max(255),
  package_slug: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
  analysis_id: z.string().uuid().optional(),
  // cPanel bilgileri — geçici, DB'ye kaydedilmez
  cpanel_host: z.string().max(255).optional(),
  cpanel_user: z.string().max(255).optional(),
  cpanel_pass: z.string().max(255).optional(),
});

export const ImplementationUpdateSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'done', 'cancelled']).optional(),
  admin_notes: z.string().max(5000).optional(),
});

export const ImplementationListParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'done', 'cancelled']).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ImplementationRequestInput = z.infer<typeof ImplementationRequestSchema>;
export type ImplementationUpdateInput = z.infer<typeof ImplementationUpdateSchema>;
export type ImplementationListParams = z.infer<typeof ImplementationListParamsSchema>;
