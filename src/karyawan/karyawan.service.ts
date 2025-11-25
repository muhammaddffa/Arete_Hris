/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKaryawanDto, UpdateKaryawanDto, FilterKaryawanDto } from './dto';
import { StatusKaryawan } from '../model/karyawan.model';
import { KaryawanTransformer } from './karyawan.transformer';

@Injectable()
export class KaryawanService {
  private transformer: KaryawanTransformer;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.transformer = new KaryawanTransformer(configService);
  }
  private parseDate(dateString: string | undefined): Date | undefined {
    if (!dateString) return undefined;

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date format: ${dateString}`);
    }

    return date;
  }
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
  async create(createKaryawanDto: CreateKaryawanDto) {
    // 1. Validate jabatan
    const jabatan = await this.prisma.refJabatan.findUnique({
      where: { idJabatan: createKaryawanDto.idJabatan },
      select: { idJabatan: true },
    });

    if (!jabatan) {
      throw new BadRequestException('Jabatan tidak ditemukan');
    }

    // 2. Check NIK & Email uniqueness
    if (createKaryawanDto.nik || createKaryawanDto.email) {
      const existing = await this.prisma.refKaryawan.findFirst({
        where: {
          OR: [
            ...(createKaryawanDto.nik ? [{ nik: createKaryawanDto.nik }] : []),
            ...(createKaryawanDto.email
              ? [{ email: createKaryawanDto.email }]
              : []),
          ],
        },
        select: { nik: true, email: true },
      });

      if (existing) {
        if (existing.nik === createKaryawanDto.nik) {
          throw new ConflictException('NIK sudah terdaftar');
        }
        if (existing.email === createKaryawanDto.email) {
          throw new ConflictException('Email sudah terdaftar');
        }
      }
    }

    // 3. Parse and validate dates
    const tanggalLahir = this.parseDate(createKaryawanDto.tanggalLahir);
    const tanggalMasuk = this.parseDate(createKaryawanDto.tanggalMasuk);
    const tanggalResign = this.parseDate(createKaryawanDto.tanggalResign);

    if (!tanggalLahir || !tanggalMasuk) {
      throw new BadRequestException(
        'Tanggal lahir dan tanggal masuk wajib diisi',
      );
    }

    // 4. Validate age
    const age = this.calculateAge(tanggalLahir);
    if (age < 17) {
      throw new BadRequestException('Karyawan harus berusia minimal 17 tahun');
    }

    // 5. Validate resign date
    if (tanggalResign && tanggalResign <= tanggalMasuk) {
      throw new BadRequestException(
        'Tanggal resign harus setelah tanggal masuk',
      );
    }

    // 6. Create karyawan
    const karyawan = await this.prisma.refKaryawan.create({
      data: {
        ...createKaryawanDto,
        tanggalLahir,
        tanggalMasuk,
        tanggalResign,
      },
      include: {
        jabatan: {
          select: {
            idJabatan: true,
            namaJabatan: true,
            departemen: {
              select: {
                idDepartemen: true,
                namaDepartemen: true,
              },
            },
          },
        },
      },
    });

    return this.transformer.transformCreateUpdate(karyawan);
  }

  async findAll(filterDto: FilterKaryawanDto) {
    const {
      status,
      statusKeaktifan,
      idDepartemen,
      idJabatan,
      jenisKelamin,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeRelations = false,
    } = filterDto;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (statusKeaktifan !== undefined) {
      where.statusKeaktifan = statusKeaktifan;
    }

    if (idJabatan) {
      where.idJabatan = idJabatan;
    }

    if (idDepartemen) {
      where.jabatan = {
        idDepartemen,
      };
    }

    if (jenisKelamin) {
      where.jenisKelamin = jenisKelamin;
    }

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.refKaryawan.findMany({
        where,
        skip,
        take: limit,
        include: includeRelations
          ? {
              jabatan: {
                select: {
                  idJabatan: true,
                  namaJabatan: true,
                  departemen: {
                    select: {
                      idDepartemen: true,
                      namaDepartemen: true,
                    },
                  },
                },
              },
            }
          : undefined,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.refKaryawan.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, includeUser = false) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
      include: {
        jabatan: {
          select: {
            idJabatan: true,
            namaJabatan: true,
            deskripsiJabatan: true,
            departemen: {
              select: {
                idDepartemen: true,
                namaDepartemen: true,
              },
            },
          },
        },
        ...(includeUser && {
          user: {
            select: {
              idUser: true,
              username: true,
              email: true,
              isActive: true,
            },
          },
        }),
      },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    // Transform untuk detail view (full data)
    return this.transformer.transformDetail(karyawan);
  }

  /**
   * Find one without transform (for internal use like getting file paths)
   */
  async findOneRaw(id: string) {
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
      select: {
        idKaryawan: true,
        pasfoto: true,
        skck: true,
        suratKesehatan: true,
        cv: true,
      },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    return karyawan;
  }

  // ============================================
  // UPDATE
  // ============================================
  async update(id: string, updateKaryawanDto: UpdateKaryawanDto) {
    // Check existence (without transform for internal use)
    const existing = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
    });

    if (!existing) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    // Validate jabatan if updated
    if (updateKaryawanDto.idJabatan) {
      const jabatan = await this.prisma.refJabatan.findUnique({
        where: { idJabatan: updateKaryawanDto.idJabatan },
        select: { idJabatan: true },
      });

      if (!jabatan) {
        throw new BadRequestException('Jabatan tidak ditemukan');
      }
    }

    // Check NIK/Email uniqueness
    if (updateKaryawanDto.nik || updateKaryawanDto.email) {
      const existing = await this.prisma.refKaryawan.findFirst({
        where: {
          NOT: { idKaryawan: id },
          OR: [
            ...(updateKaryawanDto.nik ? [{ nik: updateKaryawanDto.nik }] : []),
            ...(updateKaryawanDto.email
              ? [{ email: updateKaryawanDto.email }]
              : []),
          ],
        },
        select: { nik: true, email: true },
      });

      if (existing) {
        if (existing.nik === updateKaryawanDto.nik) {
          throw new ConflictException('NIK sudah terdaftar');
        }
        if (existing.email === updateKaryawanDto.email) {
          throw new ConflictException('Email sudah terdaftar');
        }
      }
    }

    // Parse dates
    const updateData: any = { ...updateKaryawanDto };

    if (updateKaryawanDto.tanggalLahir) {
      updateData.tanggalLahir = this.parseDate(updateKaryawanDto.tanggalLahir);
    }
    if (updateKaryawanDto.tanggalMasuk) {
      updateData.tanggalMasuk = this.parseDate(updateKaryawanDto.tanggalMasuk);
    }
    if (updateKaryawanDto.tanggalResign) {
      updateData.tanggalResign = this.parseDate(
        updateKaryawanDto.tanggalResign,
      );
    }

    const updated = await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: updateData,
      include: {
        jabatan: {
          select: {
            idJabatan: true,
            namaJabatan: true,
            departemen: {
              select: {
                idDepartemen: true,
                namaDepartemen: true,
              },
            },
          },
        },
      },
    });

    return this.transformer.transformCreateUpdate(updated);
  }

  // ============================================
  // REMOVE (Soft Delete)
  // ============================================
  async remove(id: string) {
    // Check existence without transform
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    const updated = await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: {
        statusKeaktifan: false,
        status: StatusKaryawan.RESIGN,
      },
      include: {
        jabatan: {
          select: {
            idJabatan: true,
            namaJabatan: true,
            departemen: {
              select: {
                idDepartemen: true,
                namaDepartemen: true,
              },
            },
          },
        },
      },
    });

    return this.transformer.transformCreateUpdate(updated);
  }

  // ============================================
  // APPROVE CANDIDATE
  // ============================================
  async approveCandidate(id: string) {
    // Get raw data without transform for validation
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    if (karyawan.status !== StatusKaryawan.CANDIDATE) {
      throw new BadRequestException('Hanya candidate yang bisa di-approve');
    }

    const updated = await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: {
        status: StatusKaryawan.AKTIF,
        statusKeaktifan: true,
      },
      include: {
        jabatan: {
          select: {
            idJabatan: true,
            namaJabatan: true,
            departemen: {
              select: {
                idDepartemen: true,
                namaDepartemen: true,
              },
            },
          },
        },
      },
    });

    return this.transformer.transformCreateUpdate(updated);
  }

  // ============================================
  // REJECT CANDIDATE
  // ============================================
  async rejectCandidate(id: string) {
    // Get raw data without transform for validation
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    if (karyawan.status !== StatusKaryawan.CANDIDATE) {
      throw new BadRequestException('Hanya candidate yang bisa di-reject');
    }

    const updated = await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: {
        status: StatusKaryawan.REJECTED,
        statusKeaktifan: false,
      },
      include: {
        jabatan: {
          select: {
            idJabatan: true,
            namaJabatan: true,
            departemen: {
              select: {
                idDepartemen: true,
                namaDepartemen: true,
              },
            },
          },
        },
      },
    });

    return this.transformer.transformCreateUpdate(updated);
  }

  // ============================================
  // RESIGN KARYAWAN
  // ============================================
  async resignKaryawan(id: string, tanggalResign?: Date) {
    // Get raw data without transform for validation
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: id },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    if (karyawan.status !== StatusKaryawan.AKTIF) {
      throw new BadRequestException('Hanya karyawan aktif yang bisa resign');
    }

    const updated = await this.prisma.refKaryawan.update({
      where: { idKaryawan: id },
      data: {
        status: StatusKaryawan.RESIGN,
        statusKeaktifan: false,
        tanggalResign: tanggalResign || new Date(),
      },
      include: {
        jabatan: {
          select: {
            idJabatan: true,
            namaJabatan: true,
            departemen: {
              select: {
                idDepartemen: true,
                namaDepartemen: true,
              },
            },
          },
        },
      },
    });

    return this.transformer.transformCreateUpdate(updated);
  }

  // ============================================
  // GET BY DEPARTEMEN
  // ============================================
  async getByDepartemen(idDepartemen: string) {
    // Validate departemen
    const departemen = await this.prisma.refDepartemen.findUnique({
      where: { idDepartemen },
    });

    if (!departemen) {
      throw new NotFoundException('Departemen tidak ditemukan');
    }

    const rawData = await this.prisma.refKaryawan.findMany({
      where: {
        jabatan: {
          idDepartemen,
        },
        statusKeaktifan: true,
      },
      include: {
        jabatan: {
          select: {
            idJabatan: true,
            namaJabatan: true,
            departemen: {
              select: {
                idDepartemen: true,
                namaDepartemen: true,
              },
            },
          },
        },
      },
      orderBy: {
        nama: 'asc',
      },
    });

    // Transform untuk list view
    return rawData.map((karyawan) => this.transformer.transformList(karyawan));
  }

  async getTeamByAtasan(idAtasan: string) {
    // Validate atasan exists (without transform)
    const atasan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: idAtasan },
    });

    if (!atasan) {
      throw new NotFoundException('Atasan tidak ditemukan');
    }

    // Find all jabatan where this karyawan is atasan
    const jabatanList = await this.prisma.refJabatan.findMany({
      where: {
        idAtasan: idAtasan,
      },
      select: {
        idJabatan: true,
      },
    });

    const jabatanIds = jabatanList.map((j) => j.idJabatan);

    if (jabatanIds.length === 0) {
      return [];
    }

    const rawData = await this.prisma.refKaryawan.findMany({
      where: {
        idJabatan: {
          in: jabatanIds,
        },
        statusKeaktifan: true,
      },
      include: {
        jabatan: {
          select: {
            idJabatan: true,
            namaJabatan: true,
            departemen: {
              select: {
                idDepartemen: true,
                namaDepartemen: true,
              },
            },
          },
        },
      },
      orderBy: {
        nama: 'asc',
      },
    });

    // Transform untuk list view
    return rawData.map((karyawan) => this.transformer.transformList(karyawan));
  }

  // ============================================
  // GET STATS
  // ============================================
  async getStats() {
    const [total, aktif, candidate, resign, rejected] = await Promise.all([
      this.prisma.refKaryawan.count(),
      this.prisma.refKaryawan.count({
        where: { status: StatusKaryawan.AKTIF },
      }),
      this.prisma.refKaryawan.count({
        where: { status: StatusKaryawan.CANDIDATE },
      }),
      this.prisma.refKaryawan.count({
        where: { status: StatusKaryawan.RESIGN },
      }),
      this.prisma.refKaryawan.count({
        where: { status: StatusKaryawan.REJECTED },
      }),
    ]);

    return {
      total,
      aktif,
      candidate,
      resign,
      rejected,
    };
  }
}
