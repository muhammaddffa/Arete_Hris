// src/department/department.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    // Validasi apakah role exist
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const roleExists = await this.prisma.refRole.findUnique({
      where: { idRole: createDepartmentDto.idRoleDefault },
    });

    if (!roleExists) {
      throw new BadRequestException(RESPONSE_MESSAGES.ROLE.NOT_FOUND);
    }

    // Check duplicate
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const exists = await this.prisma.refDepartemen.findFirst({
      where: { namaDepartemen: createDepartmentDto.namaDepartemen },
    });

    if (exists) {
      throw new BadRequestException(
        RESPONSE_MESSAGES.DEPARTMENT.ALREADY_EXISTS,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.refDepartemen.create({
      data: createDepartmentDto,
      include: {
        roleDefault: {
          select: {
            idRole: true,
            namaRole: true,
            level: true,
          },
        },
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findAll(includeRelations = false) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.refDepartemen.findMany({
      include: includeRelations
        ? {
            roleDefault: {
              select: {
                idRole: true,
                namaRole: true,
                level: true,
              },
            },
            _count: {
              select: {
                jabatan: true,
              },
            },
          }
        : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const departemen = await this.prisma.refDepartemen.findUnique({
      where: { idDepartemen: id },
      include: {
        roleDefault: {
          select: {
            idRole: true,
            namaRole: true,
            level: true,
            deskripsi: true,
          },
        },
        _count: {
          select: {
            jabatan: true,
          },
        },
      },
    });

    if (!departemen) {
      throw new NotFoundException(RESPONSE_MESSAGES.DEPARTMENT.NOT_FOUND);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return departemen;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    // Cek apakah departemen exist
    await this.findOne(id);

    // Validasi role jika diupdate
    if (updateDepartmentDto.idRoleDefault) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const roleExists = await this.prisma.refRole.findUnique({
        where: { idRole: updateDepartmentDto.idRoleDefault },
      });

      if (!roleExists) {
        throw new BadRequestException(RESPONSE_MESSAGES.ROLE.NOT_FOUND);
      }
    }

    // Check duplicate name
    if (updateDepartmentDto.namaDepartemen) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const exists = await this.prisma.refDepartemen.findFirst({
        where: {
          namaDepartemen: updateDepartmentDto.namaDepartemen,
          NOT: { idDepartemen: id },
        },
      });

      if (exists) {
        throw new BadRequestException(
          RESPONSE_MESSAGES.DEPARTMENT.ALREADY_EXISTS,
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.refDepartemen.update({
      where: { idDepartemen: id },
      data: updateDepartmentDto,
      include: {
        roleDefault: {
          select: {
            idRole: true,
            namaRole: true,
            level: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Cek apakah ada jabatan yang terkait
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const jabatanCount = await this.prisma.refJabatan.count({
      where: { idDepartemen: id },
    });

    if (jabatanCount > 0) {
      throw new BadRequestException(
        `${RESPONSE_MESSAGES.DEPARTMENT.HAS_JABATAN}. Total: ${jabatanCount} jabatan`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.refDepartemen.delete({
      where: { idDepartemen: id },
    });
  }

  async getDepartmentStats(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const departemen = await this.findOne(id);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [jabatanCount, karyawanCount] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.prisma.refJabatan.count({
        where: { idDepartemen: id },
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.prisma.refKaryawan.count({
        where: {
          jabatan: {
            idDepartemen: id,
          },
          statusKeaktifan: true,
        },
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...departemen,
      stats: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        totalJabatan: jabatanCount,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        totalKaryawanAktif: karyawanCount,
      },
    };
  }
}
