// src/permission/dto/permission.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePermissionDto {
  @ApiProperty({ example: 'manage_karyawan' })
  @IsString()
  @IsNotEmpty()
  namaPermission: string;

  @ApiProperty({ example: 'Kelola data karyawan' })
  @IsString()
  @IsNotEmpty()
  deskripsi: string;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'manage_karyawan' })
  @IsString()
  @IsOptional()
  namaPermission?: string;

  @ApiPropertyOptional({ example: 'Kelola data karyawan' })
  @IsString()
  @IsOptional()
  deskripsi?: string;
}

export class FilterPermissionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'manage' })
  @IsOptional()
  @IsString()
  search?: string;
}
