import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJenisIzinDto {
  @ApiProperty({ example: 'CUTI', description: 'Kode jenis izin' })
  @IsString()
  @IsNotEmpty()
  kodeIzin: string;

  @ApiProperty({ example: 'Cuti Tahunan', description: 'Nama jenis izin' })
  @IsString()
  @IsNotEmpty()
  namaIzin: string;

  @ApiProperty({
    example: true,
    description: 'Apakah memotong saldo cuti?',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  potongCuti?: boolean;

  @ApiProperty({ example: 'Cuti untuk keperluan pribadi', required: false })
  @IsString()
  @IsOptional()
  deskripsi?: string;
}

export class UpdateJenisIzinDto {
  @ApiProperty({ example: 'CUTI', required: false })
  @IsString()
  @IsOptional()
  kodeIzin?: string;

  @ApiProperty({ example: 'Cuti Tahunan', required: false })
  @IsString()
  @IsOptional()
  namaIzin?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  potongCuti?: boolean;

  @ApiProperty({ example: 'Deskripsi update', required: false })
  @IsString()
  @IsOptional()
  deskripsi?: string;
}
