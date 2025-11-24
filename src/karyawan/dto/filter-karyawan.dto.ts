import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StatusKaryawan, JenisKelamin } from '../../model/karyawan.model';

export class FilterKaryawanDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: StatusKaryawan,
    example: StatusKaryawan.AKTIF,
  })
  @IsOptional()
  @IsEnum(StatusKaryawan)
  status?: StatusKaryawan;

  @ApiPropertyOptional({
    description: 'Filter by status keaktifan',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  statusKeaktifan?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by departemen (UUID)',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4')
  idDepartemen?: string;

  @ApiPropertyOptional({
    description: 'Filter by jabatan (UUID)',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4')
  idJabatan?: string;

  @ApiPropertyOptional({
    description: 'Filter by jenis kelamin',
    enum: JenisKelamin,
    example: JenisKelamin.L,
  })
  @IsOptional()
  @IsEnum(JenisKelamin)
  jenisKelamin?: JenisKelamin;

  @ApiPropertyOptional({
    description: 'Search by nama, NIK, or email',
    type: String,
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    type: Number,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    type: Number,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['nama', 'tanggalMasuk', 'createdAt'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['nama', 'tanggalMasuk', 'createdAt'])
  sortBy?: 'nama' | 'tanggalMasuk' | 'createdAt' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Include full relations (jabatan, departemen, atasan)',
    type: Boolean,
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeRelations?: boolean = false;
}
