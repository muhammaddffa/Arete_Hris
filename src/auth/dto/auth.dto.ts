/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/auth/dto/auth.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsBoolean,
  IsOptional,
  IsArray,
  IsInt,
  ValidateIf,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateUserAccountDto {
  @ApiProperty({ example: 'budi.santoso', description: 'Username untuk login' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'budi@company.com', description: 'Email karyawan' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'TempPassword123!',
    description:
      'Password temporary (karyawan wajib ganti setelah login pertama)',
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'uuid-karyawan',
    description: 'ID Karyawan yang akan dibuat akun',
  })
  @IsUUID()
  @IsNotEmpty()
  idKaryawan: string;

  @ApiProperty({
    example: true,
    description:
      'Gunakan role default dari departemen (true) atau custom role (false)',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  useDepartmentRole?: boolean;

  @ApiProperty({
    example: [2, 3],
    description: 'Array ID Role (WAJIB jika useDepartmentRole = false)',
    required: false,
  })
  @ValidateIf((o) => o.useDepartmentRole === false)
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @IsNotEmpty()
  customRoles?: number[];
}

export class LoginDto {
  @ApiProperty({ example: 'budi.santoso' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;
}

export class AssignRoleDto {
  @ApiProperty({ example: 'uuid-user' })
  @IsUUID()
  @IsNotEmpty()
  idUser: string;

  @ApiProperty({ example: [1, 2, 3], description: 'Array of role IDs' })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @IsNotEmpty()
  idRoles: number[];
}

export class AdminResetPasswordDto {
  @ApiProperty({ example: 'uuid-user' })
  @IsUUID()
  @IsNotEmpty()
  idUser: string;

  @ApiProperty({ example: 'NewTempPassword123!' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({
    example: true,
    description: 'Paksa user ganti password saat login berikutnya',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  forceChangePassword?: boolean;
}
