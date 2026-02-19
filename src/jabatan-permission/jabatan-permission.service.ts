/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssignPermissionDto,
  BulkAssignPermissionsDto,
  UpdatePermissionLevelDto,
  FilterJabatanPermissionDto,
  PermissionMatrixDto,
} from './dto/jabatan-permission.dto';

@Injectable()
export class JabatanPermissionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all permissions for a specific jabatan
   */
  async getJabatanPermissions(idJabatan: string) {
    const jabatan = await this.prisma.refJabatan.findUnique({
      where: { idJabatan },
      include: {
        departemen: true,
      },
    });

    if (!jabatan) {
      throw new NotFoundException('Jabatan tidak ditemukan');
    }

    const permissions = await this.prisma.jabatanPermission.findMany({
      where: { idJabatan },
      include: {
        permission: true,
      },
      orderBy: {
        permission: {
          namaPermission: 'asc',
        },
      },
    });

    return {
      jabatan: {
        idJabatan: jabatan.idJabatan,
        namaJabatan: jabatan.namaJabatan,
        departemen: jabatan.departemen,
      },
      permissions: permissions.map((jp) => ({
        idPermission: jp.idPermission,
        namaPermission: jp.permission.namaPermission,
        deskripsi: jp.permission.deskripsi,
        levelAkses: jp.levelAkses,
        levelAksesBinary: jp.levelAkses.toString(2).padStart(4, '0'), // untuk debugging
        hasRead: (jp.levelAkses & 1) === 1,
        hasCreate: (jp.levelAkses & 2) === 2,
        hasUpdate: (jp.levelAkses & 4) === 4,
        hasDelete: (jp.levelAkses & 8) === 8,
      })),
    };
  }

  /**
   * Assign single permission to jabatan
   */
  async assignPermission(idJabatan: string, assignDto: AssignPermissionDto) {
    // Validate jabatan exists
    const jabatan = await this.prisma.refJabatan.findUnique({
      where: { idJabatan },
    });

    if (!jabatan) {
      throw new NotFoundException('Jabatan tidak ditemukan');
    }

    // Validate permission exists
    const permission = await this.prisma.refPermission.findUnique({
      where: { idPermission: Number(assignDto.idPermission) },
    });

    if (!permission) {
      throw new NotFoundException('Permission tidak ditemukan');
    }

    // Check if already exists
    const existing = await this.prisma.jabatanPermission.findUnique({
      where: {
        idJabatan_idPermission: {
          idJabatan,
          idPermission: Number(assignDto.idPermission),
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Permission "${permission.namaPermission}" sudah di-assign ke jabatan ini`,
      );
    }

    // Create assignment
    return this.prisma.jabatanPermission.create({
      data: {
        idJabatan,
        idPermission: Number(assignDto.idPermission),
        levelAkses: assignDto.levelAkses,
      },
      include: {
        permission: true,
        jabatan: {
          include: {
            departemen: true,
          },
        },
      },
    });
  }

  /**
   * Bulk assign permissions to jabatan
   */
  async bulkAssignPermissions(
    idJabatan: string,
    bulkDto: BulkAssignPermissionsDto,
  ) {
    // Validate jabatan exists
    const jabatan = await this.prisma.refJabatan.findUnique({
      where: { idJabatan },
    });

    if (!jabatan) {
      throw new NotFoundException('Jabatan tidak ditemukan');
    }

    // Validate all permissions exist
    const permissionIds = bulkDto.permissions.map((p) =>
      Number(p.idPermission),
    );
    const permissions = await this.prisma.refPermission.findMany({
      where: { idPermission: { in: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Beberapa permission tidak ditemukan');
    }

    // Delete existing permissions for this jabatan (replace strategy)
    await this.prisma.jabatanPermission.deleteMany({
      where: { idJabatan },
    });

    // Bulk create
    const created = await this.prisma.jabatanPermission.createMany({
      data: bulkDto.permissions.map((p) => ({
        idJabatan,
        idPermission: Number(p.idPermission),
        levelAkses: p.levelAkses,
      })),
    });

    return {
      message: `Berhasil assign ${created.count} permissions`,
      count: created.count,
    };
  }

  /**
   * Update permission level for jabatan
   */
  async updatePermissionLevel(
    idJabatan: string,
    idPermission: string,
    updateDto: UpdatePermissionLevelDto,
  ) {
    const existing = await this.prisma.jabatanPermission.findUnique({
      where: {
        idJabatan_idPermission: {
          idJabatan,
          idPermission: Number(idPermission),
        },
      },
      include: {
        permission: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Permission assignment tidak ditemukan');
    }

    return this.prisma.jabatanPermission.update({
      where: {
        idJabatan_idPermission: {
          idJabatan,
          idPermission: Number(idPermission),
        },
      },
      data: {
        levelAkses: updateDto.levelAkses,
      },
      include: {
        permission: true,
        jabatan: {
          include: {
            departemen: true,
          },
        },
      },
    });
  }

  /**
   * Remove permission from jabatan
   */
  async removePermission(idJabatan: string, idPermission: string) {
    const existing = await this.prisma.jabatanPermission.findUnique({
      where: {
        idJabatan_idPermission: {
          idJabatan,
          idPermission: Number(idPermission),
        },
      },
      include: {
        permission: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Permission assignment tidak ditemukan');
    }

    await this.prisma.jabatanPermission.delete({
      where: {
        idJabatan_idPermission: {
          idJabatan,
          idPermission: Number(idPermission),
        },
      },
    });

    return {
      message: `Permission "${existing.permission.namaPermission}" berhasil dihapus dari jabatan`,
    };
  }

  /**
   * Get permission matrix (all jabatans with their permissions)
   */
  async getPermissionMatrix(
    filterDto?: FilterJabatanPermissionDto,
  ): Promise<PermissionMatrixDto[]> {
    const where: any = {};

    if (filterDto?.idJabatan) {
      where.idJabatan = filterDto.idJabatan;
    }

    if (filterDto?.idDepartemen) {
      where.jabatan = {
        idDepartemen: filterDto.idDepartemen,
      };
    }

    const jabatans = await this.prisma.refJabatan.findMany({
      where,
      include: {
        departemen: true,
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: [
        { departemen: { namaDepartemen: 'asc' } },
        { namaJabatan: 'asc' },
      ],
    });

    return jabatans.map((jabatan) => ({
      idJabatan: jabatan.idJabatan,
      namaJabatan: jabatan.namaJabatan,
      namaDepartemen: jabatan.departemen.namaDepartemen,
      permissions: jabatan.permissions.reduce(
        (acc, jp) => {
          acc[jp.permission.namaPermission] = jp.levelAkses;
          return acc;
        },
        {} as Record<string, number>,
      ),
    }));
  }

  /**
   * Get available permissions (all permissions in system)
   */
  async getAvailablePermissions() {
    return this.prisma.refPermission.findMany({
      orderBy: {
        namaPermission: 'asc',
      },
    });
  }

  /**
   * Compare permissions between two jabatans
   */
  async compareJabatans(idJabatan1: string, idJabatan2: string) {
    const [jabatan1, jabatan2] = await Promise.all([
      this.getJabatanPermissions(idJabatan1),
      this.getJabatanPermissions(idJabatan2),
    ]);

    const permissions1 = new Map(
      jabatan1.permissions.map((p) => [p.namaPermission, p.levelAkses]),
    );
    const permissions2 = new Map(
      jabatan2.permissions.map((p) => [p.namaPermission, p.levelAkses]),
    );

    const allPermissionNames = new Set([
      ...permissions1.keys(),
      ...permissions2.keys(),
    ]);

    const comparison = Array.from(allPermissionNames).map((name) => ({
      permissionName: name,
      jabatan1Level: permissions1.get(name) || 0,
      jabatan2Level: permissions2.get(name) || 0,
      isDifferent:
        (permissions1.get(name) || 0) !== (permissions2.get(name) || 0),
    }));

    return {
      jabatan1: jabatan1.jabatan,
      jabatan2: jabatan2.jabatan,
      comparison: comparison.sort((a, b) =>
        a.permissionName.localeCompare(b.permissionName),
      ),
      summary: {
        total: comparison.length,
        same: comparison.filter((c) => !c.isDifferent).length,
        different: comparison.filter((c) => c.isDifferent).length,
      },
    };
  }

  /**
   * Clone permissions from one jabatan to another
   */
  async clonePermissions(fromJabatan: string, toJabatan: string) {
    // Validate both jabatans exist
    const [source, target] = await Promise.all([
      this.prisma.refJabatan.findUnique({ where: { idJabatan: fromJabatan } }),
      this.prisma.refJabatan.findUnique({ where: { idJabatan: toJabatan } }),
    ]);

    if (!source) {
      throw new NotFoundException('Source jabatan tidak ditemukan');
    }

    if (!target) {
      throw new NotFoundException('Target jabatan tidak ditemukan');
    }

    // Get source permissions
    const sourcePermissions = await this.prisma.jabatanPermission.findMany({
      where: { idJabatan: fromJabatan },
    });

    if (sourcePermissions.length === 0) {
      throw new BadRequestException('Source jabatan tidak memiliki permission');
    }

    // Delete existing permissions from target
    await this.prisma.jabatanPermission.deleteMany({
      where: { idJabatan: toJabatan },
    });

    // Clone permissions
    const created = await this.prisma.jabatanPermission.createMany({
      data: sourcePermissions.map((sp) => ({
        idJabatan: toJabatan,
        idPermission: sp.idPermission,
        levelAkses: sp.levelAkses,
      })),
    });

    return {
      message: `Berhasil clone ${created.count} permissions dari "${source.namaJabatan}" ke "${target.namaJabatan}"`,
      count: created.count,
    };
  }
}
