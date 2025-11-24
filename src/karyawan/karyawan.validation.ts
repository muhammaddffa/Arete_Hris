import { z } from 'zod';
import {
  StatusKaryawan,
  JenisKelamin,
  StatusPernikahan,
} from '../model/karyawan.model';

const NIK_REGEX = /^\d{16}$/;
const NPWP_REGEX = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$|^\d{15}$/;
const PHONE_REGEX = /^(\+62|62|0)[0-9]{9,12}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Helper: Validate YYYY-MM-DD date format
const dateStringSchema = z
  .string()
  .regex(DATE_REGEX, 'Format tanggal harus YYYY-MM-DD (contoh: 1995-05-15)')
  .refine(
    (dateStr) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    },
    { message: 'Tanggal tidak valid' },
  );

// ============================================
// CREATE SCHEMA
// ============================================

export const CreateKaryawanSchema = z
  .object({
    // Optional Fields
    nik: z.string().regex(NIK_REGEX, 'NIK harus 16 digit angka').optional(),

    npwp: z.string().regex(NPWP_REGEX, 'Format NPWP tidak valid').optional(),

    skck: z.string().optional(),

    suratKesehatan: z.string().optional(),

    cv: z.string().optional(),

    pasfoto: z.string().optional(),

    email: z.string().regex(EMAIL_REGEX, 'Format email tidak valid').optional(),

    alamat: z.string().max(500, 'Alamat maksimal 500 karakter').optional(),

    namaBank: z.string().max(50, 'Nama bank maksimal 50 karakter').optional(),

    nomorRekening: z
      .string()
      .max(50, 'Nomor rekening maksimal 50 karakter')
      .optional(),

    statusKeaktifan: z
      .boolean()
      .or(z.string().transform((val) => val === 'true'))
      .default(true)
      .optional(),

    tanggalResign: dateStringSchema.optional(),

    status: z
      .nativeEnum(StatusKaryawan)
      .default(StatusKaryawan.CANDIDATE)
      .optional(),

    // Required Fields
    nama: z
      .string()
      .min(3, 'Nama minimal 3 karakter')
      .max(100, 'Nama maksimal 100 karakter'),

    tempatLahir: z
      .string()
      .min(3, 'Tempat lahir minimal 3 karakter')
      .max(100, 'Tempat lahir maksimal 100 karakter'),

    tanggalLahir: dateStringSchema.refine(
      (dateStr) => {
        const birthDate = new Date(dateStr);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return age >= 17;
      },
      { message: 'Karyawan harus berusia minimal 17 tahun' },
    ),

    jenisKelamin: z.nativeEnum(JenisKelamin, {
      error: 'Jenis kelamin harus L atau P',
    }),

    statusPernikahan: z.nativeEnum(StatusPernikahan),

    agama: z.string().max(20, 'Agama maksimal 20 karakter'),

    noHpPribadi: z.string().regex(PHONE_REGEX, 'Format nomor HP tidak valid'),

    idJabatan: z.string().uuid('ID jabatan harus UUID'),

    tanggalMasuk: dateStringSchema,
  })
  .refine(
    (data) => {
      // Validate tanggalResign harus setelah tanggalMasuk
      if (data.tanggalResign && data.tanggalMasuk) {
        const masuk = new Date(data.tanggalMasuk);
        const resign = new Date(data.tanggalResign);
        return resign > masuk;
      }
      return true;
    },
    {
      message: 'Tanggal resign harus setelah tanggal masuk',
      path: ['tanggalResign'],
    },
  );

// ============================================
// UPDATE SCHEMA
// ============================================

