/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateKaryawanJadwalDto,
  UpdateKaryawanJadwalDto,
} from './dto/karyawan-jadwal.dto';

@Injectable()
export class KaryawanJadwalService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateKaryawanJadwalDto) {
    // Validate karyawan exists
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: createDto.idKaryawan },
    });

    if (!karyawan) {
      throw new NotFoundException(
        `Karyawan dengan ID ${createDto.idKaryawan} tidak ditemukan`,
      );
    }

    // Validate jadwal exists
    const jadwal = await this.prisma.refJadwalKerja.findUnique({
      where: { idJadwal: createDto.idJadwal },
    });

    if (!jadwal) {
      throw new NotFoundException(
        `Jadwal dengan ID ${createDto.idJadwal} tidak ditemukan`,
      );
    }

    // Check for overlapping schedules
    const tanggalMulai = new Date(createDto.tanggalMulaiEfektif);
    const tanggalSelesai = createDto.tanggalSelesaiEfektif
      ? new Date(createDto.tanggalSelesaiEfektif)
      : null;

    if (tanggalSelesai && tanggalSelesai <= tanggalMulai) {
      throw new BadRequestException(
        'Tanggal selesai harus lebih besar dari tanggal mulai',
      );
    }

    const overlapping = await this.prisma.karyawanJadwal.findFirst({
      where: {
        idKaryawan: createDto.idKaryawan,
        OR: [
          {
            // Existing schedule has no end date
            tanggalSelesaiEfektif: null,
            tanggalMulaiEfektif: {
              lte: tanggalSelesai || new Date('2099-12-31'),
            },
          },
          {
            // Existing schedule overlaps with new schedule
            AND: [
              {
                tanggalMulaiEfektif: {
                  lte: tanggalSelesai || new Date('2099-12-31'),
                },
              },
              { tanggalSelesaiEfektif: { gte: tanggalMulai } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictException(
        'Karyawan sudah memiliki jadwal yang bertumpukan pada periode tersebut',
      );
    }

    return this.prisma.karyawanJadwal.create({
      data: {
        ...createDto,
        tanggalMulaiEfektif: tanggalMulai,
        tanggalSelesaiEfektif: tanggalSelesai,
      },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
        jadwal: true,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause (opsional search) ===
    const where: any = {};

    if (search) {
      where.karyawan = {
        nama: { contains: search, mode: 'insensitive' },
      };
    }

    // === $transaction (data + total count) ===
    const [data, total] = await this.prisma.$transaction([
      this.prisma.karyawanJadwal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          karyawan: {
            select: {
              idKaryawan: true,
              nik: true,
              nama: true,
              email: true,
            },
          },
          jadwal: {
            select: {
              idJadwal: true,
              kodeJadwal: true,
              namaJadwal: true,
            },
          },
        },
      }),

      this.prisma.karyawanJadwal.count({ where }),
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
    const karyawanJadwal = await this.prisma.karyawanJadwal.findUnique({
      where: { idKaryawanJadwal: id },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
            email: true,
          },
        },
        jadwal: true,
      },
    });

    if (!karyawanJadwal) {
      throw new NotFoundException(
        `Karyawan Jadwal dengan ID ${id} tidak ditemukan`,
      );
    }

    return karyawanJadwal;
  }

  async findByKaryawan(idKaryawan: string) {
    return this.prisma.karyawanJadwal.findMany({
      where: { idKaryawan },
      include: {
        jadwal: true,
      },
      orderBy: { tanggalMulaiEfektif: 'desc' },
    });
  }

  async findActiveByKaryawan(idKaryawan: string) {
    const today = new Date();

    return this.prisma.karyawanJadwal.findFirst({
      where: {
        idKaryawan,
        tanggalMulaiEfektif: { lte: today },
        OR: [
          { tanggalSelesaiEfektif: null },
          { tanggalSelesaiEfektif: { gte: today } },
        ],
      },
      include: {
        jadwal: true,
      },
      orderBy: { tanggalMulaiEfektif: 'desc' },
    });
  }

  async update(id: string, updateDto: UpdateKaryawanJadwalDto) {
    await this.findOne(id); // Check if exists

    if (updateDto.idJadwal) {
      const jadwal = await this.prisma.refJadwalKerja.findUnique({
        where: { idJadwal: updateDto.idJadwal },
      });

      if (!jadwal) {
        throw new NotFoundException(
          `Jadwal dengan ID ${updateDto.idJadwal} tidak ditemukan`,
        );
      }
    }

    const updateData: any = {};

    if (updateDto.idJadwal) updateData.idJadwal = updateDto.idJadwal;
    if (updateDto.tanggalMulaiEfektif) {
      updateData.tanggalMulaiEfektif = new Date(updateDto.tanggalMulaiEfektif);
    }
    if (updateDto.tanggalSelesaiEfektif !== undefined) {
      updateData.tanggalSelesaiEfektif = updateDto.tanggalSelesaiEfektif
        ? new Date(updateDto.tanggalSelesaiEfektif)
        : null;
    }

    return this.prisma.karyawanJadwal.update({
      where: { idKaryawanJadwal: id },
      data: updateData,
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
        jadwal: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.karyawanJadwal.delete({
      where: { idKaryawanJadwal: id },
    });
  }

  // End active schedule for a karyawan
  async endActiveSchedule(idKaryawan: string, tanggalSelesai: Date) {
    const activeSchedule = await this.findActiveByKaryawan(idKaryawan);

    if (!activeSchedule) {
      throw new NotFoundException(`Karyawan tidak memiliki jadwal aktif`);
    }

    return this.prisma.karyawanJadwal.update({
      where: { idKaryawanJadwal: activeSchedule.idKaryawanJadwal },
      data: { tanggalSelesaiEfektif: tanggalSelesai },
    });
  }
}
