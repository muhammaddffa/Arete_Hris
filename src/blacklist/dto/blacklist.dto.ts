import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ============================================
// CREATE DTO
// ============================================
export class CreateBlacklistDto {
  @ApiProperty({
    description: 'ID Karyawan yang akan diblacklist (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID('4')
  idKaryawan: string;

  @ApiProperty({
    description: 'Alasan blacklist',
    example: 'Melakukan pelanggaran berat',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  alasan: string;
}

// ============================================
// UPDATE DTO
// ============================================
export class UpdateBlacklistDto {
  @ApiPropertyOptional({
    description: 'Alasan blacklist',
    example: 'Melakukan pelanggaran berat',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  alasan?: string;

  @ApiPropertyOptional({
    description: 'Path pasfoto',
  })
  @IsOptional()
  @IsString()
  pasfoto?: string;
}

// ============================================
// FILTER/QUERY DTO
// ============================================
export class FilterBlacklistDto {
  @ApiPropertyOptional({
    description: 'Search by nama or NIK',
    type: String,
    example: 'John',
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
    enum: ['nama', 'nik', 'createdAt'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsString()
  @IsEnum(['nama', 'nik', 'createdAt'])
  @IsOptional()
  sortBy?: 'nama' | 'nik' | 'createdAt' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsString()
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Include karyawan relations',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeRelations?: boolean = false;
}

// ============================================
// RESPONSE DTOs
// ============================================
export class BlacklistResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  idBlacklist: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  idKaryawan: string;

  @ApiProperty({ example: '3201012345678901' })
  nik: string;

  @ApiProperty({ example: 'John Doe' })
  nama: string;

  @ApiPropertyOptional({ example: 'https://cloudinary.com/...' })
  pasfoto?: string;

  @ApiProperty({ example: 'Melakukan pelanggaran berat' })
  alasan: string;

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

export class PaginatedBlacklistResponseDto {
  @ApiProperty({ type: [BlacklistResponseDto] })
  data: BlacklistResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
