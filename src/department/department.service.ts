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

  async create(createDepartmentDto: CreateDepartmentDto) {
    const exists = await this.prisma.refDepartemen.findFirst({
      where: {
        namaDepartemen: {
          equals: createDepartmentDto.namaDepartemen,
          mode: 'insensitive',
        },
      },
      select: { idDepartemen: true },
    });

    if (exists) {
      throw new ConflictException(RESPONSE_MESSAGES.DEPARTMENT.ALREADY_EXISTS);
    }

    return this.prisma.refDepartemen.create({
      data: createDepartmentDto,
      include: {
        _count: {
          select: { jabatans: true }, // fix: jabatan → jabatans
        },
      },
    });
  }

  async findAll(query: QueryDepartmentDto) {
    const {
      search,
      includeRelations = false,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.RefDepartemenWhereInput = {};

    if (search) {
      where.OR = [
        { namaDepartemen: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.refDepartemen.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: includeRelations
          ? {
              _count: {
                select: { jabatans: true }, // fix: jabatan → jabatans
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

  async findOne(id: string) {
    const departemen = await this.prisma.refDepartemen.findUnique({
      where: { idDepartemen: id },
      include: {
        _count: {
          select: { jabatans: true }, // fix: jabatan → jabatans
        },
      },
    });

    if (!departemen) {
      throw new NotFoundException(RESPONSE_MESSAGES.DEPARTMENT.NOT_FOUND);
    }

    return departemen;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findOne(id);

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

    return this.prisma.refDepartemen.update({
      where: { idDepartemen: id },
      data: updateDepartmentDto,
      include: {
        _count: {
          select: { jabatans: true }, // fix: jabatan → jabatans
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const jabatanCount = await this.prisma.refJabatan.count({
      where: { idDepartemen: id },
    });

    if (jabatanCount > 0) {
      throw new BadRequestException(
        `${RESPONSE_MESSAGES.DEPARTMENT.HAS_JABATAN}. Total: ${jabatanCount} jabatan`,
      );
    }

    return this.prisma.refDepartemen.delete({
      where: { idDepartemen: id },
    });
  }

  async getDepartmentStats(id: string) {
    const departemen = await this.findOne(id);

    const [jabatanCount, karyawanCount] = await Promise.all([
      this.prisma.refJabatan.count({ where: { idDepartemen: id } }),
      this.prisma.refKaryawan.count({
        where: {
          jabatan: { idDepartemen: id },
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
    if (!query || query.length < 2) return [];

    return this.prisma.refDepartemen.findMany({
      where: {
        namaDepartemen: { contains: query, mode: 'insensitive' },
      },
      select: { idDepartemen: true, namaDepartemen: true },
      take: limit,
      orderBy: { namaDepartemen: 'asc' },
    });
  }

  async getAllStats() {
    const total = await this.prisma.refDepartemen.count();
    return { total };
  }

  async bulkDelete(dto: BulkDeleteDepartmentDto) {
    const { ids } = dto;

    const departmentsWithJabatan = await this.prisma.refDepartemen.findMany({
      where: { idDepartemen: { in: ids } },
      select: {
        idDepartemen: true,
        namaDepartemen: true,
        _count: {
          select: { jabatans: true }, // fix: jabatan → jabatans
        },
      },
    });

    const blocked = departmentsWithJabatan.filter(
      (d) => d._count.jabatans > 0, // fix: jabatan → jabatans
    );

    if (blocked.length > 0) {
      throw new BadRequestException(
        `Cannot delete ${blocked.length} department(s) with jabatan: ${blocked.map((d) => d.namaDepartemen).join(', ')}`,
      );
    }

    const result = await this.prisma.refDepartemen.deleteMany({
      where: { idDepartemen: { in: ids } },
    });

    return { deleted: result.count, ids };
  }

  async checkDuplicate(name: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.RefDepartemenWhereInput = {
      namaDepartemen: { equals: name, mode: 'insensitive' },
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
