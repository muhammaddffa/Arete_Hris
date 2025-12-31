import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  IsDecimal,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusPersetujuan {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export class CreatePengajuanLemburDto {
  @ApiProperty({ example: 'uuid-karyawan', description: 'ID Karyawan (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  idKaryawan: string;

  @ApiProperty({ example: '2025-01-20', description: 'Tanggal lembur' })
  @IsDateString()
  @IsNotEmpty()
  tanggalLembur: string;

  @ApiProperty({ example: '18:00', description: 'Jam mulai lembur (HH:MM)' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam mulai harus dalam format HH:MM',
  })
  jamMulai: string;

  @ApiProperty({ example: '21:00', description: 'Jam selesai lembur (HH:MM)' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam selesai harus dalam format HH:MM',
  })
  jamSelesai: string;

  @ApiProperty({ example: '3.00', description: 'Total jam lembur' })
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  totalJam: string;

  @ApiProperty({
    example: 'Menyelesaikan laporan keuangan Q4',
    description: 'Keterangan pekerjaan lembur',
  })
  @IsString()
  @IsNotEmpty()
  keteranganPekerjaan: string;

  @ApiProperty({
    example: 'uuid-atasan',
    description: 'ID Atasan (UUID)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  idAtasan?: string;
}

export class UpdatePengajuanLemburDto {
  @ApiProperty({ example: '2025-01-20', required: false })
  @IsDateString()
  @IsOptional()
  tanggalLembur?: string;

  @ApiProperty({ example: '18:00', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam mulai harus dalam format HH:MM',
  })
  jamMulai?: string;

  @ApiProperty({ example: '21:00', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Jam selesai harus dalam format HH:MM',
  })
  jamSelesai?: string;

  @ApiProperty({ example: '3.00', required: false })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  totalJam?: string;

  @ApiProperty({ example: 'Update keterangan pekerjaan', required: false })
  @IsString()
  @IsOptional()
  keteranganPekerjaan?: string;
}

export class ApprovalPengajuanLemburDto {
  @ApiProperty({ enum: StatusPersetujuan, example: StatusPersetujuan.APPROVED })
  @IsEnum(StatusPersetujuan)
  @IsNotEmpty()
  statusPersetujuan: StatusPersetujuan;

  @ApiProperty({ example: 'Disetujui', required: false })
  @IsString()
  @IsOptional()
  catatanAtasan?: string;
}
