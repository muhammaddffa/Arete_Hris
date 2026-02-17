/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prefer-const */
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

  // ============================================================
  // PERMISSION OVERRIDE
  // ============================================================

  /**
   * Grant permission override ke karyawan + audit log
   */
  async addPermissionOverride(
    idKaryawan: string,
    idPermission: number,
    levelAkses: number, // bitmask: READ=1, CREATE=2, UPDATE=4, DELETE=8
    deskripsi: string | undefined,
    grantedBy: string,
  ) {
    await this.prisma.karyawanPermissionOverride.upsert({
      where: { idKaryawan_idPermission: { idKaryawan, idPermission } },
      create: {
        idKaryawan,
        idPermission,
        typePermission: true, // grant
        levelAkses,
        deskripsi,
      },
      update: {
        typePermission: true,
        levelAkses,
        deskripsi,
      },
    });

    await this.prisma.permissionAuditLog.create({
      data: {
        idKaryawan,
        idPermission,
        action: 'GRANT',
        typePermission: true,
        levelAkses,
        grantedBy,
        deskripsi,
      },
    });

    return { message: 'Permission berhasil ditambahkan' };
  }

  /**
   * Revoke permission dari karyawan (cabut permission jabatan) + audit log
   */
  async removePermissionOverride(
    idKaryawan: string,
    idPermission: number,
    deskripsi: string | undefined,
    grantedBy: string,
  ) {
    await this.prisma.karyawanPermissionOverride.upsert({
      where: { idKaryawan_idPermission: { idKaryawan, idPermission } },
      create: {
        idKaryawan,
        idPermission,
        typePermission: false, // revoke
        levelAkses: null,
        deskripsi,
      },
      update: {
        typePermission: false,
        levelAkses: null,
        deskripsi,
      },
    });

    await this.prisma.permissionAuditLog.create({
      data: {
        idKaryawan,
        idPermission,
        action: 'REVOKE',
        typePermission: false,
        levelAkses: null,
        grantedBy,
        deskripsi,
      },
    });

    return { message: 'Permission berhasil dicabut' };
  }

  /**
   * Hapus override — karyawan kembali ke permission jabatan
   */
  async deletePermissionOverride(
    idKaryawan: string,
    idPermission: number,
    grantedBy: string,
  ) {
    const override = await this.prisma.karyawanPermissionOverride.findUnique({
      where: { idKaryawan_idPermission: { idKaryawan, idPermission } },
    });

    if (!override) {
      throw new NotFoundException('Permission override tidak ditemukan');
    }

    await this.prisma.karyawanPermissionOverride.delete({
      where: { idKaryawan_idPermission: { idKaryawan, idPermission } },
    });

    await this.prisma.permissionAuditLog.create({
      data: {
        idKaryawan,
        idPermission,
        action: 'DELETE_OVERRIDE',
        typePermission: override.typePermission,
        levelAkses: override.levelAkses,
        grantedBy,
        deskripsi: 'Override dihapus, kembali ke permission jabatan',
      },
    });

    return { message: 'Permission override berhasil dihapus' };
  }

  /**
   * Get permission audit logs per karyawan
   */
  async getPermissionAuditLogs(idKaryawan: string) {
    return this.prisma.permissionAuditLog.findMany({
      where: { idKaryawan },
      include: {
        permission: true,
        grantedByKaryawan: {
          // sesuai nama relasi di schema
          select: { idKaryawan: true, nama: true, nik: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get semua audit log (untuk HRD monitor)
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

    return this.prisma.permissionAuditLog.findMany({
      where,
      include: {
        karyawan: {
          select: { idKaryawan: true, nama: true, nik: true },
        },
        permission: true,
        grantedByKaryawan: {
          // sesuai nama relasi di schema
          select: { idKaryawan: true, nama: true, nik: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Get effective permissions karyawan
   * Base dari jabatan_permission + override
   */
  async getEffectivePermissions(idKaryawan: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan },
      select: {
        idKaryawan: true,
        nama: true,
        username: true,
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
                  select: {
                    idPermission: true,
                    namaPermission: true,
                    deskripsi: true,
                  },
                },
              },
            },
          },
        },
        karyawanPermissionOverrides: {
          select: {
            typePermission: true,
            levelAkses: true,
            deskripsi: true,
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

    // Resolve effective permissions (jabatan + override)
    const result: Record<string, number> = {};

    for (const jp of karyawan.jabatan.permissions) {
      result[jp.permission.namaPermission] = Number(jp.levelAkses);
    }

    for (const override of karyawan.karyawanPermissionOverrides) {
      const nama = override.permission.namaPermission;
      if (!override.typePermission) {
        delete result[nama]; // revoke
      } else if (override.levelAkses !== null) {
        result[nama] = Number(override.levelAkses); // grant
      }
    }

    return {
      karyawan: {
        idKaryawan: karyawan.idKaryawan,
        nama: karyawan.nama,
        username: karyawan.username,
      },
      jabatan: {
        idJabatan: karyawan.jabatan.idJabatan,
        namaJabatan: karyawan.jabatan.namaJabatan,
        departemen: karyawan.jabatan.departemen,
      },
      // { namaPermission → levelAkses bitmask }
      effectivePermissions: result,
      overrides: karyawan.karyawanPermissionOverrides.map((o) => ({
        permission: o.permission,
        type: o.typePermission ? 'GRANT' : 'REVOKE',
        levelAkses: o.levelAkses,
        deskripsi: o.deskripsi,
      })),
    };
  }

  // ============================================================
  // KARYAWAN CRUD
  // ============================================================

  async create(createKaryawanDto: any) {
    try {
      const jabatan = await this.prisma.refJabatan.findUnique({
        where: { idJabatan: createKaryawanDto.idJabatan },
      });

      if (!jabatan) {
        throw new BadRequestException('Jabatan tidak ditemukan');
      }

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
        isActive: false,
        lastLogin: null,
        loginAttempts: 0,
        lockedUntil: null,
        resetToken: null,
        resetTokenExpires: null,
      };

      const karyawan = await this.prisma.refKaryawan.create({
        data,
        include: {
          jabatan: {
            include: { departemen: true },
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

  async findAll(filterDto: any) {
    const {
      page = 1,
      limit = 10,
      status,
      idDepartemen,
      idJabatan,
      search,
    } = filterDto;

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

    const [data, total] = await Promise.all([
      this.prisma.refKaryawan.findMany({
        where,
        skip,
        take: validLimit,
        include: {
          jabatan: {
            include: { departemen: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refKaryawan.count({ where }),
    ]);

    const totalPages = Math.ceil(total / validLimit);

    return {
      data,
      meta: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    };
  }

  async findOne(id: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
      include: {
        jabatan: {
          include: {
            departemen: true,
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        karyawanPermissionOverrides: {
          include: { permission: true },
        },
      },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    return karyawan;
  }

  async findOneRaw(id: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    return karyawan;
  }

  async update(id: string, updateKaryawanDto: any) {
    await this.findOneRaw(id);

    const data: any = { ...updateKaryawanDto };
    if (data.tanggalLahir) data.tanggalLahir = new Date(data.tanggalLahir);
    if (data.tanggalMasuk) data.tanggalMasuk = new Date(data.tanggalMasuk);
    if (data.tanggalResign) data.tanggalResign = new Date(data.tanggalResign);

    return this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data,
      include: {
        jabatan: {
          include: { departemen: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOneRaw(id);

    await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: { statusKeaktifan: false, isActive: false },
    });

    return { message: 'Karyawan berhasil dihapus' };
  }

  // ============================================================
  // STATUS KARYAWAN
  // ============================================================

  /**
   * Approve candidate → aktifkan akun + auto-generate credentials
   * Permission otomatis dari jabatan_permission
   */
  async approveCandidate(id: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
      include: {
        jabatan: {
          include: {
            departemen: true,
            permissions: {
              include: { permission: true },
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

    // Auto-generate username dari nama
    let baseUsername = this.generateUsernameFromName(karyawan.nama);
    let username = baseUsername;
    let counter = 1;

    while (await this.isUsernameExists(username)) {
      username = `${baseUsername}.${counter}`;
      counter++;
    }

    // Auto-generate password dari nama
    const plainPassword = karyawan.nama
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const updated = await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: {
        status: StatusKaryawan.aktif,
        statusKeaktifan: true,
        username,
        passwordHash,
        isActive: true,
        mustChangePassword: true,
      },
      include: {
        jabatan: {
          include: {
            departemen: true,
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    return {
      karyawan: updated,
      message:
        'Candidate berhasil di-approve. Akun sudah aktif dan bisa login.',
      credentials: {
        username,
        password: plainPassword,
        info: 'Berikan credentials ini ke karyawan. Mereka wajib ganti password saat login pertama.',
      },
      // Tampilkan permission dari jabatan
      jabatanPermissions: updated.jabatan.permissions.map((jp) => ({
        namaPermission: jp.permission.namaPermission,
        levelAkses: jp.levelAkses,
      })),
    };
  }

  async rejectCandidate(id: string) {
    const karyawan = await this.findOneRaw(id);

    if (karyawan.status !== StatusKaryawan.candidate) {
      throw new BadRequestException('Karyawan bukan candidate');
    }

    return this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: {
        status: StatusKaryawan.rejected,
        statusKeaktifan: false,
      },
    });
  }

  async resignKaryawan(id: string, tanggalResign?: Date) {
    const karyawan = await this.findOneRaw(id);

    if (karyawan.status !== StatusKaryawan.aktif) {
      throw new BadRequestException('Hanya karyawan aktif yang bisa resign');
    }

    return this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: {
        status: StatusKaryawan.resign,
        statusKeaktifan: false,
        isActive: false,
        tanggalResign: tanggalResign || new Date(),
      },
    });
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private generateUsernameFromName(nama: string): string {
    return nama
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '');
  }

  private async isUsernameExists(username: string): Promise<boolean> {
    const exists = await this.prisma.refKaryawan.findUnique({
      where: { username },
      select: { idKaryawan: true },
    });
    return !!exists;
  }
}
