import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateJabatanDto {
  @ApiProperty({
    description: 'Nama jabatan',
    example: 'Software Engineer',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  namaJabatan: string;

  @ApiProperty({
    description: 'ID Departemen (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  idDepartemen: string;

  @ApiPropertyOptional({
    description: 'Deskripsi jabatan',
    example: 'Bertanggung jawab untuk develop aplikasi',
  })
  @IsString()
  @IsOptional()
  deskripsiJabatan?: string;

  @ApiPropertyOptional({
    description: 'Status jabatan (aktif/tidak aktif)',
    example: true,
    default: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class UpdateJabatanDto {
  @ApiPropertyOptional({
    description: 'Nama jabatan',
    example: 'Senior Software Engineer',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  namaJabatan?: string;

  @ApiPropertyOptional({
    description: 'ID Departemen (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  idDepartemen?: string;

  @ApiPropertyOptional({
    description: 'Deskripsi jabatan',
    example: 'Bertanggung jawab untuk develop aplikasi',
  })
  @IsString()
  @IsOptional()
  deskripsiJabatan?: string;

  @ApiPropertyOptional({
    description: 'Status jabatan (aktif/tidak aktif)',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class QueryJabatanDto {
  @ApiPropertyOptional({
    description: 'Search by nama jabatan',
    example: 'Engineer',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by department ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  idDepartemen?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}

export class JabatanResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  idJabatan: string;

  @ApiProperty({ example: 'Software Engineer' })
  namaJabatan: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  idDepartemen: string;

  @ApiProperty({ example: 'Bertanggung jawab untuk develop aplikasi' })
  deskripsiJabatan: string | null;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  departemen?: {
    idDepartemen: string;
    namaDepartemen: string;
    roleDefault: {
      idRole: number;
      namaRole: string;
    };
  };

  @ApiPropertyOptional()
  _count?: {
    karyawan: number;
  };
}
