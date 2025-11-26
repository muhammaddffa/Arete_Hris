/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePresensiDto,
  UpdatePresensiDto,
  ClockInDto,
  ClockOutDto,
  StatusKehadiran,
  SumberPresensi,
} from './dto/presensi.dto';
import {
  getPaginationParams,
  createPaginatedResponse,
} from '../common/utils/pagination.utils';

@Injectable()
export class PresensiService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePresensiDto) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: createDto.idKaryawan },
    });

    if (!karyawan) {
      throw new NotFoundException(
        `Karyawan dengan ID ${createDto.idKaryawan} tidak ditemukan`,
      );
    }

    const tanggal = new Date(createDto.tanggalPresensi);
    const existing = await this.prisma.presensi.findUnique({
      where: {
        idKaryawan_tanggalPresensi: {
          idKaryawan: createDto.idKaryawan,
          tanggalPresensi: tanggal,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Presensi untuk tanggal ${createDto.tanggalPresensi} sudah ada`,
      );
    }

    return this.prisma.presensi.create({
      data: {
        ...createDto,
        tanggalPresensi: tanggal,
        waktuClockIn: createDto.waktuClockIn
          ? new Date(createDto.waktuClockIn)
          : null,
        waktuClockOut: createDto.waktuClockOut
          ? new Date(createDto.waktuClockOut)
          : null,
        statusKehadiran: createDto.statusKehadiran || StatusKehadiran.HADIR,
        sumberPresensi: createDto.sumberPresensi || SumberPresensi.MANUAL,
      },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
      },
    });
  }

  async clockIn(clockInDto: ClockInDto) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: clockInDto.idKaryawan },
    });

    if (!karyawan) {
      throw new NotFoundException(
        `Karyawan dengan ID ${clockInDto.idKaryawan} tidak ditemukan`,
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingPresensi = await this.prisma.presensi.findUnique({
      where: {
        idKaryawan_tanggalPresensi: {
          idKaryawan: clockInDto.idKaryawan,
          tanggalPresensi: today,
        },
      },
    });

    if (existingPresensi && existingPresensi.waktuClockIn) {
      throw new ConflictException('Anda sudah melakukan clock in hari ini');
    }

    if (existingPresensi) {
      return this.prisma.presensi.update({
        where: { idPresensi: existingPresensi.idPresensi },
        data: {
          waktuClockIn: new Date(),
          lokasiClockIn: clockInDto.lokasiClockIn,
          fotoClockIn: clockInDto.fotoClockIn,
          statusKehadiran: StatusKehadiran.HADIR,
          sumberPresensi: SumberPresensi.MOBILE_APP,
        },
        include: {
          karyawan: {
            select: {
              idKaryawan: true,
              nik: true,
              nama: true,
            },
          },
        },
      });
    }

    return this.prisma.presensi.create({
      data: {
        idKaryawan: clockInDto.idKaryawan,
        tanggalPresensi: today,
        waktuClockIn: new Date(),
        lokasiClockIn: clockInDto.lokasiClockIn,
        fotoClockIn: clockInDto.fotoClockIn,
        statusKehadiran: StatusKehadiran.HADIR,
        sumberPresensi: SumberPresensi.MOBILE_APP,
      },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
      },
    });
  }

  async clockOut(idKaryawan: string, clockOutDto: ClockOutDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const presensi = await this.prisma.presensi.findUnique({
      where: {
        idKaryawan_tanggalPresensi: {
          idKaryawan,
          tanggalPresensi: today,
        },
      },
    });

    if (!presensi) {
      throw new NotFoundException('Anda belum melakukan clock in hari ini');
    }

    if (!presensi.waktuClockIn) {
      throw new BadRequestException('Anda harus clock in terlebih dahulu');
    }

    if (presensi.waktuClockOut) {
      throw new ConflictException('Anda sudah melakukan clock out hari ini');
    }

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
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
      },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    params?: {
      startDate?: string;
      endDate?: string;
      idKaryawan?: string;
      statusKehadiran?: StatusKehadiran;
    },
  ) {
    const { skip, take } = getPaginationParams(page, limit);
    const where: any = {};

    if (params?.startDate || params?.endDate) {
      where.tanggalPresensi = {};
      if (params.startDate)
        where.tanggalPresensi.gte = new Date(params.startDate);
      if (params.endDate) where.tanggalPresensi.lte = new Date(params.endDate);
    }

    if (params?.idKaryawan) where.idKaryawan = params.idKaryawan;
    if (params?.statusKehadiran) where.statusKehadiran = params.statusKehadiran;

    const [data, total] = await Promise.all([
      this.prisma.presensi.findMany({
        where,
        skip,
        take,
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
        orderBy: { tanggalPresensi: 'desc' },
      }),
      this.prisma.presensi.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const presensi = await this.prisma.presensi.findUnique({
      where: { idPresensi: id },
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
    });

    if (!presensi) {
      throw new NotFoundException(`Presensi dengan ID ${id} tidak ditemukan`);
    }

    return presensi;
  }

  async findByKaryawan(idKaryawan: string, month?: number, year?: number) {
    const where: any = { idKaryawan };

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
    });
  }

  async update(id: string, updateDto: UpdatePresensiDto) {
    await this.findOne(id);

    const updateData: any = {};

    if (updateDto.waktuClockOut) {
      updateData.waktuClockOut = new Date(updateDto.waktuClockOut);
    }
    if (updateDto.statusKehadiran)
      updateData.statusKehadiran = updateDto.statusKehadiran;
    if (updateDto.keterangan !== undefined)
      updateData.keterangan = updateDto.keterangan;
    if (updateDto.lokasiClockOut !== undefined)
      updateData.lokasiClockOut = updateDto.lokasiClockOut;
    if (updateDto.fotoClockOut !== undefined)
      updateData.fotoClockOut = updateDto.fotoClockOut;

    return this.prisma.presensi.update({
      where: { idPresensi: id },
      data: updateData,
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.presensi.delete({
      where: { idPresensi: id },
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

    const summary = {
      totalHari: presensiList.length,
      hadir: presensiList.filter(
        (p) => p.statusKehadiran === StatusKehadiran.HADIR,
      ).length,
      izin: presensiList.filter(
        (p) => p.statusKehadiran === StatusKehadiran.IZIN,
      ).length,
      sakit: presensiList.filter(
        (p) => p.statusKehadiran === StatusKehadiran.SAKIT,
      ).length,
      alpa: presensiList.filter(
        (p) => p.statusKehadiran === StatusKehadiran.ALPA,
      ).length,
      cuti: presensiList.filter(
        (p) => p.statusKehadiran === StatusKehadiran.CUTI,
      ).length,
      libur: presensiList.filter(
        (p) => p.statusKehadiran === StatusKehadiran.LIBUR,
      ).length,
      dinasLuar: presensiList.filter(
        (p) => p.statusKehadiran === StatusKehadiran.DINAS_LUAR,
      ).length,
    };

    return summary;
  }
}
