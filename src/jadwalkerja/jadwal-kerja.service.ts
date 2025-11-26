/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateJadwalKerjaDto,
  QueryJadwalDto,
  UpdateJadwalKerjaDto,
} from './dto/jadwal-kerja.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class JadwalKerjaService {
  constructor(private prisma: PrismaService) {}

  // ============================================================
  // CREATE
  // ============================================================
  async create(dto: CreateJadwalKerjaDto) {
    // Check duplicate kodeJadwal
    const exists = await this.prisma.refJadwalKerja.findUnique({
      where: { kodeJadwal: dto.kodeJadwal },
      select: { idJadwal: true },
    });

    if (exists) {
      throw new ConflictException(
        `Kode jadwal ${dto.kodeJadwal} sudah digunakan`,
      );
    }

    return this.prisma.refJadwalKerja.create({
      data: dto,
    });
  }

  // ============================================================
  // FIND ALL (ADVANCED PAGINATION & SEARCH LIKE DEPARTMENT)
  // ============================================================
  async findAll(query: QueryJadwalDto) {
    const {
      search,
      hariKerja,
      jamMasuk,
      jamPulang,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.RefJadwalKerjaWhereInput = {};

    // SEARCH
    if (search) {
      where.OR = [
        {
          namaJadwal: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          kodeJadwal: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // FILTER HARI KERJA (array)
    if (hariKerja && Array.isArray(hariKerja) && hariKerja.length > 0) {
      where.hariKerja = {
        hasSome: hariKerja, // ARRAY MATCH
      };
    }

    // FILTER JAM MASUK
    if (jamMasuk) {
      where.jamMasuk = {
        equals: jamMasuk,
      };
    }

    // FILTER JAM PULANG
    if (jamPulang) {
      where.jamPulang = {
        equals: jamPulang,
      };
    }

    // RUN QUERY WITH PAGINATION
    const [data, total] = await this.prisma.$transaction([
      this.prisma.refJadwalKerja.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),

      this.prisma.refJadwalKerja.count({ where }),
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
    const jadwal = await this.prisma.refJadwalKerja.findUnique({
      where: { idJadwal: id },
      include: {
        karyawanJadwal: {
          include: {
            karyawan: {
              select: {
                idKaryawan: true,
                nik: true,
                nama: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!jadwal) {
      throw new NotFoundException(`Jadwal dengan ID ${id} tidak ditemukan`);
    }

    return jadwal;
  }

  // ============================================================
  // FIND BY KODE
  // ============================================================
  async findByKode(kodeJadwal: string) {
    const jadwal = await this.prisma.refJadwalKerja.findUnique({
      where: { kodeJadwal },
    });

    if (!jadwal) {
      throw new NotFoundException(
        `Jadwal dengan kode ${kodeJadwal} tidak ditemukan`,
      );
    }

    return jadwal;
  }

  // ============================================================
  // UPDATE
  // ============================================================
  async update(id: string, dto: UpdateJadwalKerjaDto) {
    await this.findOne(id);

    // Validate unique kodeJadwal
    if (dto.kodeJadwal) {
      const exists = await this.prisma.refJadwalKerja.findFirst({
        where: {
          kodeJadwal: dto.kodeJadwal,
          NOT: { idJadwal: id },
        },
      });

      if (exists) {
        throw new ConflictException(
          `Kode jadwal ${dto.kodeJadwal} sudah digunakan`,
        );
      }
    }

    return this.prisma.refJadwalKerja.update({
      where: { idJadwal: id },
      data: dto,
    });
  }

  // ============================================================
  // DELETE
  // ============================================================
  async remove(id: string) {
    await this.findOne(id);

    const usageCount = await this.prisma.karyawanJadwal.count({
      where: { idJadwal: id },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Jadwal tidak dapat dihapus karena sedang digunakan oleh ${usageCount} karyawan`,
      );
    }

    return this.prisma.refJadwalKerja.delete({
      where: { idJadwal: id },
    });
  }

  // ============================================================
  // STATISTICS
  // ============================================================
  async getStatistics() {
    const totalJadwal = await this.prisma.refJadwalKerja.count();
    const totalKaryawanWithJadwal = await this.prisma.karyawanJadwal.count({
      where: {
        tanggalSelesaiEfektif: null,
      },
    });

    const jadwalPopuler = await this.prisma.refJadwalKerja.findMany({
      take: 5,
      include: {
        _count: {
          select: { karyawanJadwal: true },
        },
      },
      orderBy: {
        karyawanJadwal: {
          _count: 'desc',
        },
      },
    });

    return {
      totalJadwal,
      totalKaryawanWithJadwal,
      jadwalPopuler,
    };
  }
}
