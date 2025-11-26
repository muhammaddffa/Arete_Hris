import { IsNotEmpty, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsIn, IsNumber } from 'class-validator';

export class CreateKaryawanJadwalDto {
  @ApiProperty({ example: 'uuid-karyawan', description: 'ID Karyawan (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  idKaryawan: string;

  @ApiProperty({
    example: 'uuid-jadwal',
    description: 'ID Jadwal Kerja (UUID)',
  })
  @IsUUID()
  @IsNotEmpty()
  idJadwal: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Tanggal mulai efektif jadwal',
  })
  @IsDateString()
  @IsNotEmpty()
  tanggalMulaiEfektif: string;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Tanggal selesai efektif jadwal (optional)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  tanggalSelesaiEfektif?: string;
}

export class UpdateKaryawanJadwalDto {
  @ApiProperty({ example: 'uuid-jadwal', required: false })
  @IsUUID()
  @IsOptional()
  idJadwal?: string;

  @ApiProperty({ example: '2025-01-01', required: false })
  @IsDateString()
  @IsOptional()
  tanggalMulaiEfektif?: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsDateString()
  @IsOptional()
  tanggalSelesaiEfektif?: string;
}

export class QueryKaryawanJadwalDto {
  @ApiPropertyOptional({
    description: 'Search by nama karyawan',
    example: 'Budi',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder: 'asc' | 'desc' = 'desc';
}