export const UpdateKaryawanSchema = z
  .object({
    nik: z.string().regex(NIK_REGEX, 'NIK harus 16 digit angka').optional(),

    npwp: z.string().regex(NPWP_REGEX, 'Format NPWP tidak valid').optional(),

    skck: z.string().optional(),

    suratKesehatan: z.string().optional(),

    cv: z.string().optional(),

    nama: z
      .string()
      .min(3, 'Nama minimal 3 karakter')
      .max(100, 'Nama maksimal 100 karakter')
      .optional(),

    tempatLahir: z
      .string()
      .min(3, 'Tempat lahir minimal 3 karakter')
      .max(100, 'Tempat lahir maksimal 100 karakter')
      .optional(),

    tanggalLahir: dateStringSchema.optional(),

    jenisKelamin: z.nativeEnum(JenisKelamin).optional(),

    statusPernikahan: z.nativeEnum(StatusPernikahan).optional(),

    pasfoto: z.string().optional(),

    agama: z.string().max(20, 'Agama maksimal 20 karakter').optional(),

    noHpPribadi: z
      .string()
      .regex(PHONE_REGEX, 'Format nomor HP tidak valid')
      .optional(),

    email: z.string().regex(EMAIL_REGEX, 'Format email tidak valid').optional(),

    alamat: z.string().max(500, 'Alamat maksimal 500 karakter').optional(),

    idJabatan: z.string().uuid('ID jabatan harus UUID').optional(),

    namaBank: z.string().max(50, 'Nama bank maksimal 50 karakter').optional(),

    nomorRekening: z
      .string()
      .max(50, 'Nomor rekening maksimal 50 karakter')
      .optional(),

    statusKeaktifan: z
      .boolean()
      .or(z.string().transform((val) => val === 'true'))
      .optional(),

    tanggalMasuk: dateStringSchema.optional(),

    tanggalResign: dateStringSchema.optional(),

    status: z.nativeEnum(StatusKaryawan).optional(),
  })
  .refine(
    (data) => {
      // Validate tanggalResign harus setelah tanggalMasuk jika keduanya ada
      if (data.tanggalResign && data.tanggalMasuk) {
        const masuk = new Date(data.tanggalMasuk);
        const resign = new Date(data.tanggalResign);
        return resign > masuk;
      }
      return true;
    },
    {
      message: 'Tanggal resign harus setelah tanggal masuk',
      path: ['tanggalResign'],
    },
  );

// ============================================
// FILTER SCHEMA
// ============================================

export const FilterKaryawanSchema = z.object({
  status: z.nativeEnum(StatusKaryawan).optional(),

  statusKeaktifan: z
    .boolean()
    .or(z.string().transform((val) => val === 'true'))
    .optional(),

  idDepartemen: z.string().uuid('ID departemen harus UUID').optional(),

  idJabatan: z.string().uuid('ID jabatan harus UUID').optional(),

  jenisKelamin: z.nativeEnum(JenisKelamin).optional(),

  search: z.string().optional(),

  page: z
    .number()
    .int()
    .min(1, 'Page minimal 1')
    .or(z.string().transform((val) => parseInt(val, 10)))
    .default(1)
    .optional(),

  limit: z
    .number()
    .int()
    .min(1, 'Limit minimal 1')
    .max(100, 'Limit maksimal 100')
    .or(z.string().transform((val) => parseInt(val, 10)))
    .default(10)
    .optional(),

  sortBy: z
    .enum(['nama', 'tanggalMasuk', 'createdAt'])
    .default('createdAt')
    .optional(),

  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),

  includeRelations: z
    .boolean()
    .or(z.string().transform((val) => val === 'true'))
    .default(false)
    .optional(),
});

// ============================================
// RESIGN SCHEMA
// ============================================

export const ResignKaryawanSchema = z.object({
  tanggalResign: dateStringSchema.optional().refine(
    (dateStr) => {
      if (dateStr) {
        const resignDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for date-only comparison
        resignDate.setHours(0, 0, 0, 0);
        return resignDate <= today;
      }
      return true;
    },
    { message: 'Tanggal resign tidak boleh di masa depan' },
  ),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateKaryawanInput = z.infer<typeof CreateKaryawanSchema>;
export type UpdateKaryawanInput = z.infer<typeof UpdateKaryawanSchema>;
export type FilterKaryawanInput = z.infer<typeof FilterKaryawanSchema>;
export type ResignKaryawanInput = z.infer<typeof ResignKaryawanSchema>;

export function validateCreateKaryawan(data: unknown): CreateKaryawanInput {
  return CreateKaryawanSchema.parse(data);
}

export function validateUpdateKaryawan(data: unknown): UpdateKaryawanInput {
  return UpdateKaryawanSchema.parse(data);
}

export function validateFilterKaryawan(data: unknown): FilterKaryawanInput {
  return FilterKaryawanSchema.parse(data);
}

export function validateResignKaryawan(data: unknown): ResignKaryawanInput {
  return ResignKaryawanSchema.parse(data);
}

export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}
