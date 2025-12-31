/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import {
  AdminResetPasswordDto,
  AssignRoleDto,
  CreateUserAccountDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    // 1. Find karyawan by username
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: {
        username,
        status: StatusKaryawan.aktif,
        statusKeaktifan: true,
      },
      include: {
        jabatan: {
          include: {
            departemen: true,
            roleDefault: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        karyawanRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        karyawanPermissionOverrides: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!karyawan) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // 2. Check if account is locked
    if (karyawan.lockedUntil && karyawan.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (karyawan.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account terkunci. Coba lagi dalam ${minutesLeft} menit`,
      );
    }

    // 3. Check if account is active
    if (!karyawan.isActive) {
      throw new UnauthorizedException('Account tidak aktif');
    }

    if (!karyawan?.passwordHash) {
      throw new UnauthorizedException('Karyawan tidak ditemukan');
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      karyawan.passwordHash,
    );

    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = karyawan.loginAttempts + 1;
      const updateData: any = {
        loginAttempts: newAttempts,
      };

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
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

    // 5. Get effective permissions
    const effectivePermissions = this.calculateEffectivePermissions(karyawan);

    // 6. Reset login attempts and update last login
    await this.prisma.refKaryawan.update({
      where: { idKaryawan: karyawan.idKaryawan },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // 7. Get roles (dari jabatan atau custom)
    const roles = karyawan.useJabatanRole
      ? [karyawan.jabatan.roleDefault]
      : karyawan.karyawanRoles.map((kr) => kr.role);

    // 8. Generate JWT token
    const payload = {
      sub: karyawan.idKaryawan,
      username: karyawan.username,
      nik: karyawan.nik,
      roles: roles.map((r) => r.namaRole),
      permissions: effectivePermissions.map((p) => p.namaPermission),
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
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
      roles: roles.map((r) => ({
        idRole: r.idRole,
        namaRole: r.namaRole,
        level: r.level,
      })),
      permissions: effectivePermissions.map((p) => ({
        idPermission: p.idPermission,
        namaPermission: p.namaPermission,
      })),
    };
  }

  async changePassword(
    idKaryawan: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan },
    });

    if (!karyawan?.passwordHash) {
      throw new UnauthorizedException('Karyawan tidak ditemukan');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      karyawan.passwordHash,
    );
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Password lama salah');
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new BadRequestException('Password harus minimal 8 karakter');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.refKaryawan.update({
      where: { idKaryawan },
      data: {
        passwordHash: newPasswordHash,
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
      data: { passwordHash },
    });

    return { message: 'Password berhasil direset' };
  }

  async toggleUserStatus(idKaryawan: string) {
    const user = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const updated = await this.prisma.refKaryawan.update({
      where: { idKaryawan },
      data: { isActive: !user.isActive },
    });

    return updated;
  }

  async assignRoles(dto: AssignRoleDto) {
    const { idKaryawan, idRoles } = dto;

    await this.prisma.karyawanRole.deleteMany({
      where: { idKaryawan },
    });

    await this.prisma.karyawanRole.createMany({
      data: idRoles.map((idRole) => ({
        idKaryawan,
        idRole,
      })),
    });

    return { message: 'Roles berhasil diperbarui' };
  }

  async createUserAccount(dto: CreateUserAccountDto) {
    const { idKaryawan, username, password } = dto;

    const existing = await this.prisma.refKaryawan.findUnique({
      where: { username },
    });
    if (existing) {
      throw new BadRequestException('Username sudah digunakan');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.refKaryawan.update({
      where: { idKaryawan },
      data: {
        username,
        passwordHash,
        isActive: true,
      },
    });

    return user;
  }

  async requestPasswordReset(username: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { username, status: StatusKaryawan.aktif },
    });

    if (!karyawan) {
      // Don't reveal if username exists or not
      return {
        message:
          'Jika username terdaftar, link reset password akan dikirim ke email',
      };
    }

    // Generate reset token
    const resetToken = this.generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.refKaryawan.update({
      where: { idKaryawan: karyawan.idKaryawan },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // await this.emailService.sendPasswordResetEmail(karyawan.email, resetToken);
    console.log(`Reset token for ${username}: ${resetToken}`);

    return {
      message:
        'Jika username terdaftar, link reset password akan dikirim ke email',
      // DEVELOPMENT ONLY - remove in production
      dev_resetToken: resetToken,
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    const karyawan = await this.prisma.refKaryawan.findFirst({
      where: {
        resetToken,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!karyawan) {
      throw new BadRequestException('Token tidak valid atau sudah kadaluarsa');
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new BadRequestException('Password harus minimal 8 karakter');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.prisma.refKaryawan.update({
      where: { idKaryawan: karyawan.idKaryawan },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: 'Password berhasil direset' };
  }

  async getProfile(idKaryawan: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan },
      include: {
        jabatan: {
          include: {
            departemen: true,
            roleDefault: true,
          },
        },
        karyawanRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        karyawanPermissionOverrides: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    const effectivePermissions = this.calculateEffectivePermissions(karyawan);

    const roles = karyawan.useJabatanRole
      ? [karyawan.jabatan.roleDefault]
      : karyawan.karyawanRoles.map((kr) => kr.role);

    return {
      idKaryawan: karyawan.idKaryawan,
      nik: karyawan.nik,
      nama: karyawan.nama,
      username: karyawan.username,
      email: karyawan.email,
      pasfoto: karyawan.pasfoto,
      jenisKelamin: karyawan.jenisKelamin,
      noHpPribadi: karyawan.noHpPribadi,
      jabatan: {
        idJabatan: karyawan.jabatan.idJabatan,
        namaJabatan: karyawan.jabatan.namaJabatan,
        departemen: karyawan.jabatan.departemen,
      },
      roles: roles.map((r) => ({
        idRole: r.idRole,
        namaRole: r.namaRole,
        level: r.level,
      })),
      permissions: effectivePermissions.map((p) => ({
        idPermission: p.idPermission,
        namaPermission: p.namaPermission,
      })),
      useJabatanRole: karyawan.useJabatanRole,
    };
  }

  // Helper: Calculate effective permissions
  private calculateEffectivePermissions(karyawan: any) {
    // 1. Get base permissions from roles
    const basePermissions: Set<number> = new Set();
    const allPermissions: Map<number, any> = new Map();

    if (karyawan.useJabatanRole) {
      // Use jabatan default role
      const roleDefault = karyawan.jabatan.roleDefault;
      if (roleDefault && roleDefault.permissions) {
        roleDefault.permissions.forEach((rp) => {
          if (rp.permission) {
            basePermissions.add(rp.permission.idPermission);
            allPermissions.set(rp.permission.idPermission, rp.permission);
          }
        });
      }
    } else {
      // Use custom roles
      if (karyawan.karyawanRoles && karyawan.karyawanRoles.length > 0) {
        karyawan.karyawanRoles.forEach((kr) => {
          if (kr.role && kr.role.permissions) {
            kr.role.permissions.forEach((rp) => {
              if (rp.permission) {
                basePermissions.add(rp.permission.idPermission);
                allPermissions.set(rp.permission.idPermission, rp.permission);
              }
            });
          }
        });
      }
    }

    // 2. Apply permission overrides
    const overrides = karyawan.karyawanPermissionOverrides || [];

    overrides.forEach((override) => {
      if (override.typePermission) {
        // ADD permission
        basePermissions.add(override.idPermission);
        if (override.permission) {
          allPermissions.set(
            override.permission.idPermission,
            override.permission,
          );
        }
      } else {
        // REMOVE permission
        basePermissions.delete(override.idPermission);
        allPermissions.delete(override.idPermission);
      }
    });

    // 3. Return array of permissions
    return Array.from(allPermissions.values());
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.refKaryawan.findMany({
        where: {
          username: { not: null },
        },
        skip,
        take: limit,
        include: {
          jabatan: {
            include: {
              departemen: true,
              roleDefault: true,
            },
          },
          karyawanRoles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.refKaryawan.count({
        where: {
          username: { not: null },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // Helper: Generate reset token
  private generateResetToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
