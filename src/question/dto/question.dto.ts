/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

export const QUESTION_TYPES = [
  'text',
  'textarea',
  'number',
  'email',
  'date',
  'radio',
  'checkbox',
  'select',
  'rating',
] as const;

// Schema Opsi
const OptionSchema = z.object({
  optionText: z.string().min(1, 'Teks opsi harus diisi').max(300),
  optionValue: z.string().max(100).optional(),
  orderNumber: z.number().int().positive(),
});

export const CreateQuestionSchema = z.object({
  idForm: z.string().uuid('ID Form tidak valid'),
  nameQuestion: z.string().min(1).max(500),
  questionType: z.enum(QUESTION_TYPES),
  isRequired: z.boolean().optional().default(false),
  orderNumber: z.number().int().positive(),
  options: z.array(OptionSchema).optional(),
});

export type CreateQuestionDto = z.infer<typeof CreateQuestionSchema>;

// --- BULK CREATE ---
export const BulkCreateQuestionsSchema = z.object({
  idForm: z.string().uuid('ID Form tidak valid'),
  questions: z.array(CreateQuestionSchema.omit({ idForm: true })).min(1),
});

// PASTIKAN BARIS INI ADA (Ini yang menyebabkan error ts 2724 tadi)
export type BulkCreateQuestionsDto = z.infer<typeof BulkCreateQuestionsSchema>;

// --- UPDATE ---
export const UpdateQuestionSchema = CreateQuestionSchema.partial().omit({
  idForm: true,
});
export type UpdateQuestionDto = z.infer<typeof UpdateQuestionSchema>;

// --- REORDER ---
export const ReorderQuestionsSchema = z.object({
  // Gunakan nama 'questions' agar sesuai dengan kode logic Service Anda saat ini
  questions: z
    .array(
      z.object({
        idQuestion: z.string().uuid(),
        orderNumber: z.number().int().positive(),
      }),
    )
    .min(1),
});

export type ReorderQuestionsDto = z.infer<typeof ReorderQuestionsSchema>;
