/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateJabatanDto,
  UpdateJabatanDto,
  QueryJabatanDto,
} from './dto/jabatan.dto';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@Injectable()
export class JabatanService {
  constructor(private prisma: PrismaService) {}

  async create(createJabatanDto: CreateJabatanDto) {
    const departemenExists = await this.prisma.refDepartemen.findUnique({
      where: { idDepartemen: createJabatanDto.idDepartemen },
    });

    if (!departemenExists) {
      throw new BadRequestException(RESPONSE_MESSAGES.DEPARTMENT.NOT_FOUND);
    }

    const exists = await this.prisma.refJabatan.findFirst({
      where: {
        namaJabatan: createJabatanDto.namaJabatan,
        idDepartemen: createJabatanDto.idDepartemen,
      },
    });

    if (exists) {
      throw new BadRequestException(RESPONSE_MESSAGES.JABATAN.ALREADY_EXISTS);
    }

    return this.prisma.refJabatan.create({
      data: {
        namaJabatan: createJabatanDto.namaJabatan,
        idDepartemen: createJabatanDto.idDepartemen,
        idAtasan: createJabatanDto.idAtasan,
        deskripsiJabatan: createJabatanDto.deskripsiJabatan,
        status: createJabatanDto.status,
      },
      include: {
        departemen: {
          select: { idDepartemen: true, namaDepartemen: true, deskripsi: true },
        },
        permissions: {
          select: {
            levelAkses: true,
            permission: {
              select: { idPermission: true, namaPermission: true },
            },
          },
        },
        _count: {
          select: { karyawans: true }, // fix: karyawan → karyawans
        },
      },
    });
  }

  async findAll(query: QueryJabatanDto) {
    const { search, idDepartemen, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.namaJabatan = { contains: search, mode: 'insensitive' };
    }
    if (idDepartemen) where.idDepartemen = idDepartemen;
    if (status !== undefined) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.refJabatan.findMany({
        where,
        skip,
        take: limit,
        include: {
          departemen: {
            select: {
              idDepartemen: true,
              namaDepartemen: true,
              deskripsi: true,
            },
          },
          permissions: {
            select: {
              levelAkses: true,
              permission: {
                select: { idPermission: true, namaPermission: true },
              },
            },
          },
          _count: {
            select: { karyawans: true }, // fix: karyawan → karyawans
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refJabatan.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
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

  async findOne(id: string) {
    const jabatan = await this.prisma.refJabatan.findUnique({
      where: { idJabatan: id },
      include: {
        departemen: {
          select: { idDepartemen: true, namaDepartemen: true, deskripsi: true },
        },
        permissions: {
          select: {
            levelAkses: true,
            permission: {
              select: { idPermission: true, namaPermission: true },
            },
          },
        },
        _count: {
          select: { karyawans: true }, // fix: karyawan → karyawans
        },
      },
    });

    if (!jabatan) {
      throw new NotFoundException(RESPONSE_MESSAGES.JABATAN.NOT_FOUND);
    }

    return jabatan;
  }

  async update(id: string, updateJabatanDto: UpdateJabatanDto) {
    await this.findOne(id);

    if (updateJabatanDto.idDepartemen) {
      const departemenExists = await this.prisma.refDepartemen.findUnique({
        where: { idDepartemen: updateJabatanDto.idDepartemen },
      });

      if (!departemenExists) {
        throw new BadRequestException(RESPONSE_MESSAGES.DEPARTMENT.NOT_FOUND);
      }
    }

    if (updateJabatanDto.namaJabatan) {
      const exists = await this.prisma.refJabatan.findFirst({
        where: {
          namaJabatan: updateJabatanDto.namaJabatan,
          idDepartemen: updateJabatanDto.idDepartemen,
          NOT: { idJabatan: id },
        },
      });

      if (exists) {
        throw new BadRequestException(RESPONSE_MESSAGES.JABATAN.ALREADY_EXISTS);
      }
    }

    return this.prisma.refJabatan.update({
      where: { idJabatan: id },
      data: {
        namaJabatan: updateJabatanDto.namaJabatan,
        idDepartemen: updateJabatanDto.idDepartemen,
        idAtasan: updateJabatanDto.idAtasan,
        deskripsiJabatan: updateJabatanDto.deskripsiJabatan,
        status: updateJabatanDto.status,
      },
      include: {
        departemen: {
          select: { idDepartemen: true, namaDepartemen: true, deskripsi: true },
        },
        permissions: {
          select: {
            levelAkses: true,
            permission: {
              select: { idPermission: true, namaPermission: true },
            },
          },
        },
        _count: {
          select: { karyawans: true }, // fix: karyawan → karyawans
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const karyawanCount = await this.prisma.refKaryawan.count({
      where: { idJabatan: id },
    });

    if (karyawanCount > 0) {
      throw new BadRequestException(
        `${RESPONSE_MESSAGES.JABATAN.HAS_KARYAWAN}. Total: ${karyawanCount} karyawan`,
      );
    }

    return this.prisma.refJabatan.delete({
      where: { idJabatan: id },
    });
  }

  async getJabatanStats(id: string) {
    const jabatan = await this.findOne(id);

    const [karyawanAktif, karyawanTotal] = await Promise.all([
      this.prisma.refKaryawan.count({
        where: { idJabatan: id, statusKeaktifan: true },
      }),
      this.prisma.refKaryawan.count({
        where: { idJabatan: id },
      }),
    ]);

    return {
      ...jabatan,
      stats: {
        totalKaryawan: karyawanTotal,
        karyawanAktif,
        karyawanNonAktif: karyawanTotal - karyawanAktif,
      },
    };
  }

  async getByDepartemen(idDepartemen: string) {
    const departemenExists = await this.prisma.refDepartemen.findUnique({
      where: { idDepartemen },
    });

    if (!departemenExists) {
      throw new BadRequestException(RESPONSE_MESSAGES.DEPARTMENT.NOT_FOUND);
    }

    return this.prisma.refJabatan.findMany({
      where: { idDepartemen, status: true },
      include: {
        departemen: {
          select: { idDepartemen: true, namaDepartemen: true },
        },
        permissions: {
          select: {
            levelAkses: true,
            permission: {
              select: { idPermission: true, namaPermission: true },
            },
          },
        },
        _count: {
          select: { karyawans: true }, // fix: karyawan → karyawans
        },
      },
      orderBy: { namaJabatan: 'asc' },
    });
  }
}
