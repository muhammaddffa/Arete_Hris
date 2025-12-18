import { z } from 'zod';

export const CreateFormSchema = z.object({
  nameForm: z
    .string()
    .min(1, 'Nama form harus diisi')
    .max(200, 'Nama form maksimal 200 karakter'),
  deskripsi: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CreateFormDto = z.infer<typeof CreateFormSchema>;

export const UpdateFormSchema = z.object({
  nameForm: z
    .string()
    .min(1, 'Nama form harus diisi')
    .max(200, 'Nama form maksimal 200 karakter')
    .optional(),
  deskripsi: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateFormDto = z.infer<typeof UpdateFormSchema>;

export const FilterFormSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  isActive: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type FilterFormDto = z.infer<typeof FilterFormSchema>;
