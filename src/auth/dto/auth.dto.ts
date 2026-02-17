import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

export class CreateUserAccountDto {
  @ApiProperty({
    example: 'uuid-karyawan',
    description: 'ID Karyawan yang akan dibuat akun',
  })
  @IsUUID()
  @IsNotEmpty()
  idKaryawan: string;

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
}
// Catatan: useDepartmentRole dan customRoles dihapus
// Permission sekarang otomatis dari jabatan karyawan (jabatan_permission)

export class AdminResetPasswordDto {
  @ApiProperty({ example: 'uuid-karyawan' })
  @IsUUID()
  @IsNotEmpty()
  idKaryawan: string;

  @ApiProperty({ example: 'NewTempPassword123!' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({
    example: true,
    description: 'Paksa karyawan ganti password saat login berikutnya',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  forceChangePassword?: boolean;
}

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'budi.santoso' })
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123xyz' })
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;
}

// AssignRoleDto dihapus — tidak ada lagi karyawan_role
