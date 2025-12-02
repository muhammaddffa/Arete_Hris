/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserAccountDto,
  LoginDto,
  ChangePasswordDto,
  AssignRoleDto,
  AdminResetPasswordDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ===== ADMIN: CREATE USER ACCOUNT =====
  async createUserAccount(createDto: CreateUserAccountDto) {
    // 1. Validate karyawan exists dan aktif
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: createDto.idKaryawan },
      include: {
        jabatan: {
          include: {
            departemen: {
              include: {
                roleDefault: true,
              },
            },
          },
        },
      },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    if (karyawan.status !== 'aktif') {
      throw new BadRequestException(
        'Hanya karyawan aktif yang bisa dibuatkan akun',
      );
    }

    // 2. Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createDto.username },
          { email: createDto.email },
          { idKaryawan: createDto.idKaryawan },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === createDto.username) {
        throw new ConflictException('Username sudah digunakan');
      }
      if (existingUser.email === createDto.email) {
        throw new ConflictException('Email sudah digunakan');
      }
      if (existingUser.idKaryawan === createDto.idKaryawan) {
        throw new ConflictException('Karyawan sudah memiliki akun');
      }
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(createDto.password, 10);

    // 4. Create user
    const user = await this.prisma.user.create({
      data: {
        username: createDto.username,
        email: createDto.email,
        passwordHash,
        idKaryawan: createDto.idKaryawan,
        useDepartmentRole: createDto.useDepartmentRole ?? true,
        isActive: true,
        // User harus ganti password di login pertama
        resetToken: 'FORCE_CHANGE', // Flag untuk force change password
      },
    });

    // 5. Assign custom roles jika useDepartmentRole = false
    if (
      !user.useDepartmentRole &&
      createDto.customRoles &&
      createDto.customRoles.length > 0
    ) {
      const userRoles = createDto.customRoles.map((idRole) => ({
        idUser: user.idUser,
        idRole,
      }));

      await this.prisma.userRole.createMany({
        data: userRoles,
      });
    }
    // 6. Return user info
    const userWithRoles = await this.prisma.user.findUnique({
      where: { idUser: user.idUser },
      include: {
        karyawan: {
          include: {
            jabatan: {
              include: {
                departemen: {
                  include: {
                    roleDefault: true,
                  },
                },
              },
            },
          },
        },
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    const { roles, permissions } = this.getRolesAndPermissions(userWithRoles);

    return {
      idUser: user.idUser,
      username: user.username,
      email: user.email,
      temporaryPassword: createDto.password, // ✅ Kirim ke admin untuk diberikan ke karyawan
      mustChangePassword: true,
      karyawan: {
        nama: karyawan.nama,
        nik: karyawan.nik,
        jabatan: karyawan.jabatan.namaJabatan,
        departemen: karyawan.jabatan.departemen.namaDepartemen,
      },
      useDepartmentRole: user.useDepartmentRole,
      roles: roles.map((r) => ({
        idRole: r.idRole,
        namaRole: r.namaRole,
        level: r.level,
      })),
    };
  }

  // ===== LOGIN =====
  async login(loginDto: LoginDto) {
    // 1. Find user with all relations
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
      include: {
        karyawan: {
          include: {
            jabatan: {
              include: {
                departemen: {
                  include: {
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
              },
            },
          },
        },
        userRoles: {
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
      },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // 2. Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Akun terkunci. Coba lagi dalam ${minutesLeft} menit`,
      );
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      await this.handleFailedLogin(user.idUser, user.loginAttempts);
      throw new UnauthorizedException('Username atau password salah');
    }

    // 4. Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Akun tidak aktif. Hubungi administrator',
      );
    }

    // 5. Check if karyawan is still aktif
    if (user.karyawan && user.karyawan.status !== 'aktif') {
      throw new UnauthorizedException('Status karyawan tidak aktif');
    }

    // 6. Reset login attempts and update last login
    await this.prisma.user.update({
      where: { idUser: user.idUser },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // 7. Check if must change password
    const mustChangePassword = user.resetToken === 'FORCE_CHANGE';

    // 8. Get role & permissions
    const { roles, permissions } = this.getRolesAndPermissions(user);

    // 9. Generate JWT token
    const payload = {
      sub: user.idUser,
      username: user.username,
      email: user.email,
      idKaryawan: user.idKaryawan,
      roles: roles.map((r) => ({
        idRole: r.idRole,
        namaRole: r.namaRole,
        level: r.level,
      })),
      permissions: permissions.map((p) => p.namaPermission),
      mustChangePassword, // ✅ Flag untuk frontend
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      mustChangePassword, // ✅ Frontend harus redirect ke change password
      user: {
        idUser: user.idUser,
        username: user.username,
        email: user.email,
        karyawan: user.karyawan
          ? {
              idKaryawan: user.karyawan.idKaryawan,
              nama: user.karyawan.nama,
              nik: user.karyawan.nik,
              jabatan: {
                namaJabatan: user.karyawan.jabatan.namaJabatan,
                departemen: user.karyawan.jabatan.departemen.namaDepartemen,
              },
            }
          : null,
        roles: roles.map((r) => ({
          idRole: r.idRole,
          namaRole: r.namaRole,
          level: r.level,
        })),
        permissions: permissions.map((p) => p.namaPermission),
      },
    };
  }

  // ===== CHANGE PASSWORD (By User) =====
  async changePassword(idUser: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { idUser },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.passwordHash,
    );

    if (!isOldPasswordValid) {
      throw new BadRequestException('Password lama tidak sesuai');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    // Update password dan clear force change flag
    await this.prisma.user.update({
      where: { idUser },
      data: {
        passwordHash: newPasswordHash,
        resetToken: null, // ✅ Clear force change flag
      },
    });

    return {
      message: 'Password berhasil diubah',
    };
  }

  // ===== ADMIN: RESET PASSWORD =====
  async adminResetPassword(adminResetDto: AdminResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { idUser: adminResetDto.idUser },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(adminResetDto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { idUser: adminResetDto.idUser },
      data: {
        passwordHash: newPasswordHash,
        resetToken: adminResetDto.forceChangePassword ? 'FORCE_CHANGE' : null,
      },
    });

    return {
      idUser: user.idUser,
      username: user.username,
      temporaryPassword: adminResetDto.newPassword,
      mustChangePassword: adminResetDto.forceChangePassword,
    };
  }

  // ===== HELPER: Get Roles & Permissions =====
  private getRolesAndPermissions(user: any) {
    let roles: any[] = [];
    let permissions: any[] = [];

    if (user.useDepartmentRole && user.karyawan) {
      // ✅ Use role from department (Dynamic)
      const deptRole = user.karyawan.jabatan.departemen.roleDefault;
      roles = [deptRole];

      permissions = deptRole.permissions.map((rp: any) => rp.permission);
    } else {
      // ✅ Use custom roles from UserRole table
      roles = user.userRoles.map((ur: any) => ur.role);

      // Merge permissions from all roles
      const permissionSet = new Set<string>();
      user.userRoles.forEach((ur: any) => {
        ur.role.permissions.forEach((rp: any) => {
          permissionSet.add(JSON.stringify(rp.permission));
        });
      });

      permissions = Array.from(permissionSet).map((p) => JSON.parse(p));
    }

    return { roles, permissions };
  }

  // ===== HELPER: Handle Failed Login =====
  private async handleFailedLogin(idUser: string, currentAttempts: number) {
    const newAttempts = currentAttempts + 1;

    if (newAttempts >= 5) {
      // Lock account for 30 minutes
      await this.prisma.user.update({
        where: { idUser },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
    } else {
      await this.prisma.user.update({
        where: { idUser },
        data: {
          loginAttempts: newAttempts,
        },
      });
    }
  }

  // ===== ADMIN: ASSIGN CUSTOM ROLES =====
  async assignRoles(assignRoleDto: AssignRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { idUser: assignRoleDto.idUser },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Set useDepartmentRole = false (use custom roles)
    await this.prisma.user.update({
      where: { idUser: assignRoleDto.idUser },
      data: {
        useDepartmentRole: false,
      },
    });

    // Delete existing roles
    await this.prisma.userRole.deleteMany({
      where: { idUser: assignRoleDto.idUser },
    });

    // Assign new roles
    const userRoles = assignRoleDto.idRoles.map((idRole) => ({
      idUser: assignRoleDto.idUser,
      idRole,
    }));

    await this.prisma.userRole.createMany({
      data: userRoles,
    });

    return this.getProfile(assignRoleDto.idUser);
  }

  // ===== GET USER PROFILE =====
  async getProfile(idUser: string) {
    const user = await this.prisma.user.findUnique({
      where: { idUser },
      include: {
        karyawan: {
          include: {
            jabatan: {
              include: {
                departemen: {
                  include: {
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
              },
            },
          },
        },
        userRoles: {
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
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const { roles, permissions } = this.getRolesAndPermissions(user);
    return {
      idUser: user.idUser,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      useDepartmentRole: user.useDepartmentRole,
      lastLogin: user.lastLogin,
      mustChangePassword: user.resetToken === 'FORCE_CHANGE',
      karyawan: user.karyawan
        ? {
            idKaryawan: user.karyawan.idKaryawan,
            nama: user.karyawan.nama,
            nik: user.karyawan.nik,
            jabatan: {
              namaJabatan: user.karyawan.jabatan.namaJabatan,
              departemen: user.karyawan.jabatan.departemen.namaDepartemen,
            },
          }
        : null,
      roles: roles.map((r) => ({
        idRole: r.idRole,
        namaRole: r.namaRole,
        level: r.level,
        deskripsi: r.deskripsi,
      })),
      permissions: permissions.map((p) => ({
        idPermission: p.idPermission,
        namaPermission: p.namaPermission,
        deskripsi: p.deskripsi,
      })),
    };
  }

  // ===== ADMIN: GET ALL USERS =====
  async getAllUsers(page: number = 1, limit: number = 10) {
    const { skip, take } = {
      skip: (page - 1) * limit,
      take: limit,
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        include: {
          karyawan: {
            select: {
              nama: true,
              nik: true,
            },
          },
          userRoles: {
            include: {
              role: {
                select: {
                  namaRole: true,
                  level: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // ===== ADMIN: TOGGLE USER ACTIVE STATUS =====
  async toggleUserStatus(idUser: string) {
    const user = await this.prisma.user.findUnique({
      where: { idUser },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return this.prisma.user.update({
      where: { idUser },
      data: {
        isActive: !user.isActive,
      },
    });
  }
}
