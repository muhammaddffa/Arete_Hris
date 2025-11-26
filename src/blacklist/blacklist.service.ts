/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBlacklistDto,
  UpdateBlacklistDto,
  FilterBlacklistDto,
} from './dto/blacklist.dto';

@Injectable()
export class BlacklistService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREATE BLACKLIST
  // ============================================
  async create(createBlacklistDto: CreateBlacklistDto) {
    // Check if karyawan exists
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: createBlacklistDto.idKaryawan },
      select: {
        idKaryawan: true,
        nik: true,
        nama: true,
        pasfoto: true,
        status: true,
      },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    // Check if already blacklisted
    const existing = await this.prisma.refBlacklist.findUnique({
      where: { idKaryawan: createBlacklistDto.idKaryawan },
    });

    if (existing) {
      throw new ConflictException('Karyawan sudah ada di blacklist');
    }

    // Create blacklist
    return this.prisma.refBlacklist.create({
      data: {
        idKaryawan: createBlacklistDto.idKaryawan,
        nik: karyawan.nik || '',
        nama: karyawan.nama,
        pasfoto: karyawan.pasfoto,
        alasan: createBlacklistDto.alasan,
      },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nama: true,
            email: true,
            noHpPribadi: true,
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
  }

  // ============================================
  // FIND ALL WITH PAGINATION
  // ============================================
  async findAll(filterDto: FilterBlacklistDto) {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeRelations = false,
    } = filterDto;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [data, total] = await this.prisma.$transaction([
      this.prisma.refBlacklist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: includeRelations
          ? {
              karyawan: {
                select: {
                  idKaryawan: true,
                  nama: true,
                  email: true,
                  noHpPribadi: true,
                  status: true,
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
            }
          : undefined,
      }),
      this.prisma.refBlacklist.count({ where }),
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

  // ============================================
  // FIND ONE
  // ============================================
  async findOne(id: string) {
    const blacklist = await this.prisma.refBlacklist.findUnique({
      where: { idBlacklist: id },
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nama: true,
            email: true,
            noHpPribadi: true,
            status: true,
            tanggalMasuk: true,
            tanggalResign: true,
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

    if (!blacklist) {
      throw new NotFoundException('Data blacklist tidak ditemukan');
    }

    return blacklist;
  }

  // ============================================
  // FIND BY KARYAWAN ID
  // ============================================
  async findByKaryawanId(idKaryawan: string) {
    const blacklist = await this.prisma.refBlacklist.findUnique({
      where: { idKaryawan },
    });

    return blacklist;
  }

  // ============================================
  // CHECK IF BLACKLISTED
  // ============================================
  async isBlacklisted(idKaryawan: string): Promise<boolean> {
    const blacklist = await this.findByKaryawanId(idKaryawan);
    return !!blacklist;
  }

  // ============================================
  // CHECK BY NIK
  // ============================================
  async checkByNik(nik: string): Promise<boolean> {
    const blacklist = await this.prisma.refBlacklist.findFirst({
      where: { nik },
    });

    return !!blacklist;
  }

  // ============================================
  // UPDATE
  // ============================================
  async update(id: string, updateBlacklistDto: UpdateBlacklistDto) {
    // Check existence
    await this.findOne(id);

    return this.prisma.refBlacklist.update({
      where: { idBlacklist: id },
      data: updateBlacklistDto,
      include: {
        karyawan: {
          select: {
            idKaryawan: true,
            nama: true,
            email: true,
            noHpPribadi: true,
          },
        },
      },
    });
  }

  // ============================================
  // REMOVE
  // ============================================
  async remove(id: string) {
    // Check existence
    await this.findOne(id);

    return this.prisma.refBlacklist.delete({
      where: { idBlacklist: id },
      select: {
        idBlacklist: true,
        nama: true,
        nik: true,
      },
    });
  }

  // ============================================
  // GET STATS
  // ============================================
  async getStats() {
    const total = await this.prisma.refBlacklist.count();

    return {
      totalBlacklisted: total,
    };
  }
}
