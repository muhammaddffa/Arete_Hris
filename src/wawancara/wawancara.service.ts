/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWawancaraDto,
  UpdateWawancaraDto,
  FilterWawancaraDto,
  CompleteWawancaraDto,
} from './dto/wawancara.dto';
import { StatusWawancara } from '../model/blacklist-wawancara.model';

@Injectable()
export class WawancaraService {
  constructor(private prisma: PrismaService) {}

  private parseDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date format: ${dateString}`);
    }
    return date;
  }
  async create(createWawancaraDto: CreateWawancaraDto) {
    // Validate pewawancara exists
    const pewawancara = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: createWawancaraDto.idPewawancara },
      select: { idKaryawan: true, nama: true, status: true },
    });

    if (!pewawancara) {
      throw new NotFoundException('Pewawancara tidak ditemukan');
    }

    if (pewawancara.status !== 'aktif') {
      throw new BadRequestException('Pewawancara harus karyawan aktif');
    }

    // Validate peserta exists
    const peserta = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: createWawancaraDto.idPeserta },
      select: { idKaryawan: true, nama: true, status: true },
    });

    if (!peserta) {
      throw new NotFoundException('Peserta tidak ditemukan');
    }

    if (peserta.status !== 'candidate') {
      throw new BadRequestException('Peserta harus berstatus candidate');
    }

    // Check duplicate schedule (same pewawancara, tanggal, jam)
    const tanggalWawancara = this.parseDate(
      createWawancaraDto.tanggalWawancara,
    );

    const existingSchedule = await this.prisma.refWawancara.findFirst({
      where: {
        idPewawancara: createWawancaraDto.idPewawancara,
        tanggalWawancara,
        jamWawancara: createWawancaraDto.jamWawancara,
        status: {
          in: [StatusWawancara.SCHEDULED, StatusWawancara.RESCHEDULED],
        },
      },
    });

    if (existingSchedule) {
      throw new ConflictException(
        'Pewawancara sudah memiliki jadwal di tanggal dan jam yang sama',
      );
    }

    // Create wawancara
    return this.prisma.refWawancara.create({
      data: {
        idPewawancara: createWawancaraDto.idPewawancara,
        idPeserta: createWawancaraDto.idPeserta,
        jenisWawancara: createWawancaraDto.jenisWawancara,
        tanggalWawancara,
        jamWawancara: createWawancaraDto.jamWawancara,
        lokasi: createWawancaraDto.lokasi,
        linkOnline: createWawancaraDto.linkOnline,
        catatan: createWawancaraDto.catatan,
        status: createWawancaraDto.status || StatusWawancara.SCHEDULED,
      },
      include: {
        pewawancara: {
          select: {
            idKaryawan: true,
            nama: true,
            email: true,
            pasfoto: true,
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
        peserta: {
          select: {
            idKaryawan: true,
            nama: true,
            email: true,
            pasfoto: true,
            status: true,
          },
        },
      },
    });
  }

  async findAll(filterDto: FilterWawancaraDto) {
    const {
      status,
      jenisWawancara,
      idPewawancara,
      idPeserta,
      tanggalMulai,
      tanggalAkhir,
      search,
      page = 1,
      limit = 10,
      sortBy = 'tanggalWawancara',
      sortOrder = 'desc',
      includeRelations = true,
    } = filterDto;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (jenisWawancara) {
      where.jenisWawancara = jenisWawancara;
    }

    if (idPewawancara) {
      where.idPewawancara = idPewawancara;
    }

    if (idPeserta) {
      where.idPeserta = idPeserta;
    }

    // Date range filter
    if (tanggalMulai || tanggalAkhir) {
      where.tanggalWawancara = {};
      if (tanggalMulai) {
        where.tanggalWawancara.gte = this.parseDate(tanggalMulai);
      }
      if (tanggalAkhir) {
        where.tanggalWawancara.lte = this.parseDate(tanggalAkhir);
      }
    }

    // Search by peserta name
    if (search) {
      where.peserta = {
        nama: { contains: search, mode: 'insensitive' },
      };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [data, total] = await this.prisma.$transaction([
      this.prisma.refWawancara.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: includeRelations
          ? {
              pewawancara: {
                select: {
                  idKaryawan: true,
                  nama: true,
                  email: true,
                  pasfoto: true,
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
              peserta: {
                select: {
                  idKaryawan: true,
                  nama: true,
                  email: true,
                  pasfoto: true,
                  noHpPribadi: true,
                  status: true,
                },
              },
            }
          : undefined,
      }),
      this.prisma.refWawancara.count({ where }),
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
    const wawancara = await this.prisma.refWawancara.findUnique({
      where: { idWawancara: id },
      include: {
        pewawancara: {
          select: {
            idKaryawan: true,
            nama: true,
            email: true,
            pasfoto: true,
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
        peserta: {
          select: {
            idKaryawan: true,
            nama: true,
            email: true,
            pasfoto: true,
            noHpPribadi: true,
            status: true,
            tempatLahir: true,
            tanggalLahir: true,
            alamat: true,
          },
        },
      },
    });

    if (!wawancara) {
      throw new NotFoundException('Data wawancara tidak ditemukan');
    }

    return wawancara;
  }
  async getByPewawancara(idPewawancara: string, status?: StatusWawancara) {
    const where: any = { idPewawancara };
    if (status) {
      where.status = status;
    }

    return this.prisma.refWawancara.findMany({
      where,
      orderBy: [{ tanggalWawancara: 'desc' }, { jamWawancara: 'desc' }],
      include: {
        peserta: {
          select: {
            idKaryawan: true,
            nama: true,
            email: true,
            pasfoto: true,
            status: true,
          },
        },
      },
    });
  }

  async getByPeserta(idPeserta: string) {
    return this.prisma.refWawancara.findMany({
      where: { idPeserta },
      orderBy: [{ tanggalWawancara: 'desc' }, { jamWawancara: 'desc' }],
      include: {
        pewawancara: {
          select: {
            idKaryawan: true,
            nama: true,
            email: true,
            pasfoto: true,
            jabatan: {
              select: {
                namaJabatan: true,
              },
            },
          },
        },
      },
    });
  }

  // ============================================
  // GET UPCOMING INTERVIEWS
  // ============================================
  async getUpcoming(limit = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.refWawancara.findMany({
      where: {
        tanggalWawancara: { gte: today },
        status: {
          in: [StatusWawancara.SCHEDULED, StatusWawancara.RESCHEDULED],
        },
      },
      take: limit,
      orderBy: [{ tanggalWawancara: 'asc' }, { jamWawancara: 'asc' }],
      include: {
        pewawancara: {
          select: {
            nama: true,
            jabatan: { select: { namaJabatan: true } },
          },
        },
        peserta: {
          select: {
            nama: true,
            email: true,
          },
        },
      },
    });
  }

  // ============================================
  // UPDATE
  // ============================================
  async update(id: string, updateWawancaraDto: UpdateWawancaraDto) {
    // Check existence
    await this.findOne(id);

    // Parse date if provided
    const updateData: any = { ...updateWawancaraDto };
    if (updateWawancaraDto.tanggalWawancara) {
      updateData.tanggalWawancara = this.parseDate(
        updateWawancaraDto.tanggalWawancara,
      );
    }

    return this.prisma.refWawancara.update({
      where: { idWawancara: id },
      data: updateData,
      include: {
        pewawancara: {
          select: {
            idKaryawan: true,
            nama: true,
            email: true,
          },
        },
        peserta: {
          select: {
            idKaryawan: true,
            nama: true,
            email: true,
          },
        },
      },
    });
  }

  // ============================================
  // COMPLETE INTERVIEW
  // ============================================
  async complete(id: string, completeDto: CompleteWawancaraDto) {
    const wawancara = await this.findOne(id);

    if (wawancara.status === StatusWawancara.COMPLETED) {
      throw new BadRequestException('Wawancara sudah diselesaikan');
    }

    if (wawancara.status === StatusWawancara.CANCELLED) {
      throw new BadRequestException('Wawancara sudah dibatalkan');
    }

    return this.prisma.refWawancara.update({
      where: { idWawancara: id },
      data: {
        hasil: completeDto.hasil,
        nilaiHasil: completeDto.nilaiHasil,
        status: StatusWawancara.COMPLETED,
      },
      include: {
        pewawancara: {
          select: { nama: true },
        },
        peserta: {
          select: { nama: true, status: true },
        },
      },
    });
  }

  // ============================================
  // CANCEL INTERVIEW
  // ============================================
  async cancel(id: string, alasan?: string) {
    const wawancara = await this.findOne(id);

    if (wawancara.status === StatusWawancara.COMPLETED) {
      throw new BadRequestException(
        'Wawancara yang sudah selesai tidak bisa dibatalkan',
      );
    }

    if (wawancara.status === StatusWawancara.CANCELLED) {
      throw new BadRequestException('Wawancara sudah dibatalkan');
    }

    return this.prisma.refWawancara.update({
      where: { idWawancara: id },
      data: {
        status: StatusWawancara.CANCELLED,
        catatan: alasan
          ? `${wawancara.catatan || ''}\n\nDibatalkan: ${alasan}`
          : wawancara.catatan,
      },
      select: {
        idWawancara: true,
        status: true,
        tanggalWawancara: true,
        jamWawancara: true,
      },
    });
  }

  // ============================================
  // RESCHEDULE INTERVIEW
  // ============================================
  async reschedule(
    id: string,
    tanggalBaru: string,
    jamBaru: string,
    alasan?: string,
  ) {
    const wawancara = await this.findOne(id);

    if (wawancara.status === StatusWawancara.COMPLETED) {
      throw new BadRequestException(
        'Wawancara yang sudah selesai tidak bisa dijadwalkan ulang',
      );
    }

    if (wawancara.status === StatusWawancara.CANCELLED) {
      throw new BadRequestException(
        'Wawancara yang dibatalkan tidak bisa dijadwalkan ulang',
      );
    }

    // Check conflict
    const tanggalWawancara = this.parseDate(tanggalBaru);
    const existingSchedule = await this.prisma.refWawancara.findFirst({
      where: {
        idPewawancara: wawancara.idPewawancara,
        tanggalWawancara,
        jamWawancara: jamBaru,
        status: {
          in: [StatusWawancara.SCHEDULED, StatusWawancara.RESCHEDULED],
        },
        NOT: { idWawancara: id },
      },
    });

    if (existingSchedule) {
      throw new ConflictException(
        'Pewawancara sudah memiliki jadwal di tanggal dan jam yang sama',
      );
    }

    return this.prisma.refWawancara.update({
      where: { idWawancara: id },
      data: {
        tanggalWawancara,
        jamWawancara: jamBaru,
        status: StatusWawancara.RESCHEDULED,
        catatan: alasan
          ? `${wawancara.catatan || ''}\n\nDijadwalkan ulang: ${alasan}`
          : wawancara.catatan,
      },
      include: {
        pewawancara: { select: { nama: true } },
        peserta: { select: { nama: true } },
      },
    });
  }

  // ============================================
  // DELETE
  // ============================================
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.refWawancara.delete({
      where: { idWawancara: id },
      select: {
        idWawancara: true,
        tanggalWawancara: true,
        jamWawancara: true,
        status: true,
      },
    });
  }

  // ============================================
  // GET STATS
  // ============================================
  async getStats() {
    const [total, byStatus, byJenis] = await Promise.all([
      this.prisma.refWawancara.count(),
      this.prisma.refWawancara.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.refWawancara.groupBy({
        by: ['jenisWawancara'],
        _count: true,
      }),
    ]);

    const statusStats = byStatus.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const jenisStats = byJenis.reduce(
      (acc, curr) => {
        acc[curr.jenisWawancara] = curr._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      byStatus: statusStats,
      byJenis: jenisStats,
    };
  }
}
