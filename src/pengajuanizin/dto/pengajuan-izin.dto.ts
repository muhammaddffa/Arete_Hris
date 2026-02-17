/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsEnum,
  IsUUID,
  Min,
  Allow,
} from 'class-validator';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export enum StatusPersetujuan {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export class CreatePengajuanIzinDto {
  @ApiProperty({ example: 'uuid-karyawan', description: 'ID Karyawan (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  idKaryawan: string;

  @ApiProperty({
    example: 'uuid-jenis-izin',
    description: 'ID Jenis Izin (UUID)',
  })
  @IsUUID()
  @IsNotEmpty()
  idJenisIzin: string;

  @ApiProperty({ example: '2025-02-01', description: 'Tanggal mulai izin' })
  @IsDateString()
  @IsNotEmpty()
  tanggalMulai: string;

  @ApiProperty({ example: '2025-02-03', description: 'Tanggal selesai izin' })
  @IsDateString()
  @IsNotEmpty()
  tanggalSelesai: string;

  @ApiProperty({ example: 3, description: 'Jumlah hari izin' })
  @IsInt()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value)) // For form-data string conversion
  @Min(1)
  @IsNotEmpty()
  jumlahHari: number;

  @ApiProperty({
    example: 'Keperluan keluarga',
    description: 'Keterangan pengajuan izin',
  })
  @IsString()
  @IsNotEmpty()
  keterangan: string;

  @ApiProperty({
    example: 'uuid-atasan',
    description: 'ID Atasan (UUID)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  idAtasan?: string;

  // pathBukti will be set from uploaded file via cloudinary service
  // Hidden from Swagger, allowed by class-validator
  @ApiHideProperty()
  @Allow()
  pathBukti?: string;
}

export class UpdatePengajuanIzinDto {
  @ApiProperty({ example: 'uuid-jenis-izin', required: false })
  @IsUUID()
  @IsOptional()
  idJenisIzin?: string;

  @ApiProperty({ example: '2025-02-01', required: false })
  @IsDateString()
  @IsOptional()
  tanggalMulai?: string;

  @ApiProperty({ example: '2025-02-03', required: false })
  @IsDateString()
  @IsOptional()
  tanggalSelesai?: string;

  @ApiProperty({ example: 3, required: false })
  @IsInt()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  @IsOptional()
  jumlahHari?: number;

  @ApiProperty({ example: 'Update keterangan', required: false })
  @IsString()
  @IsOptional()
  keterangan?: string;

  // pathBukti will be set from uploaded file (internal use only)
  // Hidden from Swagger, allowed by class-validator
  @ApiHideProperty()
  @Allow()
  pathBukti?: string;
}

export class ApprovalPengajuanIzinDto {
  @ApiProperty({ enum: StatusPersetujuan, example: StatusPersetujuan.APPROVED })
  @IsEnum(StatusPersetujuan)
  @IsNotEmpty()
  statusPersetujuan: StatusPersetujuan;

  @ApiProperty({ example: 'Disetujui', required: false })
  @IsString()
  @IsOptional()
  catatanAtasan?: string;
}
