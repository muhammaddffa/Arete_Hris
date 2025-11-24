/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  QueryDepartmentDto,
} from './dto/department.dto';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    // Validasi apakah role exist
    const roleExists = await this.prisma.refRole.findUnique({
      where: { idRole: createDepartmentDto.idRoleDefault },
    });

    if (!roleExists) {
      throw new BadRequestException(RESPONSE_MESSAGES.ROLE.NOT_FOUND);
    }

    // Check duplicate
    const exists = await this.prisma.refDepartemen.findFirst({
      where: { namaDepartemen: createDepartmentDto.namaDepartemen },
    });

    if (exists) {
      throw new BadRequestException(
        RESPONSE_MESSAGES.DEPARTMENT.ALREADY_EXISTS,
      );
    }

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

  async findAll(query: QueryDepartmentDto) {
    const {
      search,
      includeRelations = false,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build where clause
    const where: any = {};

    // Search filter
    if (search) {
      where.namaDepartemen = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query with transaction for consistency
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
      },
    };
  }

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
    // Cek apakah departemen exist
    await this.findOne(id);

    // Validasi role jika diupdate
    if (updateDepartmentDto.idRoleDefault) {
      const roleExists = await this.prisma.refRole.findUnique({
        where: { idRole: updateDepartmentDto.idRoleDefault },
      });

      if (!roleExists) {
        throw new BadRequestException(RESPONSE_MESSAGES.ROLE.NOT_FOUND);
      }
    }

    // Check duplicate name
    if (updateDepartmentDto.namaDepartemen) {
      const exists = await this.prisma.refDepartemen.findFirst({
        where: {
          namaDepartemen: updateDepartmentDto.namaDepartemen,
          NOT: { idDepartemen: id },
        },
      });

      if (exists) {
        throw new BadRequestException(
          RESPONSE_MESSAGES.DEPARTMENT.ALREADY_EXISTS,
        );
      }
    }

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
    await this.findOne(id);

    // Cek apakah ada jabatan yang terkait
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
}
