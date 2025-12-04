/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePresensiDto,
  UpdatePresensiDto,
  ClockInDto,
  ClockOutDto,
  StatusKehadiran,
} from './dto/presensi.dto';

@Injectable()
export class PresensiService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePresensiDto) {
    // Validasi: Cek apakah karyawan ada
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: createDto.idKaryawan },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    // Validasi: Cek duplikasi presensi di tanggal yang sama
    const existingPresensi = await this.prisma.presensi.findFirst({
      where: {
        idKaryawan: createDto.idKaryawan,
        tanggalPresensi: new Date(createDto.tanggalPresensi),
      },
    });

    if (existingPresensi) {
      throw new ConflictException('Presensi untuk tanggal ini sudah ada');
    }

    // Buat presensi
    return this.prisma.presensi.create({
      data: {
        idKaryawan: createDto.idKaryawan,
        tanggalPresensi: new Date(createDto.tanggalPresensi),
        waktuClockIn: createDto.waktuClockIn
          ? new Date(createDto.waktuClockIn)
          : null,
        waktuClockOut: createDto.waktuClockOut
          ? new Date(createDto.waktuClockOut)
          : null,
        statusKehadiran: createDto.statusKehadiran || StatusKehadiran.HADIR,
        sumberPresensi: createDto.sumberPresensi || 'manual',
        keterangan: createDto.keterangan,
        lokasiClockIn: createDto.lokasiClockIn,
        lokasiClockOut: createDto.lokasiClockOut,
        fotoClockIn: createDto.fotoClockIn,
        fotoClockOut: createDto.fotoClockOut,
      },
      include: {
        karyawan: {
          select: {
            nama: true,
            nik: true,
          },
        },
      },
    });
  }

  async clockIn(clockInDto: ClockInDto) {
    // Validasi: Cek apakah karyawan ada
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: clockInDto.idKaryawan },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validasi: Cek apakah sudah clock in hari ini
    const existingPresensi = await this.prisma.presensi.findFirst({
      where: {
        idKaryawan: clockInDto.idKaryawan,
        tanggalPresensi: today,
      },
    });

    if (existingPresensi) {
      throw new ConflictException('Anda sudah clock in hari ini');
    }

    // Buat presensi baru (clock in)
    return this.prisma.presensi.create({
      data: {
        idKaryawan: clockInDto.idKaryawan,
        tanggalPresensi: today,
        waktuClockIn: new Date(),
        statusKehadiran: StatusKehadiran.HADIR,
        sumberPresensi: 'web_app',
        lokasiClockIn: clockInDto.lokasiClockIn,
        fotoClockIn: clockInDto.fotoClockIn,
      },
      include: {
        karyawan: {
          select: {
            nama: true,
            nik: true,
          },
        },
      },
    });
  }

  async clockOut(idKaryawan: string, clockOutDto: ClockOutDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cari presensi hari ini
    const presensi = await this.prisma.presensi.findFirst({
      where: {
        idKaryawan,
        tanggalPresensi: today,
      },
    });

    if (!presensi) {
      throw new NotFoundException('Anda belum clock in hari ini');
    }

    if (presensi.waktuClockOut) {
      throw new ConflictException('Anda sudah clock out hari ini');
    }

    // Update dengan waktu clock out
    return this.prisma.presensi.update({
      where: { idPresensi: presensi.idPresensi },
      data: {
        waktuClockOut: new Date(),
        lokasiClockOut: clockOutDto.lokasiClockOut,
        fotoClockOut: clockOutDto.fotoClockOut,
      },
      include: {
        karyawan: {
          select: {
            nama: true,
            nik: true,
          },
        },
      },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      startDate?: string;
      endDate?: string;
      idKaryawan?: string;
      statusKehadiran?: StatusKehadiran;
    },
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters?.startDate && filters?.endDate) {
      where.tanggalPresensi = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    } else if (filters?.startDate) {
      where.tanggalPresensi = {
        gte: new Date(filters.startDate),
      };
    } else if (filters?.endDate) {
      where.tanggalPresensi = {
        lte: new Date(filters.endDate),
      };
    }

    if (filters?.idKaryawan) {
      where.idKaryawan = filters.idKaryawan;
    }

    if (filters?.statusKehadiran) {
      where.statusKehadiran = filters.statusKehadiran;
    }

    // Execute queries
    const [data, total] = await Promise.all([
      this.prisma.presensi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggalPresensi: 'desc' },
        include: {
          karyawan: {
            select: {
              nama: true,
              nik: true,
              jabatan: {
                select: {
                  namaJabatan: true,
                  departemen: {
                    select: {
                      namaDepartemen: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.presensi.count({ where }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findByKaryawan(idKaryawan: string, month?: number, year?: number) {
    const where: any = { idKaryawan };

    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      where.tanggalPresensi = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.presensi.findMany({
      where,
      orderBy: { tanggalPresensi: 'desc' },
      include: {
        karyawan: {
          select: {
            nama: true,
            nik: true,
          },
        },
      },
    });
  }

  async getSummary(idKaryawan: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const presensiList = await this.prisma.presensi.findMany({
      where: {
        idKaryawan,
        tanggalPresensi: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Hitung summary
    const summary = {
      totalHari: presensiList.length,
      hadir: presensiList.filter((p) => p.statusKehadiran === 'hadir').length,
      izin: presensiList.filter((p) => p.statusKehadiran === 'izin').length,
      sakit: presensiList.filter((p) => p.statusKehadiran === 'sakit').length,
      alpa: presensiList.filter((p) => p.statusKehadiran === 'alpa').length,
      cuti: presensiList.filter((p) => p.statusKehadiran === 'cuti').length,
      libur: presensiList.filter((p) => p.statusKehadiran === 'libur').length,
      dinasLuar: presensiList.filter((p) => p.statusKehadiran === 'dinas_luar')
        .length,
    };

    return {
      month,
      year,
      summary,
      details: presensiList,
    };
  }

  async findOne(id: string) {
    const presensi = await this.prisma.presensi.findUnique({
      where: { idPresensi: id },
      include: {
        karyawan: {
          select: {
            nama: true,
            nik: true,
            jabatan: {
              select: {
                namaJabatan: true,
                departemen: {
                  select: {
                    namaDepartemen: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!presensi) {
      throw new NotFoundException('Presensi tidak ditemukan');
    }

    return presensi;
  }

  async update(id: string, updateDto: UpdatePresensiDto) {
    await this.findOne(id); // Validasi apakah ada

    return this.prisma.presensi.update({
      where: { idPresensi: id },
      data: {
        waktuClockOut: updateDto.waktuClockOut
          ? new Date(updateDto.waktuClockOut)
          : undefined,
        statusKehadiran: updateDto.statusKehadiran,
        keterangan: updateDto.keterangan,
        lokasiClockOut: updateDto.lokasiClockOut,
        fotoClockOut: updateDto.fotoClockOut,
      },
      include: {
        karyawan: {
          select: {
            nama: true,
            nik: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Validasi apakah ada

    return this.prisma.presensi.delete({
      where: { idPresensi: id },
    });
  }
}
