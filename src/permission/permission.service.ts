// src/permission/permission.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  FilterPermissionDto,
} from './dto/permission.dto';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // GET ALL (dengan pagination + search)
  // ============================================================
  async findAll(filters: FilterPermissionDto) {
    const { page = 1, limit = 10, search } = filters;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              namaPermission: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              deskripsi: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.refPermission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { idPermission: 'asc' },
      }),
      this.prisma.refPermission.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages, // ✅ sesuai PaginationMeta
        hasPrevPage: page > 1, // ✅ sesuai PaginationMeta
      },
    };
  }

  // ============================================================
  // GET ONE
  // ============================================================
  async findOne(id: number) {
    const permission = await this.prisma.refPermission.findUnique({
      where: { idPermission: id },
      include: {
        jabatanPermissions: {
          include: {
            jabatan: {
              select: {
                idJabatan: true,
                namaJabatan: true,
              },
            },
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission dengan ID ${id} tidak ditemukan`);
    }

    return permission;
  }

  // ============================================================
  // CREATE
  // ============================================================
  async create(dto: CreatePermissionDto) {
    const existing = await this.prisma.refPermission.findFirst({
      where: { namaPermission: dto.namaPermission },
    });

    if (existing) {
      throw new ConflictException(
        `Permission '${dto.namaPermission}' sudah ada`,
      );
    }

    return this.prisma.refPermission.create({
      data: {
        namaPermission: dto.namaPermission,
        deskripsi: dto.deskripsi,
      },
    });
  }

  // ============================================================
  // UPDATE
  // ============================================================
  async update(id: number, dto: UpdatePermissionDto) {
    await this.findOne(id);

    if (dto.namaPermission) {
      const existing = await this.prisma.refPermission.findFirst({
        where: {
          namaPermission: dto.namaPermission,
          NOT: { idPermission: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Permission '${dto.namaPermission}' sudah digunakan`,
        );
      }
    }

    return this.prisma.refPermission.update({
      where: { idPermission: id },
      data: dto,
    });
  }

  // ============================================================
  // DELETE
  // ============================================================
  async remove(id: number) {
    await this.findOne(id);

    const usageCount = await this.prisma.jabatanPermission.count({
      where: { idPermission: id },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Permission ini masih digunakan oleh ${usageCount} jabatan. Hapus assignment terlebih dahulu.`,
      );
    }

    return this.prisma.refPermission.delete({
      where: { idPermission: id },
    });
  }
}
