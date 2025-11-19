import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  IsNotEmpty,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Nama departemen',
    example: 'Human Resources',
    maxLength: 100,
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @MaxLength(100)
  namaDepartemen: string;

  @ApiProperty({
    description: 'ID role default untuk departemen',
    example: 1,
    type: Number,
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Type(() => Number)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsInt()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty()
  idRoleDefault: number; // Int karena RefRole pakai Int

  @ApiPropertyOptional({
    description: 'Deskripsi departemen',
    example: 'Departemen yang menangani sumber daya manusia',
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsOptional()
  deskripsi?: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({
    description: 'Nama departemen',
    example: 'Human Resources',
    maxLength: 100,
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @MaxLength(100)
  namaDepartemen?: string;

  @ApiPropertyOptional({
    description: 'ID role default untuk departemen',
    example: 1,
    type: Number,
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Type(() => Number)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsInt()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsOptional()
  idRoleDefault?: number;

  @ApiPropertyOptional({
    description: 'Deskripsi departemen',
    example: 'Departemen yang menangani sumber daya manusia',
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsOptional()
  deskripsi?: string;
}

export class DepartmentResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  idDepartemen: string; // UUID

  @ApiProperty({ example: 'Human Resources' })
  namaDepartemen: string;

  @ApiProperty({ example: 1 })
  idRoleDefault: number; // Int

  @ApiProperty({ example: 'Departemen HR', nullable: true })
  deskripsi: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  roleDefault?: {
    idRole: number;
    namaRole: string;
    level: number;
  };

  @ApiPropertyOptional()
  _count?: {
    jabatan: number;
  };
}
