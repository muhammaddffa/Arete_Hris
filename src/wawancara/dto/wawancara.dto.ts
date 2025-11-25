import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  StatusWawancara,
  JenisWawancara,
} from '../../model/blacklist-wawancara.model';

// ============================================
// CREATE DTO
// ============================================
export class CreateWawancaraDto {
  @ApiProperty({
    description: 'ID Pewawancara (Karyawan yang mewawancarai)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID('4')
  idPewawancara: string;

  @ApiProperty({
    description: 'ID Peserta (Candidate yang diwawancarai)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty()
  @IsUUID('4')
  idPeserta: string;

  @ApiProperty({
    description: 'Jenis wawancara',
    enum: JenisWawancara,
    example: JenisWawancara.HRD,
  })
  @IsNotEmpty()
  @IsEnum(JenisWawancara)
  jenisWawancara: JenisWawancara;

  @ApiProperty({
    description: 'Tanggal wawancara (YYYY-MM-DD)',
    example: '2024-12-25',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Format tanggal harus YYYY-MM-DD',
  })
  tanggalWawancara: string;

  @ApiProperty({
    description: 'Jam wawancara (HH:MM)',
    example: '09:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format jam harus HH:MM (00:00 - 23:59)',
  })
  jamWawancara: string;

  @ApiPropertyOptional({
    description: 'Lokasi wawancara',
    example: 'Ruang Meeting Lt. 3',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lokasi?: string;

  @ApiPropertyOptional({
    description: 'Link meeting online (Zoom, Google Meet, dll)',
    example: 'https://zoom.us/j/1234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkOnline?: string;

  @ApiPropertyOptional({
    description: 'Catatan untuk wawancara',
  })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiPropertyOptional({
    description: 'Status wawancara',
    enum: StatusWawancara,
    default: StatusWawancara.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(StatusWawancara)
  status?: StatusWawancara = StatusWawancara.SCHEDULED;
}

// ============================================
// UPDATE DTO
// ============================================
export class UpdateWawancaraDto {
  @ApiPropertyOptional({
    description: 'Tanggal wawancara (YYYY-MM-DD)',
    example: '2024-12-25',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Format tanggal harus YYYY-MM-DD',
  })
  tanggalWawancara?: string;

  @ApiPropertyOptional({
    description: 'Jam wawancara (HH:MM)',
    example: '09:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format jam harus HH:MM',
  })
  jamWawancara?: string;

  @ApiPropertyOptional({
    description: 'Lokasi wawancara',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lokasi?: string;

  @ApiPropertyOptional({
    description: 'Link meeting online',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkOnline?: string;

  @ApiPropertyOptional({
    description: 'Catatan untuk wawancara',
  })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiPropertyOptional({
    description: 'Hasil wawancara',
  })
  @IsOptional()
  @IsString()
  hasil?: string;

  @ApiPropertyOptional({
    description: 'Nilai hasil wawancara (1-10)',
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  nilaiHasil?: number;

  @ApiPropertyOptional({
    description: 'Status wawancara',
    enum: StatusWawancara,
  })
  @IsOptional()
  @IsEnum(StatusWawancara)
  status?: StatusWawancara;
}

// ============================================
// FILTER/QUERY DTO
// ============================================
export class FilterWawancaraDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: StatusWawancara,
  })
  @IsOptional()
  @IsEnum(StatusWawancara)
  status?: StatusWawancara;

  @ApiPropertyOptional({
    description: 'Filter by jenis wawancara',
    enum: JenisWawancara,
  })
  @IsOptional()
  @IsEnum(JenisWawancara)
  jenisWawancara?: JenisWawancara;

  @ApiPropertyOptional({
    description: 'Filter by pewawancara ID',
    type: String,
  })
  @IsOptional()
  @IsUUID('4')
  idPewawancara?: string;

  @ApiPropertyOptional({
    description: 'Filter by peserta ID',
    type: String,
  })
  @IsOptional()
  @IsUUID('4')
  idPeserta?: string;

  @ApiPropertyOptional({
    description: 'Filter tanggal mulai (YYYY-MM-DD)',
    type: String,
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  tanggalMulai?: string;

  @ApiPropertyOptional({
    description: 'Filter tanggal akhir (YYYY-MM-DD)',
    type: String,
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  tanggalAkhir?: string;

  @ApiPropertyOptional({
    description: 'Search by peserta name',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    type: Number,
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    type: Number,
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['tanggalWawancara', 'createdAt'],
    default: 'tanggalWawancara',
  })
  @IsString()
  @IsEnum(['tanggalWawancara', 'createdAt'])
  @IsOptional()
  sortBy?: 'tanggalWawancara' | 'createdAt' = 'tanggalWawancara';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Include relations',
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeRelations?: boolean = true;
}

// ============================================
// COMPLETE WAWANCARA DTO
// ============================================
export class CompleteWawancaraDto {
  @ApiProperty({
    description: 'Hasil wawancara',
  })
  @IsNotEmpty()
  @IsString()
  hasil: string;

  @ApiProperty({
    description: 'Nilai hasil wawancara (1-10)',
    minimum: 1,
    maximum: 10,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  nilaiHasil: number;
}

// ============================================
// RESPONSE DTOs
// ============================================
export class WawancaraResponseDto {
  @ApiProperty()
  idWawancara: string;

  @ApiProperty()
  idPewawancara: string;

  @ApiProperty()
  idPeserta: string;

  @ApiProperty({ enum: JenisWawancara })
  jenisWawancara: JenisWawancara;

  @ApiProperty()
  tanggalWawancara: Date;

  @ApiProperty()
  jamWawancara: string;

  @ApiPropertyOptional()
  lokasi?: string;

  @ApiPropertyOptional()
  linkOnline?: string;

  @ApiPropertyOptional()
  catatan?: string;

  @ApiPropertyOptional()
  hasil?: string;

  @ApiPropertyOptional()
  nilaiHasil?: number;

  @ApiProperty({ enum: StatusWawancara })
  status: StatusWawancara;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginationMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginatedWawancaraResponseDto {
  @ApiProperty({ type: [WawancaraResponseDto] })
  data: WawancaraResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
