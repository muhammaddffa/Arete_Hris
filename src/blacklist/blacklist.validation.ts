import { z } from 'zod';

export const CreateBlacklistSchema = z.object({
  idKaryawan: z.string().uuid('ID karyawan harus UUID'),
  alasan: z
    .string()
    .min(10, 'Alasan minimal 10 karakter')
    .max(1000, 'Alasan maksimal 1000 karakter'),
});

export const UpdateBlacklistSchema = z.object({
  alasan: z
    .string()
    .min(10, 'Alasan minimal 10 karakter')
    .max(1000, 'Alasan maksimal 1000 karakter')
    .optional(),
  pasfoto: z.string().optional(),
});

export const FilterBlacklistSchema = z.object({
  search: z.string().optional(),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
  sortBy: z.enum(['nama', 'nik', 'createdAt']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  includeRelations: z.boolean().default(false).optional(),
});

export type CreateBlacklistInput = z.infer<typeof CreateBlacklistSchema>;
export type UpdateBlacklistInput = z.infer<typeof UpdateBlacklistSchema>;
export type FilterBlacklistInput = z.infer<typeof FilterBlacklistSchema>;

export function validateCreateBlacklist(data: unknown): CreateBlacklistInput {
  return CreateBlacklistSchema.parse(data);
}

export function validateUpdateBlacklist(data: unknown): UpdateBlacklistInput {
  return UpdateBlacklistSchema.parse(data);
}

export function validateFilterBlacklist(data: unknown): FilterBlacklistInput {
  return FilterBlacklistSchema.parse(data);
}
