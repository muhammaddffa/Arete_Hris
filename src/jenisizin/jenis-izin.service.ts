/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJenisIzinDto, UpdateJenisIzinDto } from './dto/jenis-izin.dto';
import {
  getPaginationParams,
  createPaginatedResponse,
} from '../common/utils/pagination.utils';

@Injectable()
export class JenisIzinService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateJenisIzinDto) {
    const existing = await this.prisma.refJenisIzin.findUnique({
      where: { kodeIzin: createDto.kodeIzin },
    });

    if (existing) {
      throw new ConflictException(
        `Kode izin ${createDto.kodeIzin} sudah digunakan`,
      );
    }

    return this.prisma.refJenisIzin.create({
      data: createDto,
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationParams(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.refJenisIzin.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refJenisIzin.count(),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const jenisIzin = await this.prisma.refJenisIzin.findUnique({
      where: { idJenisIzin: id },
      include: {
        _count: {
          select: { pengajuanIzin: true },
        },
      },
    });

    if (!jenisIzin) {
      throw new NotFoundException(`Jenis izin dengan ID ${id} tidak ditemukan`);
    }

    return jenisIzin;
  }

  async findByKode(kodeIzin: string) {
    const jenisIzin = await this.prisma.refJenisIzin.findUnique({
      where: { kodeIzin },
    });

    if (!jenisIzin) {
      throw new NotFoundException(
        `Jenis izin dengan kode ${kodeIzin} tidak ditemukan`,
      );
    }

    return jenisIzin;
  }

  async update(id: string, updateDto: UpdateJenisIzinDto) {
    await this.findOne(id);

    if (updateDto.kodeIzin) {
      const existing = await this.prisma.refJenisIzin.findFirst({
        where: {
          kodeIzin: updateDto.kodeIzin,
          NOT: { idJenisIzin: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Kode izin ${updateDto.kodeIzin} sudah digunakan`,
        );
      }
    }

    return this.prisma.refJenisIzin.update({
      where: { idJenisIzin: id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const usageCount = await this.prisma.pengajuanIzin.count({
      where: { idJenisIzin: id },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Jenis izin tidak dapat dihapus karena sedang digunakan pada ${usageCount} pengajuan`,
      );
    }

    return this.prisma.refJenisIzin.delete({
      where: { idJenisIzin: id },
    });
  }
}
