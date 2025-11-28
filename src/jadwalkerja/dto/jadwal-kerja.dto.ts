import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsOptional,
  Matches,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateJadwalKerjaDto {
  @ApiProperty({ example: 'JDW-001', description: 'Kode unik jadwal kerja' })
  @IsString()
  @IsNotEmpty()
  kodeJadwal: string;

  @ApiProperty({ example: 'Shift Pagi', description: 'Nama jadwal kerja' })
  @IsString()
  @IsNotEmpty()
  namaJadwal: string;

  @ApiProperty({ example: '08:00', description: 'Jam masuk (HH:MM)' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam masuk harus dalam format HH:MM',
  })
  jamMasuk: string;

  @ApiProperty({ example: '17:00', description: 'Jam pulang (HH:MM)' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam pulang harus dalam format HH:MM',
  })
  jamPulang: string;

  @ApiProperty({
    example: ['senin', 'selasa', 'rabu', 'kamis', 'jumat'],
    description: 'Array hari kerja',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Minimal harus ada 1 hari kerja' })
  @IsString({ each: true })
  hariKerja: string[];
}

export class UpdateJadwalKerjaDto {
  @ApiProperty({ example: 'JDW-001', required: false })
  @IsString()
  @IsOptional()
  kodeJadwal?: string;

  @ApiProperty({ example: 'Shift Pagi', required: false })
  @IsString()
  @IsOptional()
  namaJadwal?: string;

  @ApiProperty({ example: '08:00', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam masuk harus dalam format HH:MM',
  })
  jamMasuk?: string;

  @ApiProperty({ example: '17:00', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam pulang harus dalam format HH:MM',
  })
  jamPulang?: string;

  @ApiProperty({
    example: ['senin', 'selasa', 'rabu', 'kamis', 'jumat'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  hariKerja?: string[];
}

export class QueryJadwalDto {
  @ApiPropertyOptional({
    description: 'Search by nama jadwal atau kode jadwal',
    example: 'Shift Pagi',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by hari kerja',
    example: ['senin', 'selasa'],
  })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @IsString({ each: true })
  hariKerja?: string[];

  @ApiPropertyOptional({
    description: 'Filter jam masuk (HH:MM)',
    example: '08:00',
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam masuk harus dalam format HH:MM',
  })
  jamMasuk?: string;

  @ApiPropertyOptional({
    description: 'Filter jam pulang (HH:MM)',
    example: '17:00',
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam pulang harus dalam format HH:MM',
  })
  jamPulang?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  limit: number = 10;

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
