/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePengajuanLemburDto,
  UpdatePengajuanLemburDto,
  StatusPersetujuan,
} from './dto/pengajuan-lembur.dto';
import {
  getPaginationParams,
  createPaginatedResponse,
} from '../common/utils/pagination.utils';

@Injectable()
export class PengajuanLemburService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePengajuanLemburDto) {
    // Validate karyawan
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: createDto.idKaryawan },
    });

    if (!karyawan) {
      throw new NotFoundException(
        `Karyawan dengan ID ${createDto.idKaryawan} tidak ditemukan`,
      );
    }

    // Validate atasan if provided
    if (createDto.idAtasan) {
      const atasan = await this.prisma.refKaryawan.findUnique({
        where: { idKaryawan: createDto.idAtasan },
      });

      if (!atasan) {
        throw new NotFoundException(
          `Atasan dengan ID ${createDto.idAtasan} tidak ditemukan`,
        );
      }
    }

    // Validate time
    const [jamMulaiHour, jamMulaiMinute] = createDto.jamMulai
      .split(':')
      .map(Number);
    const [jamSelesaiHour, jamSelesaiMinute] = createDto.jamSelesai
      .split(':')
      .map(Number);

    const jamMulaiMinutes = jamMulaiHour * 60 + jamMulaiMinute;
    const jamSelesaiMinutes = jamSelesaiHour * 60 + jamSelesaiMinute;

    if (jamSelesaiMinutes <= jamMulaiMinutes) {
      throw new BadRequestException(
        'Jam selesai harus lebih besar dari jam mulai',
      );
    }

    return this.prisma.pengajuanLembur.create({
      data: {
        ...createDto,
        tanggalLembur: new Date(createDto.tanggalLembur),
        statusPersetujuan: StatusPersetujuan.PENDING,
      },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
        atasan: {
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
    filters?: {
      idKaryawan?: string;
      idAtasan?: string;
      status?: StatusPersetujuan;
      tanggalLembur?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const { skip, take } = getPaginationParams(page, limit);
    const where: any = {};

    if (filters?.idKaryawan) where.idKaryawan = filters.idKaryawan;
    if (filters?.idAtasan) where.idAtasan = filters.idAtasan;
    if (filters?.status) where.statusPersetujuan = filters.status;
    if (filters?.tanggalLembur)
      where.tanggalLembur = new Date(filters.tanggalLembur);

    if (filters?.startDate || filters?.endDate) {
      where.tanggalLembur = {};
      if (filters.startDate)
        where.tanggalLembur.gte = new Date(filters.startDate);
      if (filters.endDate) where.tanggalLembur.lte = new Date(filters.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.pengajuanLembur.findMany({
        where,
        skip,
        take,
        include: {
          karyawan: {
            select: {
              idKaryawan: true,
              nik: true,
              nama: true,
            },
          },
          atasan: {
            select: {
              idKaryawan: true,
              nik: true,
              nama: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pengajuanLembur.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const pengajuan = await this.prisma.pengajuanLembur.findUnique({
      where: { idLembur: id },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
            email: true,
          },
        },
        atasan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
      },
    });

    if (!pengajuan) {
      throw new NotFoundException(
        `Pengajuan lembur dengan ID ${id} tidak ditemukan`,
      );
    }

    return pengajuan;
  }

  async update(id: string, updateDto: UpdatePengajuanLemburDto) {
    const pengajuan = await this.findOne(id);

    if (
      pengajuan.statusPersetujuan === StatusPersetujuan.APPROVED ||
      pengajuan.statusPersetujuan === StatusPersetujuan.REJECTED
    ) {
      throw new BadRequestException(
        'Pengajuan yang sudah disetujui/ditolak tidak dapat diupdate',
      );
    }

    const updateData: any = {};

    if (updateDto.tanggalLembur)
      updateData.tanggalLembur = new Date(updateDto.tanggalLembur);
    if (updateDto.jamMulai) updateData.jamMulai = updateDto.jamMulai;
    if (updateDto.jamSelesai) updateData.jamSelesai = updateDto.jamSelesai;
    if (updateDto.totalJam) updateData.totalJam = updateDto.totalJam;
    if (updateDto.keteranganPekerjaan)
      updateData.keteranganPekerjaan = updateDto.keteranganPekerjaan;

    return this.prisma.pengajuanLembur.update({
      where: { idLembur: id },
      data: updateData,
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
        atasan: {
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

    return this.prisma.pengajuanLembur.delete({
      where: { idLembur: id },
    });
  }

  async approve(id: string, idAtasan: string, catatanAtasan?: string) {
    const pengajuan = await this.findOne(id);

    if (pengajuan.statusPersetujuan !== StatusPersetujuan.PENDING) {
      throw new BadRequestException(
        'Hanya pengajuan dengan status pending yang dapat disetujui',
      );
    }

    return this.prisma.pengajuanLembur.update({
      where: { idLembur: id },
      data: {
        statusPersetujuan: StatusPersetujuan.APPROVED,
        idAtasan,
        tanggalPersetujuan: new Date(),
        catatanAtasan,
      },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
        atasan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
      },
    });
  }

  async reject(id: string, idAtasan: string, catatanAtasan: string) {
    const pengajuan = await this.findOne(id);

    if (pengajuan.statusPersetujuan !== StatusPersetujuan.PENDING) {
      throw new BadRequestException(
        'Hanya pengajuan dengan status pending yang dapat ditolak',
      );
    }

    return this.prisma.pengajuanLembur.update({
      where: { idLembur: id },
      data: {
        statusPersetujuan: StatusPersetujuan.REJECTED,
        idAtasan,
        tanggalPersetujuan: new Date(),
        catatanAtasan,
      },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
        atasan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
      },
    });
  }

  async cancel(id: string) {
    const pengajuan = await this.findOne(id);

    if (
      pengajuan.statusPersetujuan === StatusPersetujuan.APPROVED ||
      pengajuan.statusPersetujuan === StatusPersetujuan.REJECTED
    ) {
      throw new BadRequestException(
        'Pengajuan yang sudah disetujui/ditolak tidak dapat dibatalkan',
      );
    }

    return this.prisma.pengajuanLembur.update({
      where: { idLembur: id },
      data: {
        statusPersetujuan: StatusPersetujuan.CANCELLED,
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

  async getTotalJamLembur(idKaryawan: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await this.prisma.pengajuanLembur.aggregate({
      where: {
        idKaryawan,
        statusPersetujuan: StatusPersetujuan.APPROVED,
        tanggalLembur: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalJam: true,
      },
    });

    return {
      idKaryawan,
      month,
      year,
      totalJamLembur: result._sum.totalJam || 0,
    };
  }
}
