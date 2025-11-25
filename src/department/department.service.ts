/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  QueryDepartmentDto,
  BulkDeleteDepartmentDto,
} from './dto/department.dto';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CREATE
  // ==========================================
  async create(createDepartmentDto: CreateDepartmentDto) {
    // Validate role exists
    const roleExists = await this.prisma.refRole.findUnique({
      where: { idRole: createDepartmentDto.idRoleDefault },
      select: { idRole: true }, // Minimal select for performance
    });

    if (!roleExists) {
      throw new BadRequestException(RESPONSE_MESSAGES.ROLE.NOT_FOUND);
    }

    // Check duplicate name
    const exists = await this.prisma.refDepartemen.findFirst({
      where: {
        namaDepartemen: {
          equals: createDepartmentDto.namaDepartemen,
          mode: 'insensitive', // Case-insensitive
        },
      },
      select: { idDepartemen: true },
    });

    if (exists) {
      throw new ConflictException(RESPONSE_MESSAGES.DEPARTMENT.ALREADY_EXISTS);
    }

    // Create department
    return this.prisma.refDepartemen.create({
      data: createDepartmentDto,
      include: {
        roleDefault: {
          select: {
            idRole: true,
            namaRole: true,
            level: true,
          },
        },
      },
    });
  }

  // ==========================================
  // FIND ALL WITH ADVANCED SEARCH
  // ==========================================
  async findAll(query: QueryDepartmentDto) {
    const {
      search,
      idRoleDefault,
      includeRelations = false,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build where clause
    const where: Prisma.RefDepartemenWhereInput = {};

    // Search filter (case-insensitive)
    if (search) {
      where.OR = [
        {
          namaDepartemen: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          roleDefault: {
            namaRole: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          deskripsi: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Filter by role
    if (idRoleDefault) {
      where.idRoleDefault = idRoleDefault;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query with transaction
    const [data, total] = await this.prisma.$transaction([
      this.prisma.refDepartemen.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: includeRelations
          ? {
              roleDefault: {
                select: {
                  idRole: true,
                  namaRole: true,
                  level: true,
                },
              },
              _count: {
                select: {
                  jabatan: true,
                },
              },
            }
          : undefined,
      }),
      this.prisma.refDepartemen.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  // ==========================================
  // FIND ONE
  // ==========================================
  async findOne(id: string) {
    const departemen = await this.prisma.refDepartemen.findUnique({
      where: { idDepartemen: id },
      include: {
        roleDefault: {
          select: {
            idRole: true,
            namaRole: true,
            level: true,
            deskripsi: true,
          },
        },
        _count: {
          select: {
            jabatan: true,
          },
        },
      },
    });

    if (!departemen) {
      throw new NotFoundException(RESPONSE_MESSAGES.DEPARTMENT.NOT_FOUND);
    }

    return departemen;
  }
  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    // Check if department exists
    await this.findOne(id);

    // Validate role if being updated
    if (updateDepartmentDto.idRoleDefault) {
      const roleExists = await this.prisma.refRole.findUnique({
        where: { idRole: updateDepartmentDto.idRoleDefault },
        select: { idRole: true },
      });

      if (!roleExists) {
        throw new BadRequestException(RESPONSE_MESSAGES.ROLE.NOT_FOUND);
      }
    }

    // Check duplicate name if being updated
    if (updateDepartmentDto.namaDepartemen) {
      const exists = await this.prisma.refDepartemen.findFirst({
        where: {
          namaDepartemen: {
            equals: updateDepartmentDto.namaDepartemen,
            mode: 'insensitive',
          },
          NOT: { idDepartemen: id },
        },
        select: { idDepartemen: true },
      });

      if (exists) {
        throw new ConflictException(
          RESPONSE_MESSAGES.DEPARTMENT.ALREADY_EXISTS,
        );
      }
    }

    // Update department
    return this.prisma.refDepartemen.update({
      where: { idDepartemen: id },
      data: updateDepartmentDto,
      include: {
        roleDefault: {
          select: {
            idRole: true,
            namaRole: true,
            level: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if department exists
    await this.findOne(id);

    // Check if department has jabatan
    const jabatanCount = await this.prisma.refJabatan.count({
      where: { idDepartemen: id },
    });

    if (jabatanCount > 0) {
      throw new BadRequestException(
        `${RESPONSE_MESSAGES.DEPARTMENT.HAS_JABATAN}. Total: ${jabatanCount} jabatan`,
      );
    }

    // Delete department
    return this.prisma.refDepartemen.delete({
      where: { idDepartemen: id },
    });
  }

  async getDepartmentStats(id: string) {
    const departemen = await this.findOne(id);

    const [jabatanCount, karyawanCount] = await Promise.all([
      this.prisma.refJabatan.count({
        where: { idDepartemen: id },
      }),
      this.prisma.refKaryawan.count({
        where: {
          jabatan: {
            idDepartemen: id,
          },
          statusKeaktifan: true,
        },
      }),
    ]);

    return {
      ...departemen,
      stats: {
        totalJabatan: jabatanCount,
        totalKaryawanAktif: karyawanCount,
      },
    };
  }

  async autocomplete(query: string, limit: number = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    return this.prisma.refDepartemen.findMany({
      where: {
        namaDepartemen: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        idDepartemen: true,
        namaDepartemen: true,
        roleDefault: {
          select: {
            namaRole: true,
          },
        },
      },
      take: limit,
      orderBy: {
        namaDepartemen: 'asc',
      },
    });
  }

  async getAllStats() {
    const [total, byRole] = await Promise.all([
      this.prisma.refDepartemen.count(),
      this.prisma.refDepartemen.groupBy({
        by: ['idRoleDefault'],
        _count: true,
      }),
    ]);

    // Get role details
    const roleIds = byRole.map((r) => r.idRoleDefault);
    const roles = await this.prisma.refRole.findMany({
      where: {
        idRole: { in: roleIds },
      },
      select: {
        idRole: true,
        namaRole: true,
      },
    });

    const byRoleWithNames = byRole.map((item) => ({
      role: roles.find((r) => r.idRole === item.idRoleDefault),
      count: item._count,
    }));

    return {
      total,
      byRole: byRoleWithNames,
    };
  }

  async bulkDelete(dto: BulkDeleteDepartmentDto) {
    const { ids } = dto;

    // Check if departments have jabatan
    const departmentsWithJabatan = await this.prisma.refDepartemen.findMany({
      where: {
        idDepartemen: { in: ids },
      },
      select: {
        idDepartemen: true,
        namaDepartemen: true,
        _count: {
          select: {
            jabatan: true,
          },
        },
      },
    });

    const blocked = departmentsWithJabatan.filter((d) => d._count.jabatan > 0);

    if (blocked.length > 0) {
      throw new BadRequestException(
        `Cannot delete ${blocked.length} department(s) with jabatan: ${blocked.map((d) => d.namaDepartemen).join(', ')}`,
      );
    }

    // Delete departments
    const result = await this.prisma.refDepartemen.deleteMany({
      where: {
        idDepartemen: { in: ids },
      },
    });

    return {
      deleted: result.count,
      ids,
    };
  }

  async checkDuplicate(name: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.RefDepartemenWhereInput = {
      namaDepartemen: {
        equals: name,
        mode: 'insensitive',
      },
    };

    if (excludeId) {
      where.NOT = { idDepartemen: excludeId };
    }

    const exists = await this.prisma.refDepartemen.findFirst({
      where,
      select: { idDepartemen: true },
    });

    return !!exists;
  }
}
