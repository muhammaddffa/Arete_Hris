import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  StatusKaryawan,
  JenisKelamin,
  StatusPernikahan,
} from '../../model/karyawan.model';

export class CreateKaryawanDto {
  @ApiPropertyOptional({
    description: 'NIK (16 digit)',
    example: '3201012345678901',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{16}$/, { message: 'NIK harus 16 digit angka' })
  nik?: string;

  @ApiPropertyOptional({ description: 'NPWP', example: '12.345.678.9-012.345' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$|^\d{15}$/, {
    message: 'Format NPWP tidak valid',
  })
  npwp?: string;

  @ApiPropertyOptional({ description: 'Path file SKCK' })
  @IsOptional()
  @IsString()
  skck?: string;

  @ApiPropertyOptional({ description: 'Path file Surat Kesehatan' })
  @IsOptional()
  @IsString()
  suratKesehatan?: string;

  @ApiPropertyOptional({ description: 'Path file CV' })
  @IsOptional()
  @IsString()
  cv?: string;

  @ApiProperty({ description: 'Nama lengkap', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Nama minimal 3 karakter' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  nama: string;

  @ApiProperty({ description: 'Tempat lahir', example: 'Jakarta' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  tempatLahir: string;

  @ApiProperty({
    description: 'Tanggal lahir (format: YYYY-MM-DD)',
    example: '1995-05-15',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Format tanggal harus YYYY-MM-DD (contoh: 1995-05-15)',
  })
  tanggalLahir: string;

  @ApiProperty({
    description: 'Jenis kelamin',
    enum: JenisKelamin,
    example: 'L',
  })
  @IsNotEmpty()
  @IsEnum(JenisKelamin, { message: 'Jenis kelamin harus L atau P' })
  jenisKelamin: JenisKelamin;

  @ApiProperty({
    description: 'Status pernikahan',
    enum: StatusPernikahan,
    example: 'belum_menikah',
  })
  @IsNotEmpty()
  @IsEnum(StatusPernikahan)
  statusPernikahan: StatusPernikahan;

  @ApiPropertyOptional({ description: 'Path file pasfoto' })
  @IsOptional()
  @IsString()
  pasfoto?: string;

  @ApiProperty({ description: 'Agama', example: 'Islam' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  agama: string;

  @ApiProperty({ description: 'Nomor HP', example: '081234567890' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(\+62|62|0)[0-9]{9,12}$/, {
    message: 'Format nomor HP tidak valid',
  })
  noHpPribadi: string;

  @ApiPropertyOptional({ description: 'Email', example: 'john@example.com' })
  @IsOptional()
  @IsString()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'Format email tidak valid',
  })
  email?: string;

  @ApiPropertyOptional({ description: 'Alamat lengkap' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  alamat?: string;

  @ApiProperty({
    description: 'ID Jabatan (UUID)',
    example: '8f441169-d10b-4a7c-9837-fc1eccc5c7c3',
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'ID jabatan harus UUID' })
  idJabatan: string;

  @ApiPropertyOptional({ description: 'Nama bank', example: 'BCA' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  namaBank?: string;

  @ApiPropertyOptional({ description: 'Nomor rekening', example: '1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nomorRekening?: string;

  @ApiPropertyOptional({ description: 'Status keaktifan', default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  statusKeaktifan?: boolean = true;

  @ApiProperty({
    description: 'Tanggal masuk (format: YYYY-MM-DD)',
    example: '2024-01-15',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Format tanggal harus YYYY-MM-DD (contoh: 2024-01-15)',
  })
  tanggalMasuk: string;

  @ApiPropertyOptional({
    description: 'Tanggal resign (format: YYYY-MM-DD)',
    example: '2024-12-31',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Format tanggal harus YYYY-MM-DD (contoh: 2024-12-31)',
  })
  tanggalResign?: string;

  @ApiPropertyOptional({
    description: 'Status karyawan',
    enum: StatusKaryawan,
    default: StatusKaryawan.CANDIDATE,
  })
  @IsOptional()
  @IsEnum(StatusKaryawan)
  status?: StatusKaryawan = StatusKaryawan.CANDIDATE;
}
