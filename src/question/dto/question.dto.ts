/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

// Schema untuk Create Question
const QUESTION_TYPES = [
  'text',
  'single_choice',
  'multiple_choice',
  'rating',
  'textarea',
] as const;

export const CreateQuestionSchema = z.object({
  idForm: z.string().uuid('ID Form tidak valid'),
  nameQuestion: z
    .string()
    .min(1, 'Pertanyaan harus diisi')
    .max(500, 'Pertanyaan maksimal 500 karakter'),

  questionType: z.enum(QUESTION_TYPES, {
    message: 'Tipe pertanyaan tidak valid',
  }),

  isRequired: z.boolean().optional().default(false),
  orderNumber: z.number().int().positive('Order number harus positif'),

  options: z
    .array(
      z.object({
        optionText: z.string().min(1, 'Teks opsi harus diisi').max(300),
        optionValue: z.string().max(100).optional(),
        orderNumber: z.number().int().positive(),
      }),
    )
    .optional(),
});

export type CreateQuestionDto = z.infer<typeof CreateQuestionSchema>;

// Schema untuk Update Question
export const UpdateQuestionSchema = z.object({
  nameQuestion: z
    .string()
    .min(1, 'Pertanyaan harus diisi')
    .max(500, 'Pertanyaan maksimal 500 karakter')
    .optional(),
  questionType: z
    .enum(['text', 'single_choice', 'multiple_choice', 'rating', 'textarea'])
    .optional(),
  isRequired: z.boolean().optional(),
  orderNumber: z
    .number()
    .int()
    .positive('Order number harus positif')
    .optional(),
});

export type UpdateQuestionDto = z.infer<typeof UpdateQuestionSchema>;

// Schema untuk Bulk Create Questions
export const BulkCreateQuestionsSchema = z.object({
  idForm: z.string().uuid('ID Form tidak valid'),
  questions: z
    .array(
      z.object({
        nameQuestion: z.string().min(1).max(500),
        questionType: z.enum([
          'text',
          'single_choice',
          'multiple_choice',
          'rating',
          'textarea',
        ]),
        isRequired: z.boolean().optional().default(false),
        orderNumber: z.number().int().positive(),
        options: z
          .array(
            z.object({
              optionText: z.string().min(1).max(300),
              optionValue: z.string().max(100).optional(),
              orderNumber: z.number().int().positive(),
            }),
          )
          .optional(),
      }),
    )
    .min(1, 'Minimal 1 pertanyaan harus diisi'),
});

export type BulkCreateQuestionsDto = z.infer<typeof BulkCreateQuestionsSchema>;

// Schema untuk Reorder Questions
export const ReorderQuestionsSchema = z.object({
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
