/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateOptionSchema = z.object({
  idQuestion: z.string().uuid('ID Question tidak valid'),
  optionText: z
    .string()
    .min(1, 'Teks opsi harus diisi')
    .max(300, 'Teks opsi maksimal 300 karakter'),
  optionValue: z
    .string()
    .max(100, 'Nilai opsi maksimal 100 karakter')
    .optional(),
  orderNumber: z.number().int().positive('Order number harus positif'),
});

export type CreateOptionDto = z.infer<typeof CreateOptionSchema>;

export const UpdateOptionSchema = z.object({
  optionText: z
    .string()
    .min(1, 'Teks opsi harus diisi')
    .max(300, 'Teks opsi maksimal 300 karakter')
    .optional(),
  optionValue: z
    .string()
    .max(100, 'Nilai opsi maksimal 100 karakter')
    .optional(),
  orderNumber: z
    .number()
    .int()
    .positive('Order number harus positif')
    .optional(),
});

export type UpdateOptionDto = z.infer<typeof UpdateOptionSchema>;

export const BulkCreateOptionsSchema = z.object({
  idQuestion: z.string().uuid('ID Question tidak valid'),
  options: z
    .array(
      z.object({
        optionText: z.string().min(1).max(300),
        optionValue: z.string().max(100).optional(),
        orderNumber: z.number().int().positive(),
      }),
    )
    .min(1, 'Minimal 1 opsi harus diisi'),
});

export type BulkCreateOptionsDto = z.infer<typeof BulkCreateOptionsSchema>;

// Schema untuk Reorder Options
export const ReorderOptionsSchema = z.object({
  options: z
    .array(
      z.object({
        idOption: z.string().uuid(),
        orderNumber: z.number().int().positive(),
      }),
    )
    .min(1),
});

export type ReorderOptionsDto = z.infer<typeof ReorderOptionsSchema>;
