/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { StatusKaryawan } from '@prisma/client';
import { AdminResetPasswordDto, CreateUserAccountDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    // 1. Cari karyawan by username
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: {
        username,
        status: StatusKaryawan.aktif,
        statusKeaktifan: true,
      },
      select: {
        idKaryawan: true,
        nik: true,
        nama: true,
        username: true,
        email: true,
        pasfoto: true,
        passwordHash: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true,
        mustChangePassword: true,
        jabatan: {
          select: {
            idJabatan: true,
            namaJabatan: true,
            departemen: {
              select: { idDepartemen: true, namaDepartemen: true },
            },
            // Permission dari jabatan
            permissions: {
              select: {
                levelAkses: true,
                permission: {
                  select: { idPermission: true, namaPermission: true },
                },
              },
            },
          },
        },
        // Override per karyawan
        karyawanPermissionOverrides: {
          select: {
            typePermission: true,
            levelAkses: true,
            permission: {
              select: { idPermission: true, namaPermission: true },
            },
          },
        },
      },
    });

    if (!karyawan) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // 2. Cek locked
    if (karyawan.lockedUntil && karyawan.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (karyawan.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account terkunci. Coba lagi dalam ${minutesLeft} menit`,
      );
    }

    // 3. Cek aktif
    if (!karyawan.isActive) {
      throw new UnauthorizedException('Account tidak aktif');
    }

    if (!karyawan.passwordHash) {
      throw new UnauthorizedException('Akun belum memiliki password');
    }

    // 4. Verifikasi password
    const isPasswordValid = await bcrypt.compare(
      password,
      karyawan.passwordHash,
    );

    if (!isPasswordValid) {
      const newAttempts = karyawan.loginAttempts + 1;
      const updateData: any = { loginAttempts: newAttempts };

      // Lock 30 menit setelah 5x gagal
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        updateData.loginAttempts = 0;
      }

      await this.prisma.refKaryawan.update({
        where: { idKaryawan: karyawan.idKaryawan },
        data: updateData,
      });

      if (newAttempts >= 5) {
        throw new UnauthorizedException(
          'Account terkunci karena terlalu banyak percobaan login gagal',
        );
      }

      throw new UnauthorizedException('Username atau password salah');
    }

    // 5. Hitung effective permissions (jabatan + override)
    const effectivePermissions = this.resolveEffectivePermissions(
      karyawan.jabatan.permissions,
      karyawan.karyawanPermissionOverrides,
    );

    // 6. Reset login attempts & update last login
    await this.prisma.refKaryawan.update({
      where: { idKaryawan: karyawan.idKaryawan },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // 7. Generate JWT — payload ringkas, permission di-load fresh di JwtStrategy
    const payload = {
      sub: karyawan.idKaryawan,
      username: karyawan.username,
      nik: karyawan.nik,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      mustChangePassword: karyawan.mustChangePassword,
      karyawan: {
        idKaryawan: karyawan.idKaryawan,
        nik: karyawan.nik,
        nama: karyawan.nama,
        username: karyawan.username,
        email: karyawan.email,
        pasfoto: karyawan.pasfoto,
        jabatan: {
          idJabatan: karyawan.jabatan.idJabatan,
          namaJabatan: karyawan.jabatan.namaJabatan,
          departemen: karyawan.jabatan.departemen,
        },
      },
      // Kirim ke frontend untuk keperluan show/hide button
      permissions: effectivePermissions,
    };
  }

  async changePassword(
    idKaryawan: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan },
      select: { passwordHash: true },
    });

    if (!karyawan?.passwordHash) {
      throw new UnauthorizedException('Karyawan tidak ditemukan');
    }

    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      karyawan.passwordHash,
    );
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Password lama salah');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Password harus minimal 8 karakter');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.refKaryawan.update({
      where: { idKaryawan },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });

    return { message: 'Password berhasil diubah' };
  }

  async adminResetPassword(dto: AdminResetPasswordDto) {
    const { idKaryawan, newPassword } = dto;

    if (newPassword.length < 8) {
      throw new BadRequestException('Password harus minimal 8 karakter');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.refKaryawan.update({
      where: { idKaryawan },
      data: {
        passwordHash,
        mustChangePassword: dto.forceChangePassword ?? true,
      },
    });

    return { message: 'Password berhasil direset' };
  }

  async toggleUserStatus(idKaryawan: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan },
      select: { isActive: true },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    const updated = await this.prisma.refKaryawan.update({
      where: { idKaryawan },
      data: { isActive: !karyawan.isActive },
      select: { idKaryawan: true, nama: true, isActive: true },
    });

    return updated;
  }

  async createUserAccount(dto: CreateUserAccountDto) {
    const { idKaryawan, username, password } = dto;

    const existing = await this.prisma.refKaryawan.findUnique({
      where: { username },
      select: { idKaryawan: true },
    });
    if (existing) {
      throw new BadRequestException('Username sudah digunakan');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const karyawan = await this.prisma.refKaryawan.update({
      where: { idKaryawan },
      data: {
        username,
        passwordHash,
        isActive: true,
        mustChangePassword: true,
      },
      select: {
        idKaryawan: true,
        nik: true,
        nama: true,
        username: true,
      },
    });

    return karyawan;
  }

  async requestPasswordReset(username: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { username, status: StatusKaryawan.aktif },
      select: { idKaryawan: true, email: true },
    });

    if (!karyawan) {
      return {
        message:
          'Jika username terdaftar, link reset password akan dikirim ke email',
      };
    }

    const resetToken = this.generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await this.prisma.refKaryawan.update({
      where: { idKaryawan: karyawan.idKaryawan },
      data: { resetToken, resetTokenExpires },
    });

    // TODO: kirim email
    console.log(`Reset token for ${username}: ${resetToken}`);

    return {
      message:
        'Jika username terdaftar, link reset password akan dikirim ke email',
      dev_resetToken: resetToken, // HAPUS di production
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    const karyawan = await this.prisma.refKaryawan.findFirst({
      where: {
        resetToken,
        resetTokenExpires: { gt: new Date() },
      },
      select: { idKaryawan: true },
    });

    if (!karyawan) {
      throw new BadRequestException('Token tidak valid atau sudah kadaluarsa');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Password harus minimal 8 karakter');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.refKaryawan.update({
      where: { idKaryawan: karyawan.idKaryawan },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
        mustChangePassword: false,
      },
    });

    return { message: 'Password berhasil direset' };
  }

  async getProfile(idKaryawan: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan },
      select: {
        idKaryawan: true,
        nik: true,
        nama: true,
        username: true,
        email: true,
        pasfoto: true,
        jenisKelamin: true,
        noHpPribadi: true,
        mustChangePassword: true,
        jabatan: {
          select: {
            idJabatan: true,
            namaJabatan: true,
            departemen: {
              select: { idDepartemen: true, namaDepartemen: true },
            },
            permissions: {
              select: {
                levelAkses: true,
                permission: {
                  select: { idPermission: true, namaPermission: true },
                },
              },
            },
          },
        },
        karyawanPermissionOverrides: {
          select: {
            typePermission: true,
            levelAkses: true,
            permission: {
              select: { idPermission: true, namaPermission: true },
            },
          },
        },
      },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    const effectivePermissions = this.resolveEffectivePermissions(
      karyawan.jabatan.permissions,
      karyawan.karyawanPermissionOverrides,
    );

    return {
      idKaryawan: karyawan.idKaryawan,
      nik: karyawan.nik,
      nama: karyawan.nama,
      username: karyawan.username,
      email: karyawan.email,
      pasfoto: karyawan.pasfoto,
      jenisKelamin: karyawan.jenisKelamin,
      noHpPribadi: karyawan.noHpPribadi,
      mustChangePassword: karyawan.mustChangePassword,
      jabatan: {
        idJabatan: karyawan.jabatan.idJabatan,
        namaJabatan: karyawan.jabatan.namaJabatan,
        departemen: karyawan.jabatan.departemen,
      },
      permissions: effectivePermissions,
    };
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.refKaryawan.findMany({
        where: { username: { not: null } },
        skip,
        take: limit,
        select: {
          idKaryawan: true,
          nik: true,
          nama: true,
          username: true,
          email: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          jabatan: {
            select: {
              namaJabatan: true,
              departemen: {
                select: { namaDepartemen: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refKaryawan.count({
        where: { username: { not: null } },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // ============================================================
  // Private helpers
  // ============================================================

  /**
   * Resolve effective permissions dari jabatan + override
   * Return: { namaPermission → levelAkses (bitmask int) }
   */
  private resolveEffectivePermissions(
    jabatanPermissions: {
      levelAkses: number;
      permission: { idPermission: number; namaPermission: string };
    }[],
    overrides: {
      typePermission: boolean;
      levelAkses: number | null;
      permission: { idPermission: number; namaPermission: string };
    }[],
  ): Record<string, number> {
    const result: Record<string, number> = {};

    // Base dari jabatan
    for (const jp of jabatanPermissions) {
      result[jp.permission.namaPermission] = Number(jp.levelAkses);
    }

    // Terapkan override
    for (const override of overrides) {
      const nama = override.permission.namaPermission;
      if (!override.typePermission) {
        // Revoke → hapus
        delete result[nama];
      } else if (override.levelAkses !== null) {
        // Grant → set level baru
        result[nama] = Number(override.levelAkses);
      }
    }

    return result;
  }

  private generateResetToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
