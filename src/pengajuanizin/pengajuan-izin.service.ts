/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaldoCutiService } from '../saldocuti/saldo-cuti.service';
import {
  CreatePengajuanIzinDto,
  UpdatePengajuanIzinDto,
  StatusPersetujuan,
} from './dto/pengajuan-izin.dto';
import {
  getPaginationParams,
  createPaginatedResponse,
} from '../common/utils/pagination.utils';

@Injectable()
export class PengajuanIzinService {
  constructor(
    private prisma: PrismaService,
    private saldoCutiService: SaldoCutiService,
  ) {}

  async create(createDto: CreatePengajuanIzinDto) {
    // Validate karyawan
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: createDto.idKaryawan },
    });

    if (!karyawan) {
      throw new NotFoundException(
        `Karyawan dengan ID ${createDto.idKaryawan} tidak ditemukan`,
      );
    }

    // Validate jenis izin
    const jenisIzin = await this.prisma.refJenisIzin.findUnique({
      where: { idJenisIzin: createDto.idJenisIzin },
    });

    if (!jenisIzin) {
      throw new NotFoundException(
        `Jenis izin dengan ID ${createDto.idJenisIzin} tidak ditemukan`,
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

    // Validate date range
    const tanggalMulai = new Date(createDto.tanggalMulai);
    const tanggalSelesai = new Date(createDto.tanggalSelesai);

    if (tanggalSelesai <= tanggalMulai) {
      throw new BadRequestException(
        'Tanggal selesai harus lebih besar dari tanggal mulai',
      );
    }

    // Check saldo cuti if jenis izin potong cuti
    if (jenisIzin.potongCuti) {
      const tahun = tanggalMulai.getFullYear();

      try {
        const saldoCuti = await this.saldoCutiService.findByKaryawanAndYear(
          createDto.idKaryawan,
          tahun,
        );

        if (saldoCuti.saldoSisa < createDto.jumlahHari) {
          throw new BadRequestException(
            `Saldo cuti tidak mencukupi. Sisa: ${saldoCuti.saldoSisa} hari, Dibutuhkan: ${createDto.jumlahHari} hari`,
          );
        }
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            `Saldo cuti untuk tahun ${tahun} belum tersedia. Silakan hubungi HRD.`,
          );
        }
        throw error;
      }
    }

    return this.prisma.pengajuanIzin.create({
      data: {
        idKaryawan: createDto.idKaryawan,
        idJenisIzin: createDto.idJenisIzin,
        tanggalMulai: tanggalMulai,
        tanggalSelesai: tanggalSelesai,
        jumlahHari: createDto.jumlahHari,
        keterangan: createDto.keterangan,
        pathBukti: createDto.pathBukti, // Cloudinary URL
        idAtasan: createDto.idAtasan,
        statusPersetujuan: 'pending',
      },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
        jenisIzin: true,
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
      startDate?: string;
      endDate?: string;
    },
  ) {
    const { skip, take } = getPaginationParams(page, limit);
    const where: any = {};

    if (filters?.idKaryawan) where.idKaryawan = filters.idKaryawan;
    if (filters?.idAtasan) where.idAtasan = filters.idAtasan;
    if (filters?.status) where.statusPersetujuan = filters.status;

    if (filters?.startDate || filters?.endDate) {
      where.tanggalMulai = {};
      if (filters.startDate)
        where.tanggalMulai.gte = new Date(filters.startDate);
      if (filters.endDate) where.tanggalMulai.lte = new Date(filters.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.pengajuanIzin.findMany({
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
          jenisIzin: true,
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
      this.prisma.pengajuanIzin.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const pengajuan = await this.prisma.pengajuanIzin.findUnique({
      where: { idPengajuanIzin: id },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
            email: true,
          },
        },
        jenisIzin: true,
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
        `Pengajuan izin dengan ID ${id} tidak ditemukan`,
      );
    }

    return pengajuan;
  }

  // Find raw data (for internal use - get pathBukti for delete)
  async findOneRaw(id: string) {
    const pengajuan = await this.prisma.pengajuanIzin.findUnique({
      where: { idPengajuanIzin: id },
      select: {
        idPengajuanIzin: true,
        pathBukti: true,
        statusPersetujuan: true,
      },
    });

    if (!pengajuan) {
      throw new NotFoundException(
        `Pengajuan izin dengan ID ${id} tidak ditemukan`,
      );
    }

    return pengajuan;
  }

  async update(id: string, updateDto: UpdatePengajuanIzinDto) {
    const pengajuan = await this.findOne(id);

    // Cannot update if already approved or rejected
    if (
      pengajuan.statusPersetujuan === StatusPersetujuan.APPROVED ||
      pengajuan.statusPersetujuan === StatusPersetujuan.REJECTED
    ) {
      throw new BadRequestException(
        'Pengajuan yang sudah disetujui/ditolak tidak dapat diupdate',
      );
    }

    const updateData: any = {};

    if (updateDto.idJenisIzin) {
      const jenisIzin = await this.prisma.refJenisIzin.findUnique({
        where: { idJenisIzin: updateDto.idJenisIzin },
      });

      if (!jenisIzin) {
        throw new NotFoundException(
          `Jenis izin dengan ID ${updateDto.idJenisIzin} tidak ditemukan`,
        );
      }

      updateData.idJenisIzin = updateDto.idJenisIzin;
    }

    if (updateDto.tanggalMulai)
      updateData.tanggalMulai = new Date(updateDto.tanggalMulai);
    if (updateDto.tanggalSelesai)
      updateData.tanggalSelesai = new Date(updateDto.tanggalSelesai);
    if (updateDto.jumlahHari) updateData.jumlahHari = updateDto.jumlahHari;
    if (updateDto.keterangan) updateData.keterangan = updateDto.keterangan;
    if (updateDto.pathBukti !== undefined)
      updateData.pathBukti = updateDto.pathBukti;

    return this.prisma.pengajuanIzin.update({
      where: { idPengajuanIzin: id },
      data: updateData,
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
        jenisIzin: true,
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

    return this.prisma.pengajuanIzin.delete({
      where: { idPengajuanIzin: id },
    });
  }

  // Approve pengajuan
  async approve(id: string, idAtasan: string, catatanAtasan?: string) {
    const pengajuan = await this.findOne(id);

    if (pengajuan.statusPersetujuan !== StatusPersetujuan.PENDING) {
      throw new BadRequestException(
        'Hanya pengajuan dengan status pending yang dapat disetujui',
      );
    }

    // Deduct saldo cuti if jenis izin potong cuti
    if (pengajuan.jenisIzin.potongCuti) {
      const tahun = pengajuan.tanggalMulai.getFullYear();
      await this.saldoCutiService.deductSaldo(
        pengajuan.idKaryawan,
        tahun,
        pengajuan.jumlahHari,
      );
    }

    return this.prisma.pengajuanIzin.update({
      where: { idPengajuanIzin: id },
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
        jenisIzin: true,
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

  // Reject pengajuan
  async reject(id: string, idAtasan: string, catatanAtasan: string) {
    const pengajuan = await this.findOne(id);

    if (pengajuan.statusPersetujuan !== StatusPersetujuan.PENDING) {
      throw new BadRequestException(
        'Hanya pengajuan dengan status pending yang dapat ditolak',
      );
    }

    return this.prisma.pengajuanIzin.update({
      where: { idPengajuanIzin: id },
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
        jenisIzin: true,
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

  // Cancel pengajuan (by karyawan)
  async cancel(id: string) {
    const pengajuan = await this.findOne(id);

    // Only pending and approved can be cancelled
    if (
      pengajuan.statusPersetujuan === 'rejected' ||
      pengajuan.statusPersetujuan === 'cancelled'
    ) {
      throw new BadRequestException(
        'Pengajuan yang sudah ditolak atau dibatalkan tidak dapat dibatalkan lagi',
      );
    }

    // Restore saldo if approved and deducted
    if (
      pengajuan.statusPersetujuan === 'approved' &&
      pengajuan.jenisIzin.potongCuti
    ) {
      const tahun = pengajuan.tanggalMulai.getFullYear();
      await this.saldoCutiService.restoreSaldo(
        pengajuan.idKaryawan,
        tahun,
        pengajuan.jumlahHari,
      );
    }

    return this.prisma.pengajuanIzin.update({
      where: { idPengajuanIzin: id },
      data: {
        statusPersetujuan: 'cancelled',
      },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nik: true,
            nama: true,
          },
        },
        jenisIzin: true,
      },
    });
  }
}
