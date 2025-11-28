import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsEnum,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

  @ApiProperty({ example: 'unique-id', description: 'ID Jenis Izin (INT)' })
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

  @ApiProperty({ example: 'https://cloudinary.com/bukti.pdf', required: false })
  @IsString()
  @IsOptional()
  pathBukti?: string;

  @ApiProperty({
    example: 'uuid-atasan',
    description: 'ID Atasan (UUID)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  idAtasan?: string;
}

export class UpdatePengajuanIzinDto {
  @ApiProperty({ example: 1, required: false })
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
  @Min(1)
  @IsOptional()
  jumlahHari?: number;

  @ApiProperty({ example: 'Update keterangan', required: false })
  @IsString()
  @IsOptional()
  keterangan?: string;

  @ApiProperty({ example: 'https://cloudinary.com/bukti.pdf', required: false })
  @IsString()
  @IsOptional()
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
