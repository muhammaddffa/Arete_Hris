/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaldoCutiDto, UpdateSaldoCutiDto } from './dto/saldo-cuti.dto';
import {
  getPaginationParams,
  createPaginatedResponse,
} from '../common/utils/pagination.utils';
import { RefSaldoCuti } from '@prisma/client';

@Injectable()
export class SaldoCutiService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSaldoCutiDto) {
    // Validate karyawan exists
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: createDto.idKaryawan },
    });

    if (!karyawan) {
      throw new NotFoundException(
        `Karyawan dengan ID ${createDto.idKaryawan} tidak ditemukan`,
      );
    }

    // Check if saldo for this year already exists
    const existing = await this.prisma.refSaldoCuti.findUnique({
      where: {
        idKaryawan_tahun: {
          idKaryawan: createDto.idKaryawan,
          tahun: createDto.tahun,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Saldo cuti untuk tahun ${createDto.tahun} sudah ada`,
      );
    }

    const saldoAwal = createDto.saldoAwal ?? 12;
    const saldoTerpakai = createDto.saldoTerpakai ?? 0;
    const saldoSisa = createDto.saldoSisa ?? saldoAwal - saldoTerpakai;

    return this.prisma.refSaldoCuti.create({
      data: {
        idKaryawan: createDto.idKaryawan,
        tahun: createDto.tahun,
        saldoAwal,
        saldoTerpakai,
        saldoSisa,
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
    idKaryawan?: string,
    tahun?: number,
  ) {
    const { skip, take } = getPaginationParams(page, limit);
    const where: any = {};

    if (idKaryawan) where.idKaryawan = idKaryawan;
    if (tahun) where.tahun = tahun;

    const [data, total] = await Promise.all([
      this.prisma.refSaldoCuti.findMany({
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
        },
        orderBy: [{ tahun: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.refSaldoCuti.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const saldoCuti = await this.prisma.refSaldoCuti.findUnique({
      where: { idSaldo: id },
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

    if (!saldoCuti) {
      throw new NotFoundException(`Saldo cuti dengan ID ${id} tidak ditemukan`);
    }

    return saldoCuti;
  }

  async findByKaryawanAndYear(idKaryawan: string, tahun: number) {
    const saldoCuti = await this.prisma.refSaldoCuti.findUnique({
      where: {
        idKaryawan_tahun: {
          idKaryawan,
          tahun,
        },
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

    if (!saldoCuti) {
      throw new NotFoundException(
        `Saldo cuti untuk karyawan ${idKaryawan} tahun ${tahun} tidak ditemukan`,
      );
    }

    return saldoCuti;
  }

  async update(id: string, updateDto: UpdateSaldoCutiDto) {
    await this.findOne(id);

    return this.prisma.refSaldoCuti.update({
      where: { idSaldo: id },
      data: updateDto,
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

    return this.prisma.refSaldoCuti.delete({
      where: { idSaldo: id },
    });
  }

  // Deduct saldo cuti (when leave is approved)
  async deductSaldo(idKaryawan: string, tahun: number, jumlahHari: number) {
    const saldoCuti = await this.findByKaryawanAndYear(idKaryawan, tahun);

    if (saldoCuti.saldoSisa < jumlahHari) {
      throw new BadRequestException(
        `Saldo cuti tidak mencukupi. Sisa: ${saldoCuti.saldoSisa} hari, Dibutuhkan: ${jumlahHari} hari`,
      );
    }

    return this.prisma.refSaldoCuti.update({
      where: { idSaldo: saldoCuti.idSaldo },
      data: {
        saldoTerpakai: saldoCuti.saldoTerpakai + jumlahHari,
        saldoSisa: saldoCuti.saldoSisa - jumlahHari,
      },
    });
  }

  // Restore saldo cuti (when leave is cancelled/rejected)
  async restoreSaldo(idKaryawan: string, tahun: number, jumlahHari: number) {
    const saldoCuti = await this.findByKaryawanAndYear(idKaryawan, tahun);

    return this.prisma.refSaldoCuti.update({
      where: { idSaldo: saldoCuti.idSaldo },
      data: {
        saldoTerpakai: Math.max(0, saldoCuti.saldoTerpakai - jumlahHari),
        saldoSisa: Math.min(
          saldoCuti.saldoAwal,
          saldoCuti.saldoSisa + jumlahHari,
        ),
      },
    });
  }

  // Auto-create saldo for new year
  async autoCreateYearlySaldo(tahun: number) {
    const karyawanList = await this.prisma.refKaryawan.findMany({
      where: { statusKeaktifan: true },
      select: { idKaryawan: true },
    });

    const results: RefSaldoCuti[] = [];
    for (const karyawan of karyawanList) {
      try {
        const existing = await this.prisma.refSaldoCuti.findUnique({
          where: {
            idKaryawan_tahun: {
              idKaryawan: karyawan.idKaryawan,
              tahun,
            },
          },
        });

        if (!existing) {
          const saldo = await this.prisma.refSaldoCuti.create({
            data: {
              idKaryawan: karyawan.idKaryawan,
              tahun,
              saldoAwal: 12,
              saldoTerpakai: 0,
              saldoSisa: 12,
            },
          });
          results.push(saldo);
        }
      } catch (error) {
        console.error(
          `Error creating saldo for ${karyawan.idKaryawan}:`,
          error,
        );
      }
    }

    return results;
  }
}
