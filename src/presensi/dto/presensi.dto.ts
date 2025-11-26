import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusKehadiran {
  HADIR = 'hadir',
  IZIN = 'izin',
  SAKIT = 'sakit',
  ALPA = 'alpa',
  CUTI = 'cuti',
  LIBUR = 'libur',
  DINAS_LUAR = 'dinas_luar',
}

export enum SumberPresensi {
  MANUAL = 'manual',
  BIOMETRIC = 'biometric',
  MOBILE_APP = 'mobile_app',
  WEB_APP = 'web_app',
  QR_CODE = 'qr_code',
}

export class CreatePresensiDto {
  @ApiProperty({ example: 'uuid-karyawan', description: 'ID Karyawan (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  idKaryawan: string;

  @ApiProperty({ example: '2025-01-15', description: 'Tanggal presensi' })
  @IsDateString()
  @IsNotEmpty()
  tanggalPresensi: string;

  @ApiProperty({
    example: '2025-01-15T08:00:00Z',
    description: 'Waktu clock in',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  waktuClockIn?: string;

  @ApiProperty({
    example: '2025-01-15T17:00:00Z',
    description: 'Waktu clock out',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  waktuClockOut?: string;

  @ApiProperty({ enum: StatusKehadiran, default: StatusKehadiran.HADIR })
  @IsEnum(StatusKehadiran)
  @IsOptional()
  statusKehadiran?: StatusKehadiran;

  @ApiProperty({ enum: SumberPresensi, default: SumberPresensi.MANUAL })
  @IsEnum(SumberPresensi)
  @IsOptional()
  sumberPresensi?: SumberPresensi;

  @ApiProperty({ example: 'Terlambat karena macet', required: false })
  @IsString()
  @IsOptional()
  keterangan?: string;

  @ApiProperty({ example: '-6.200000,106.816666', required: false })
  @IsString()
  @IsOptional()
  lokasiClockIn?: string;

  @ApiProperty({ example: '-6.200000,106.816666', required: false })
  @IsString()
  @IsOptional()
  lokasiClockOut?: string;

  @ApiProperty({ example: 'https://cloudinary.com/photo.jpg', required: false })
  @IsString()
  @IsOptional()
  fotoClockIn?: string;

  @ApiProperty({ example: 'https://cloudinary.com/photo.jpg', required: false })
  @IsString()
  @IsOptional()
  fotoClockOut?: string;
}

export class UpdatePresensiDto {
  @ApiProperty({ example: '2025-01-15T17:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  waktuClockOut?: string;

  @ApiProperty({ enum: StatusKehadiran, required: false })
  @IsEnum(StatusKehadiran)
  @IsOptional()
  statusKehadiran?: StatusKehadiran;

  @ApiProperty({ example: 'Update keterangan', required: false })
  @IsString()
  @IsOptional()
  keterangan?: string;

  @ApiProperty({ example: '-6.200000,106.816666', required: false })
  @IsString()
  @IsOptional()
  lokasiClockOut?: string;

  @ApiProperty({ example: 'https://cloudinary.com/photo.jpg', required: false })
  @IsString()
  @IsOptional()
  fotoClockOut?: string;
}

export class ClockInDto {
  @ApiProperty({ example: 'uuid-karyawan' })
  @IsUUID()
  @IsNotEmpty()
  idKaryawan: string;

  @ApiProperty({ example: '-6.200000,106.816666', required: false })
  @IsString()
  @IsOptional()
  lokasiClockIn?: string;

  @ApiProperty({ example: 'https://cloudinary.com/photo.jpg', required: false })
  @IsString()
  @IsOptional()
  fotoClockIn?: string;
}

export class ClockOutDto {
  @ApiProperty({ example: '-6.200000,106.816666', required: false })
  @IsString()
  @IsOptional()
  lokasiClockOut?: string;

  @ApiProperty({ example: 'https://cloudinary.com/photo.jpg', required: false })
  @IsString()
  @IsOptional()
  fotoClockOut?: string;
}
