import { IsNotEmpty, IsOptional, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSaldoCutiDto {
  @ApiProperty({ example: 'uuid-karyawan', description: 'ID Karyawan (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  idKaryawan: string;

  @ApiProperty({ example: 2025, description: 'Tahun saldo cuti' })
  @IsInt()
  @Type(() => Number)
  @Min(2000)
  @IsNotEmpty()
  tahun: number;

  @ApiProperty({
    example: 12,
    description: 'Saldo awal cuti (hari)',
    default: 12,
  })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  saldoAwal?: number;

  @ApiProperty({ example: 0, description: 'Saldo terpakai (hari)', default: 0 })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  saldoTerpakai?: number;

  @ApiProperty({ example: 12, description: 'Saldo sisa (hari)', default: 12 })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  saldoSisa?: number;
}

export class UpdateSaldoCutiDto {
  @ApiProperty({ example: 12, required: false })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  saldoAwal?: number;

  @ApiProperty({ example: 3, required: false })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  saldoTerpakai?: number;

  @ApiProperty({ example: 9, required: false })
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  saldoSisa?: number;
}
