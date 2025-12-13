/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/karyawan/karyawan.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusKaryawan } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class KaryawanService {
  constructor(private prisma: PrismaService) {}

  /**
   * Assign custom role ke karyawan (override jabatan default)
   */
  async assignCustomRole(idKaryawan: string, roleIds: number[]) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan },
    });

    if (!karyawan || karyawan.status !== StatusKaryawan.aktif) {
      throw new BadRequestException('Karyawan tidak aktif');
    }

    // Hapus role lama
    await this.prisma.karyawanRole.deleteMany({
      where: { idKaryawan },
    });

    // Assign role baru
    await this.prisma.karyawanRole.createMany({
      data: roleIds.map((idRole) => ({
        idKaryawan,
        idRole,
      })),
    });

    // Set useJabatanRole = false (pakai custom role)
    await this.prisma.refKaryawan.update({
      where: { idKaryawan },
      data: { useJabatanRole: false },
    });

    return { message: 'Custom role berhasil di-assign' };
  }

  /**
   * Reset ke role default JABATAN
   */
  async resetToJabatanRole(idKaryawan: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan },
      include: {
        jabatan: {
          include: {
            roleDefault: true,
          },
        },
      },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    // Hapus custom role
    await this.prisma.karyawanRole.deleteMany({
      where: { idKaryawan },
    });

    // Assign role default JABATAN
    await this.prisma.karyawanRole.create({
      data: {
        idKaryawan,
        idRole: karyawan.jabatan.idRoleDefault,
      },
    });

    // Set useJabatanRole = true
    await this.prisma.refKaryawan.update({
      where: { idKaryawan },
      data: { useJabatanRole: true },
    });

    return { message: 'Role berhasil di-reset ke default jabatan' };
  }

  /**
   * Upgrade ke role jabatan (dari role Karyawan default)
   */
  async upgradeToJabatanRole(idKaryawan: string, grantedBy: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan },
      include: {
        jabatan: {
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
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    // Hapus role lama (role Karyawan default)
    await this.prisma.karyawanRole.deleteMany({
      where: { idKaryawan },
    });

    // Assign role jabatan
    await this.prisma.karyawanRole.create({
      data: {
        idKaryawan,
        idRole: karyawan.jabatan.idRoleDefault,
      },
    });

    // Set useJabatanRole = true
    await this.prisma.refKaryawan.update({
      where: { idKaryawan },
      data: { useJabatanRole: true },
    });

    return {
      message: 'Karyawan berhasil di-upgrade ke role jabatan',
      previousRole: 'Karyawan (basic access)',
      newRole: karyawan.jabatan.roleDefault.namaRole,
      permissions: karyawan.jabatan.roleDefault.permissions.map(
        (p) => p.permission,
      ),
    };
  }

  /**
   * Add permission override (add extra permission ke karyawan)
   * WITH AUDIT LOG
   */
  async addPermissionOverride(
    idKaryawan: string,
    idPermission: number,
    deskripsi: string | undefined,
    grantedBy: string, // ID of user who grants this permission (usually HRD)
  ) {
    await this.prisma.karyawanPermissionOverride.upsert({
      where: {
        idKaryawan_idPermission: {
          idKaryawan,
          idPermission,
        },
      },
      create: {
        idKaryawan,
        idPermission,
        typePermission: true, // ADD permission
        deskripsi,
      },
      update: {
        typePermission: true,
        deskripsi,
      },
    });

    // Create audit log
    await this.prisma.permissionAuditLog.create({
      data: {
        idKaryawan,
        idPermission,
        action: 'ADD',
        typePermission: true,
        grantedBy,
        deskripsi,
      },
    });

    return { message: 'Permission berhasil ditambahkan' };
  }

  async removePermissionOverride(
    idKaryawan: string,
    idPermission: number,
    deskripsi: string | undefined,
    grantedBy: string,
  ) {
    await this.prisma.karyawanPermissionOverride.upsert({
      where: {
        idKaryawan_idPermission: {
          idKaryawan,
          idPermission,
        },
      },
      create: {
        idKaryawan,
        idPermission,
        typePermission: false, // REMOVE permission
        deskripsi,
      },
      update: {
        typePermission: false,
        deskripsi,
      },
    });

    // Create audit log
    await this.prisma.permissionAuditLog.create({
      data: {
        idKaryawan,
        idPermission,
        action: 'REMOVE',
        typePermission: false,
        grantedBy,
        deskripsi,
      },
    });

    return { message: 'Permission berhasil dihapus' };
  }

  /**
   * Delete permission override (kembalikan ke default role permission)
   * WITH AUDIT LOG
   */
  async deletePermissionOverride(
    idKaryawan: string,
    idPermission: number,
    grantedBy: string,
  ) {
    const override = await this.prisma.karyawanPermissionOverride.findUnique({
      where: {
        idKaryawan_idPermission: {
          idKaryawan,
          idPermission,
        },
      },
    });

    if (!override) {
      throw new NotFoundException('Permission override tidak ditemukan');
    }

    await this.prisma.karyawanPermissionOverride.delete({
      where: {
        idKaryawan_idPermission: {
          idKaryawan,
          idPermission,
        },
      },
    });

    // Create audit log
    await this.prisma.permissionAuditLog.create({
      data: {
        idKaryawan,
        idPermission,
        action: 'DELETE_OVERRIDE',
        typePermission: override.typePermission,
        grantedBy,
        deskripsi: 'Deleted permission override, back to default',
      },
    });

    return { message: 'Permission override berhasil dihapus' };
  }

  /**
   * Get permission audit logs for a karyawan
   */
  async getPermissionAuditLogs(idKaryawan: string) {
    const logs = await this.prisma.permissionAuditLog.findMany({
      where: { idKaryawan },
      include: {
        permission: true,
        grantor: {
          select: {
            idKaryawan: true,
            nama: true,
            nik: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return logs;
  }

  /**
   * Get all permission audit logs (for HRD to monitor)
   */
  async getAllPermissionAuditLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    action?: string;
  }) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    const logs = await this.prisma.permissionAuditLog.findMany({
      where,
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nama: true,
            nik: true,
          },
        },
        permission: true,
        grantor: {
          select: {
            idKaryawan: true,
            nama: true,
            nik: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to last 100 logs
    });

    return logs;
  }

  /**
   * Get effective permissions untuk karyawan
   * Menggabungkan permission dari role + override
   */
  async getEffectivePermissions(idKaryawan: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan },
      include: {
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
        jabatan: {
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
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    // 1. Get base permissions dari role
    let basePermissions: Set<number>;

    if (karyawan.useJabatanRole) {
      // Pakai role default JABATAN
      const roleDefault = karyawan.jabatan.roleDefault;
      basePermissions = new Set(
        roleDefault.permissions.map((p) => p.permission.idPermission),
      );
    } else {
      // Pakai custom role
      basePermissions = new Set();
      karyawan.karyawanRoles.forEach((kr) => {
        kr.role.permissions.forEach((p) => {
          basePermissions.add(p.permission.idPermission);
        });
      });
    }

    // 2. Apply overrides
    const overrides = karyawan.karyawanPermissionOverrides;

    overrides.forEach((override) => {
      if (override.typePermission) {
        // ADD: tambahkan permission
        basePermissions.add(override.idPermission);
      } else {
        // REMOVE: hapus permission
        basePermissions.delete(override.idPermission);
      }
    });

    // 3. Get full permission details
    const effectivePermissions = await this.prisma.refPermission.findMany({
      where: {
        idPermission: {
          in: Array.from(basePermissions),
        },
      },
    });

    return {
      karyawan: {
        idKaryawan: karyawan.idKaryawan,
        nama: karyawan.nama,
        username: karyawan.username,
        useJabatanRole: karyawan.useJabatanRole,
      },
      jabatan: karyawan.jabatan,
      roles: karyawan.useJabatanRole
        ? [karyawan.jabatan.roleDefault]
        : karyawan.karyawanRoles.map((kr) => kr.role),
      effectivePermissions,
      overrides: overrides.map((o) => ({
        permission: o.permission,
        type: o.typePermission ? 'ADD' : 'REMOVE',
        deskripsi: o.deskripsi,
      })),
    };
  }

  // Helper methods
  private generateUsername(nama: string, nik: string): string {
    const cleanNama = nama.toLowerCase().replace(/\s+/g, '.');
    return `${cleanNama}.${nik.slice(-4)}`;
  }

  async create(createKaryawanDto: any) {
    try {
      // Validate jabatan exists
      const jabatan = await this.prisma.refJabatan.findUnique({
        where: { idJabatan: createKaryawanDto.idJabatan },
      });

      if (!jabatan) {
        throw new BadRequestException('Jabatan tidak ditemukan');
      }

      // Transform dates
      const data = {
        ...createKaryawanDto,
        tanggalLahir: createKaryawanDto.tanggalLahir
          ? new Date(createKaryawanDto.tanggalLahir)
          : undefined,
        tanggalMasuk: createKaryawanDto.tanggalMasuk
          ? new Date(createKaryawanDto.tanggalMasuk)
          : new Date(),

        status: StatusKaryawan.candidate,
        statusKeaktifan: false,

        username: null,
        passwordHash: null,
        useJabatanRole: true,
        isActive: false,

        // Reset auth fields
        lastLogin: null,
        loginAttempts: 0,
        lockedUntil: null,
        resetToken: null,
        resetTokenExpires: null,
      };

      // Create WITHOUT role assignment
      const karyawan = await this.prisma.refKaryawan.create({
        data,
        include: {
          jabatan: {
            include: {
              departemen: true,
            },
          },
        },
      });

      return {
        ...karyawan,
        message:
          'Karyawan berhasil dibuat sebagai candidate. Lakukan approve untuk mengaktifkan.',
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          `Data duplikat: ${error.meta?.target?.join(', ')}`,
        );
      }
      throw new BadRequestException(error.message || 'Terjadi kesalahan');
    }
  }

  /**
   * Find all karyawan
   */
  async findAll(filterDto: any) {
    const {
      page = 1,
      limit = 10,
      status,
      idDepartemen,
      idJabatan,
      search,
    } = filterDto;

    // ✅ PARSE to number & validate
    const validPage = Math.max(1, parseInt(page as string) || 1);
    const validLimit = Math.max(1, parseInt(limit as string) || 10);

    const skip = (validPage - 1) * validLimit;
    const where: any = {};

    if (status) where.status = status;
    if (idJabatan) where.idJabatan = idJabatan;
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (idDepartemen) {
      where.jabatan = { idDepartemen };
    }

    const [rawData, total] = await Promise.all([
      this.prisma.refKaryawan.findMany({
        where,
        skip,
        take: validLimit, // ✅ Use parsed number
        include: {
          jabatan: {
            include: {
              departemen: true,
              roleDefault: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refKaryawan.count({ where }),
    ]);

    // ✅ FIX: Safe transform dengan null check
    const data = rawData.map((karyawan) => {
      // Check if jabatan exists
      if (!karyawan.jabatan) {
        return karyawan;
      }

      // Only transform for candidates
      if (karyawan.status === StatusKaryawan.candidate) {
        const { roleDefault, ...jabatanSansRole } = karyawan.jabatan;
        return {
          ...karyawan,
          jabatan: jabatanSansRole,
        };
      }

      return karyawan;
    });

    const totalPages = Math.ceil(total / validLimit);

    return {
      data,
      meta: {
        page: validPage, // ✅ Return validated values
        limit: validLimit,
        total,
        totalPages: totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    };
  }
  /**
   * Find one by ID
   */
  async findOne(id: string, includeUser: boolean = false) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
      include: {
        jabatan: {
          include: {
            departemen: true,
            roleDefault: true,
          },
        },
        karyawanRoles: includeUser ? { include: { role: true } } : undefined,
      },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    return karyawan;
  }

  /**
   * Find one raw (internal)
   */
  async findOneRaw(id: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    return karyawan;
  }

  /**
   * Update karyawan
   */
  async update(id: string, updateKaryawanDto: any) {
    await this.findOneRaw(id);

    // Transform dates if present
    const data: any = { ...updateKaryawanDto };
    if (data.tanggalLahir) data.tanggalLahir = new Date(data.tanggalLahir);
    if (data.tanggalMasuk) data.tanggalMasuk = new Date(data.tanggalMasuk);
    if (data.tanggalResign) data.tanggalResign = new Date(data.tanggalResign);

    const karyawan = await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data,
      include: {
        jabatan: {
          include: {
            departemen: true,
            roleDefault: true,
          },
        },
      },
    });

    return karyawan;
  }

  /**
   * Delete (soft delete)
   */
  async remove(id: string) {
    await this.findOneRaw(id);

    await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: {
        statusKeaktifan: false,
        isActive: false,
      },
    });

    return { message: 'Karyawan berhasil dihapus' };
  }

  /**
   * Approve candidate → Auto-generate credentials + assign role jabatan
   * ✅ Dapat role dari jabatan
   * ✅ Username & password auto-generated dari nama
   * ✅ Password di-hash
   * ✅ Bisa login langsung
   */
  async approveCandidate(id: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
      include: {
        jabatan: {
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
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    if (karyawan.status !== StatusKaryawan.candidate) {
      throw new BadRequestException('Karyawan bukan candidate');
    }

    // ✅ 1. AUTO-GENERATE username dari nama
    let baseUsername = this.generateUsernameFromName(karyawan.nama);
    let username = baseUsername;
    let counter = 1;

    // Check uniqueness
    while (await this.isUsernameExists(username)) {
      username = `${baseUsername}.${counter}`;
      counter++;
    }

    // ✅ 2. AUTO-GENERATE password dari nama (plain)
    const plainPassword = karyawan.nama
      .toLowerCase()
      .replace(/\s+/g, '') // Hapus spasi
      .replace(/[^a-z0-9]/g, ''); // Hanya huruf & angka

    // ✅ 3. HASH password
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // ✅ 4. Update: aktif + credentials
    const updated = await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: {
        status: StatusKaryawan.aktif,
        statusKeaktifan: true,
        username,
        passwordHash,
        useJabatanRole: true, // ✅ Pakai role jabatan
        isActive: true, // ✅ BISA LOGIN
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
      },
    });

    // ✅ 5. Assign role jabatan ke karyawan_role table
    await this.prisma.karyawanRole.create({
      data: {
        idKaryawan: id,
        idRole: updated.jabatan.idRoleDefault,
      },
    });

    return {
      karyawan: updated,
      message:
        'Candidate berhasil di-approve. Account sudah aktif dan bisa login.',
      credentials: {
        username,
        password: plainPassword, // ⚠️ Plain password - CATAT!
        info: '⚠️ PENTING: Simpan password ini! Di database sudah ter-hash.',
      },
      role: updated.jabatan.roleDefault,
      permissions: updated.jabatan.roleDefault.permissions.map(
        (p) => p.permission,
      ),
    };
  }

  /**
   * Reject candidate
   */
  async rejectCandidate(id: string) {
    const karyawan = await this.findOneRaw(id);

    if (karyawan.status !== StatusKaryawan.candidate) {
      throw new BadRequestException('Karyawan bukan candidate');
    }

    const updated = await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: {
        status: StatusKaryawan.rejected,
        statusKeaktifan: false,
      },
    });

    return updated;
  }

  /**
   * Resign karyawan
   */
  async resignKaryawan(id: string, tanggalResign?: Date) {
    const karyawan = await this.findOneRaw(id);

    if (karyawan.status !== StatusKaryawan.aktif) {
      throw new BadRequestException('Hanya karyawan aktif yang bisa resign');
    }

    const updated = await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: {
        status: StatusKaryawan.resign,
        statusKeaktifan: false,
        isActive: false,
        tanggalResign: tanggalResign || new Date(),
      },
    });

    return updated;
  }

  // Helper methods
  private generateUsernameFromName(nama: string): string {
    return nama
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '.') // Spasi → titik
      .replace(/[^a-z0-9.]/g, ''); // Hanya huruf, angka, titik
  }

  private async isUsernameExists(username: string): Promise<boolean> {
    const exists = await this.prisma.refKaryawan.findUnique({
      where: { username },
    });
    return !!exists;
  }
}
