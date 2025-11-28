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
    // Validasi departemen exists
    const departemenExists = await this.prisma.refDepartemen.findUnique({
      where: { idDepartemen: createJabatanDto.idDepartemen },
    });

    if (!departemenExists) {
      throw new BadRequestException(RESPONSE_MESSAGES.DEPARTMENT.NOT_FOUND);
    }

    // Check duplicate nama jabatan dalam departemen yang sama
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
      data: createJabatanDto,
      include: {
        departemen: {
          select: {
            idDepartemen: true,
            namaDepartemen: true,
            roleDefault: {
              select: {
                idRole: true,
                namaRole: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(query: QueryJabatanDto) {
    const { search, idDepartemen, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.namaJabatan = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (idDepartemen) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.idDepartemen = idDepartemen;
    }

    if (status !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.refJabatan.findMany({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where,
        skip,
        take: limit,
        include: {
          departemen: {
            select: {
              idDepartemen: true,
              namaDepartemen: true,
              roleDefault: {
                select: {
                  idRole: true,
                  namaRole: true,
                },
              },
            },
          },
          _count: {
            select: {
              karyawan: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
          select: {
            idDepartemen: true,
            namaDepartemen: true,
            deskripsi: true,
            roleDefault: {
              select: {
                idRole: true,
                namaRole: true,
                level: true,
              },
            },
          },
        },
        _count: {
          select: {
            karyawan: true,
          },
        },
      },
    });

    if (!jabatan) {
      throw new NotFoundException(RESPONSE_MESSAGES.JABATAN.NOT_FOUND);
    }

    return jabatan;
  }

  async update(id: string, updateJabatanDto: UpdateJabatanDto) {
    // Check if jabatan exists
    await this.findOne(id);

    // Validasi departemen jika diupdate
    if (updateJabatanDto.idDepartemen) {
      const departemenExists = await this.prisma.refDepartemen.findUnique({
        where: { idDepartemen: updateJabatanDto.idDepartemen },
      });

      if (!departemenExists) {
        throw new BadRequestException(RESPONSE_MESSAGES.DEPARTMENT.NOT_FOUND);
      }
    }

    // Check duplicate nama jabatan
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
      data: updateJabatanDto,
      include: {
        departemen: {
          select: {
            idDepartemen: true,
            namaDepartemen: true,
            roleDefault: {
              select: {
                idRole: true,
                namaRole: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if jabatan exists
    await this.findOne(id);

    // Check if jabatan has karyawan
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
        where: {
          idJabatan: id,
          statusKeaktifan: true,
        },
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
    // Validasi departemen exists
    const departemenExists = await this.prisma.refDepartemen.findUnique({
      where: { idDepartemen },
    });

    if (!departemenExists) {
      throw new BadRequestException(RESPONSE_MESSAGES.DEPARTMENT.NOT_FOUND);
    }

    return this.prisma.refJabatan.findMany({
      where: {
        idDepartemen,
        status: true,
      },
      include: {
        _count: {
          select: {
            karyawan: true,
          },
        },
      },
      orderBy: {
        namaJabatan: 'asc',
      },
    });
  }
}
