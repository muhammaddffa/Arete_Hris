import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.refRole.findMany({
      select: {
        idRole: true,
        namaRole: true,
        deskripsi: true,
        level: true,
      },
      orderBy: [{ level: 'asc' }, { namaRole: 'asc' }],
    });
  }

  async findOne(id: number) {
    return this.prisma.refRole.findUnique({
      where: { idRole: id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findByLevel(level: number) {
    return this.prisma.refRole.findMany({
      where: { level },
      orderBy: { namaRole: 'asc' },
    });
  }
}
