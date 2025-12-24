import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

// Schema untuk Create Single Answer
export const CreateAnswerSchema = z
  .object({
    idForm: z.string().uuid('ID Form tidak valid'),
    idQuestion: z.string().uuid('ID Question tidak valid'),
    idKaryawan: z.string().uuid('ID Karyawan tidak valid'),
    idOption: z.string().uuid('ID Option tidak valid').optional(),
    textAnswer: z.string().optional(),
  })
  .refine((data) => data.idOption || data.textAnswer, {
    message: 'Harus diisi idOption atau textAnswer',
  });

export type CreateAnswerDto = z.infer<typeof CreateAnswerSchema>;

// Schema untuk Submit Form (Bulk Answer)
export const SubmitFormSchema = z.object({
  idForm: z.string().uuid('ID Form tidak valid'),
  idKaryawan: z.string().uuid('ID Karyawan tidak valid'),
  answers: z
    .array(
      z
        .object({
          idQuestion: z.string().uuid('ID Question tidak valid'),
          idOption: z.string().uuid('ID Option tidak valid').optional(),
          textAnswer: z.string().optional(),
        })
        .refine((data) => data.idOption || data.textAnswer, {
          message: 'Harus diisi idOption atau textAnswer',
        }),
    )
    .min(1, 'Minimal 1 jawaban harus diisi'),
});

export type SubmitFormDto = z.infer<typeof SubmitFormSchema>;

// Schema untuk Update Answer
export const UpdateAnswerSchema = z
  .object({
    idOption: z.string().uuid('ID Option tidak valid').optional(),
    textAnswer: z.string().optional(),
  })
  .refine(
    (data) => data.idOption !== undefined || data.textAnswer !== undefined,
    {
      message: 'Harus diisi idOption atau textAnswer',
    },
  );

export type UpdateAnswerDto = z.infer<typeof UpdateAnswerSchema>;

// DTO untuk Filter dengan class
export class FilterAnswerDto {
  @ApiProperty({ required: false, default: 1 })
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  limit?: number = 10;

  @ApiProperty({ required: false })
  idForm?: string;

  @ApiProperty({ required: false })
  idQuestion?: string;

  @ApiProperty({ required: false })
  idKaryawan?: string;

  @ApiProperty({ required: false, default: 'createdAt' })
  sortBy?: string = 'createdAt';

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// Schema untuk Export Answers
export const ExportAnswersSchema = z.object({
  idForm: z.string().uuid('ID Form tidak valid'),
  format: z.enum(['json', 'csv']).optional().default('json'),
});

export type ExportAnswersDto = z.infer<typeof ExportAnswersSchema>;
