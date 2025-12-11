import {
  IsString,
  IsOptional,
  MaxLength,
  IsNotEmpty,
  Min,
  Max,
  IsBoolean,
  IsEnum,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Nama departemen',
    example: 'Human Resources',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  namaDepartemen: string;

  @ApiPropertyOptional({
    description: 'Deskripsi departemen',
    example: 'Departemen yang menangani sumber daya manusia',
  })
  @IsString()
  @IsOptional()
  deskripsi?: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({
    description: 'Nama departemen',
    example: 'Human Resources',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  namaDepartemen?: string;

  @ApiPropertyOptional({
    description: 'Deskripsi departemen',
    example: 'Departemen yang menangani sumber daya manusia',
  })
  @IsString()
  @IsOptional()
  deskripsi?: string;
}

export class QueryDepartmentDto {
  @ApiPropertyOptional({
    description: 'Search by nama departemen',
    example: 'HR',
    type: String,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Include relations (count jabatan)',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeRelations?: boolean = false;

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
    enum: ['namaDepartemen', 'createdAt'],
    default: 'createdAt',
  })
  @IsString()
  @IsEnum(['namaDepartemen', 'createdAt'])
  @IsOptional()
  sortBy?: 'namaDepartemen' | 'createdAt' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class DepartmentCountDto {
  @ApiProperty({ example: 5 })
  jabatan: number;
}

export class DepartmentResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  idDepartemen: string;

  @ApiProperty({ example: 'Human Resources' })
  namaDepartemen: string;

  @ApiProperty({ example: 'Departemen HR', nullable: true })
  deskripsi: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: DepartmentCountDto })
  _count?: DepartmentCountDto;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 25, description: 'Total items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 3, description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPrevPage: boolean;
}

export class PaginatedDepartmentResponseDto {
  @ApiProperty({ type: [DepartmentResponseDto] })
  data: DepartmentResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class DepartmentStatsDto {
  @ApiProperty({ example: 5 })
  totalJabatan: number;

  @ApiProperty({ example: 25 })
  totalKaryawanAktif: number;
}

export class DepartmentWithStatsDto extends DepartmentResponseDto {
  @ApiProperty({ type: DepartmentStatsDto })
  stats: DepartmentStatsDto;
}

export class BulkDeleteDepartmentDto {
  @ApiProperty({
    description: 'Array of department IDs to delete',
    example: ['uuid1', 'uuid2', 'uuid3'],
    type: [String],
  })
  @IsNotEmpty()
  ids: string[];
}
