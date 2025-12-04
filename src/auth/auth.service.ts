/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  CreateUserAccountDto,
  LoginDto,
  ChangePasswordDto,
  AssignRoleDto,
  AdminResetPasswordDto,
} from './dto/auth.dto';
import {
  Role,
  RolesAndPermissions,
  UserWithRelations,
  LoginResponse,
  CreateUserResponse,
  RoleInfo,
  JwtPayload,
  ToggleUserStatusResponse,
  GetAllUsersResponse,
} from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async getRolesAndPermissions(
    user: UserWithRelations,
  ): Promise<RolesAndPermissions> {
    const roles: Role[] = [];
    const permissions: string[] = [];

    try {
      if (user.useDepartmentRole) {
        if (!user.karyawan) {
          console.warn('⚠️ User has no karyawan linked');
          return { roles, permissions };
        }

        if (!user.karyawan.jabatan) {
          console.warn('⚠️ Karyawan has no jabatan linked');
          return { roles, permissions };
        }

        if (!user.karyawan.jabatan.departemen) {
          console.warn('⚠️ Jabatan has no departemen linked');
          return { roles, permissions };
        }

        // Fetch department with role and permissions
        const dept = await this.prisma.refDepartemen.findUnique({
          where: {
            idDepartemen: user.karyawan.jabatan.departemen.idDepartemen,
          },
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
        });

        if (!dept?.roleDefault) {
          throw new Error('Departemen tidak memiliki default role');
        }

        roles.push(dept.roleDefault as Role);
      } else {
        if (!user.userRoles || user.userRoles.length === 0) {
          console.warn('⚠️ User has no custom roles assigned');
          return { roles, permissions };
        }

        user.userRoles.forEach((ur) => {
          roles.push(ur.role as Role);
        });
      }

      // Aggregate permissions
      const permissionSet = new Set<string>();

      roles.forEach((role) => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach((rp) => {
            if (rp.permission?.namaPermission) {
              permissionSet.add(rp.permission.namaPermission);
            }
          });
        }
      });

      return { roles, permissions: Array.from(permissionSet) };
    } catch (error) {
      console.error('❌ Error in getRolesAndPermissions:', error);
      throw new BadRequestException(
        `Gagal memuat roles dan permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // ===== HELPER: MAP ROLES TO INFO =====
  private mapRolesToInfo(roles: Role[]): RoleInfo[] {
    return roles.map((r) => ({
      idRole: r.idRole,
      namaRole: r.namaRole,
      level: r.level,
    }));
  }

  // ===== 1. CREATE USER ACCOUNT =====
  async createUserAccount(
    dto: CreateUserAccountDto,
  ): Promise<CreateUserResponse> {
    // Validasi karyawan
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: dto.idKaryawan },
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

    if (!karyawan.jabatan) {
      throw new BadRequestException(
        'Karyawan tidak memiliki jabatan. Assign jabatan terlebih dahulu.',
      );
    }

    if (!karyawan.jabatan.departemen) {
      throw new BadRequestException(
        'Jabatan tidak memiliki departemen. Setup departemen terlebih dahulu.',
      );
    }

    // Check existing user
    const existingUser = await this.prisma.user.findFirst({
      where: { idKaryawan: dto.idKaryawan },
    });

    if (existingUser) {
      throw new ConflictException('Karyawan sudah memiliki akun');
    }

    // Check username & email
    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.email }],
      },
    });

    if (userExists) {
      throw new ConflictException('Username atau email sudah digunakan');
    }

    // Validate custom roles
    if (!dto.useDepartmentRole) {
      if (!dto.customRoles || dto.customRoles.length === 0) {
        throw new BadRequestException(
          'customRoles wajib diisi jika useDepartmentRole = false',
        );
      }

      const rolesExist = await this.prisma.refRole.findMany({
        where: { idRole: { in: dto.customRoles } },
      });

      if (rolesExist.length !== dto.customRoles.length) {
        throw new BadRequestException('Beberapa role tidak valid');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash,
        idKaryawan: dto.idKaryawan,
        useDepartmentRole: dto.useDepartmentRole ?? true,
      },
    });

    // Assign custom roles if needed
    if (!dto.useDepartmentRole && dto.customRoles) {
      await this.prisma.userRole.createMany({
        data: dto.customRoles.map((idRole) => ({
          idUser: user.idUser,
          idRole,
        })),
      });
    }

    // Get user with all relations
    const userWithRoles = await this.prisma.user.findUnique({
      where: { idUser: user.idUser },
      include: {
        karyawan: {
          include: {
            jabatan: {
              include: {
                departemen: true,
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

    if (!userWithRoles) {
      throw new Error('Failed to fetch created user');
    }

    const { roles, permissions } = await this.getRolesAndPermissions(
      userWithRoles as unknown as UserWithRelations,
    );

    return {
      idUser: user.idUser,
      username: user.username,
      email: user.email,
      useDepartmentRole: user.useDepartmentRole,
      roles: this.mapRolesToInfo(roles),
      permissions,
    };
  }

  // ===== 2. LOGIN =====
  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
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

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Akun dikunci sampai ${user.lockedUntil.toLocaleString()}`,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      const attempts = user.loginAttempts + 1;
      const updateData: { loginAttempts: number; lockedUntil?: Date } = {
        loginAttempts: attempts,
      };

      if (attempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await this.prisma.user.update({
        where: { idUser: user.idUser },
        data: updateData,
      });

      throw new UnauthorizedException('Username atau password salah');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun tidak aktif');
    }

    await this.prisma.user.update({
      where: { idUser: user.idUser },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    const { roles, permissions } = await this.getRolesAndPermissions(
      user as unknown as UserWithRelations,
    );

    const payload: JwtPayload = {
      sub: user.idUser,
      username: user.username,
      email: user.email,
      idKaryawan: user.karyawan?.idKaryawan,
      roles: this.mapRolesToInfo(roles),
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
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
                namaJabatan: user.karyawan.jabatan?.namaJabatan,
                departemen: user.karyawan.jabatan?.departemen?.namaDepartemen,
              },
            }
          : null,
        roles: this.mapRolesToInfo(roles),
        permissions,
      },
    };
  }

  // ===== 3. CHANGE PASSWORD =====
  async changePassword(idUser: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { idUser },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const isOldPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.passwordHash,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Password lama salah');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { idUser },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Password berhasil diubah' };
  }

  // ===== 4. ASSIGN CUSTOM ROLES =====
  async assignRoles(dto: AssignRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { idUser: dto.idUser },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const rolesExist = await this.prisma.refRole.findMany({
      where: { idRole: { in: dto.idRoles } },
    });

    if (rolesExist.length !== dto.idRoles.length) {
      throw new BadRequestException('Beberapa role tidak valid');
    }

    await this.prisma.user.update({
      where: { idUser: dto.idUser },
      data: { useDepartmentRole: false },
    });

    await this.prisma.userRole.deleteMany({
      where: { idUser: dto.idUser },
    });

    await this.prisma.userRole.createMany({
      data: dto.idRoles.map((idRole) => ({
        idUser: dto.idUser,
        idRole,
      })),
    });

    return { message: 'Roles berhasil di-assign' };
  }

  // ===== 5. ADMIN RESET PASSWORD =====
  async adminResetPassword(dto: AdminResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { idUser: dto.idUser },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { idUser: dto.idUser },
      data: {
        passwordHash: newPasswordHash,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    return { message: 'Password berhasil direset' };
  }

  // ===== 6. GET PROFILE =====
  async getProfile(idUser: string) {
    const user = await this.prisma.user.findUnique({
      where: { idUser },
      include: {
        karyawan: {
          include: {
            jabatan: {
              include: {
                departemen: true,
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

    const { roles, permissions } = await this.getRolesAndPermissions(
      user as unknown as UserWithRelations,
    );

    return {
      idUser: user.idUser,
      username: user.username,
      email: user.email,
      karyawan: user.karyawan
        ? {
            idKaryawan: user.karyawan.idKaryawan,
            nama: user.karyawan.nama,
            nik: user.karyawan.nik,
            email: user.karyawan.email,
            jabatan: {
              namaJabatan: user.karyawan.jabatan?.namaJabatan,
              departemen: user.karyawan.jabatan?.departemen?.namaDepartemen,
            },
          }
        : null,
      useDepartmentRole: user.useDepartmentRole,
      roles: this.mapRolesToInfo(roles),
      permissions,
    };
  }

  // ===== 7. TOGGLE USER STATUS =====
  async toggleUserStatus(idUser: string): Promise<ToggleUserStatusResponse> {
    const user = await this.prisma.user.findUnique({
      where: { idUser },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const updatedUser = await this.prisma.user.update({
      where: { idUser },
      data: {
        isActive: !user.isActive,
      },
    });

    return {
      idUser: updatedUser.idUser,
      username: updatedUser.username,
      isActive: updatedUser.isActive,
    };
  }

  // ===== 8. GET ALL USERS =====
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<GetAllUsersResponse> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          karyawan: {
            select: {
              idKaryawan: true,
              nama: true,
              nik: true,
              jabatan: {
                select: {
                  namaJabatan: true,
                  departemen: {
                    select: {
                      namaDepartemen: true,
                    },
                  },
                },
              },
            },
          },
          userRoles: {
            include: {
              role: {
                select: {
                  idRole: true,
                  namaRole: true,
                  level: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.user.count(),
    ]);

    // Map users with roles info
    const mappedUsers = await Promise.all(
      users.map(async (user) => {
        const { roles, permissions } = await this.getRolesAndPermissions(
          user as unknown as UserWithRelations,
        );

        return {
          idUser: user.idUser,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          useDepartmentRole: user.useDepartmentRole,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          karyawan: user.karyawan
            ? {
                idKaryawan: user.karyawan.idKaryawan,
                nama: user.karyawan.nama,
                nik: user.karyawan.nik,
                jabatan: {
                  namaJabatan: user.karyawan.jabatan?.namaJabatan,
                  departemen: user.karyawan.jabatan?.departemen?.namaDepartemen,
                },
              }
            : null,
          roles: this.mapRolesToInfo(roles),
          permissions,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: mappedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
