/* eslint-disable prettier/prettier */
import { z } from 'zod';
import {
  StatusWawancara,
  JenisWawancara,
} from '../model/blacklist-wawancara.model';


const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

// ============================================
// CREATE WAWANCARA SCHEMA
// ============================================
export const CreateWawancaraSchema = z
  .object({
    idPewawancara: z.string().uuid('ID pewawancara harus UUID'),
    idPeserta: z.string().uuid('ID peserta harus UUID'),
    jenisWawancara: z
      .nativeEnum(JenisWawancara)
      .refine((v) => Object.values(JenisWawancara).includes(v), {
        message: 'Jenis wawancara tidak valid',
      }),
    tanggalWawancara: z
      .string()
      .regex(DATE_REGEX, 'Format tanggal harus YYYY-MM-DD')
      .refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      }, 'Tanggal tidak valid'),
    jamWawancara: z
      .string()
      .regex(TIME_REGEX, 'Format jam harus HH:MM (00:00 - 23:59)'),
    lokasi: z.string().max(255, 'Lokasi maksimal 255 karakter').optional(),
    linkOnline: z.string().max(500, 'Link maksimal 500 karakter').optional(),
    catatan: z.string().optional(),
    status: z
      .nativeEnum(StatusWawancara)
      .default(StatusWawancara.SCHEDULED)
      .optional(),
  })
  .refine(
    (data) => {
      // Pewawancara dan peserta tidak boleh sama
      return data.idPewawancara !== data.idPeserta;
    },
    {
      message: 'Pewawancara dan peserta tidak boleh sama',
      path: ['idPeserta'],
    },
  );

// ============================================
// UPDATE WAWANCARA SCHEMA
// ============================================
export const UpdateWawancaraSchema = z.object({
  tanggalWawancara: z
    .string()
    .regex(DATE_REGEX, 'Format tanggal harus YYYY-MM-DD')
    .optional(),
  jamWawancara: z
    .string()
    .regex(TIME_REGEX, 'Format jam harus HH:MM')
    .optional(),
  lokasi: z.string().max(255).optional(),
  linkOnline: z.string().max(500).optional(),
  catatan: z.string().optional(),
  hasil: z.string().optional(),
  nilaiHasil: z.number().int().min(1).max(10).optional(),
  status: z.nativeEnum(StatusWawancara).optional(),
});

// ============================================
// FILTER WAWANCARA SCHEMA
// ============================================
export const FilterWawancaraSchema = z.object({
  status: z.nativeEnum(StatusWawancara).optional(),
  jenisWawancara: z.nativeEnum(JenisWawancara).optional(),
  idPewawancara: z.string().uuid().optional(),
  idPeserta: z.string().uuid().optional(),
  tanggalMulai: z.string().regex(DATE_REGEX).optional(),
  tanggalAkhir: z.string().regex(DATE_REGEX).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
  sortBy: z
    .enum(['tanggalWawancara', 'createdAt'])
    .default('tanggalWawancara')
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  includeRelations: z.boolean().default(true).optional(),
});

// ============================================
// COMPLETE WAWANCARA SCHEMA
// ============================================
export const CompleteWawancaraSchema = z.object({
  hasil: z.string().min(10, 'Hasil minimal 10 karakter'),
  nilaiHasil: z.number().int().min(1).max(10),
});

export type CreateWawancaraInput = z.infer<typeof CreateWawancaraSchema>;
export type UpdateWawancaraInput = z.infer<typeof UpdateWawancaraSchema>;
export type FilterWawancaraInput = z.infer<typeof FilterWawancaraSchema>;
export type CompleteWawancaraInput = z.infer<typeof CompleteWawancaraSchema>;


export function validateCreateWawancara(data: unknown): CreateWawancaraInput {
  return CreateWawancaraSchema.parse(data);
}

export function validateUpdateWawancara(data: unknown): UpdateWawancaraInput {
  return UpdateWawancaraSchema.parse(data);
}

export function validateFilterWawancara(data: unknown): FilterWawancaraInput {
  return FilterWawancaraSchema.parse(data);
}

export function validateCompleteWawancara(
  data: unknown,
): CompleteWawancaraInput {
  return CompleteWawancaraSchema.parse(data);
}
