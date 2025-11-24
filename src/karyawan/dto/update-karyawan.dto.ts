import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  StatusKaryawan,
  JenisKelamin,
  StatusPernikahan,
} from '../../model/karyawan.model';

export class UpdateKaryawanDto {
  @ApiPropertyOptional({ description: 'NIK (16 digit)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{16}$/, { message: 'NIK harus 16 digit angka' })
  nik?: string;

  @ApiPropertyOptional({ description: 'NPWP' })
  @IsOptional()
  @IsString()
  npwp?: string;

  @ApiPropertyOptional({ description: 'Path file SKCK' })
  @IsOptional()
  @IsString()
  skck?: string;

  @ApiPropertyOptional({ description: 'Path file Surat Kesehatan' })
  @IsOptional()
  @IsString()
  suratKesehatan?: string;

  @ApiPropertyOptional({ description: 'Path file CV' })
  @IsOptional()
  @IsString()
  cv?: string;

  @ApiPropertyOptional({ description: 'Nama lengkap' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nama?: string;

  @ApiPropertyOptional({ description: 'Tempat lahir' })
  @IsOptional()
  @IsString()
  tempatLahir?: string;

  @ApiPropertyOptional({
    description: 'Tanggal lahir (format: YYYY-MM-DD)',
    example: '1995-05-15',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Format tanggal harus YYYY-MM-DD',
  })
  tanggalLahir?: string;

  @ApiPropertyOptional({ description: 'Jenis kelamin', enum: JenisKelamin })
  @IsOptional()
  @IsEnum(JenisKelamin)
  jenisKelamin?: JenisKelamin;

  @ApiPropertyOptional({
    description: 'Status pernikahan',
    enum: StatusPernikahan,
  })
  @IsOptional()
  @IsEnum(StatusPernikahan)
  statusPernikahan?: StatusPernikahan;

  @ApiPropertyOptional({ description: 'Path file pasfoto' })
  @IsOptional()
  @IsString()
  pasfoto?: string;

  @ApiPropertyOptional({ description: 'Agama' })
  @IsOptional()
  @IsString()
  agama?: string;

  @ApiPropertyOptional({ description: 'Nomor HP' })
  @IsOptional()
  @IsString()
  noHpPribadi?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Alamat' })
  @IsOptional()
  @IsString()
  alamat?: string;

  @ApiPropertyOptional({ description: 'ID Jabatan (UUID)' })
  @IsOptional()
  @IsUUID()
  idJabatan?: string;

  @ApiPropertyOptional({ description: 'Nama bank' })
  @IsOptional()
  @IsString()
  namaBank?: string;

  @ApiPropertyOptional({ description: 'Nomor rekening' })
  @IsOptional()
  @IsString()
  nomorRekening?: string;

  @ApiPropertyOptional({ description: 'Status keaktifan' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  statusKeaktifan?: boolean;

  @ApiPropertyOptional({
    description: 'Tanggal masuk (format: YYYY-MM-DD)',
    example: '2024-01-15',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Format tanggal harus YYYY-MM-DD',
  })
  tanggalMasuk?: string;

  @ApiPropertyOptional({
    description: 'Tanggal resign (format: YYYY-MM-DD)',
    example: '2024-12-31',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Format tanggal harus YYYY-MM-DD',
  })
  tanggalResign?: string;

  @ApiPropertyOptional({ description: 'Status karyawan', enum: StatusKaryawan })
  @IsOptional()
  @IsEnum(StatusKaryawan)
  status?: StatusKaryawan;
}
