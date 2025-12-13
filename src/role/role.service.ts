import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all roles untuk dropdown
   */
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

  /**
   * Get role by ID with permissions
   */
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

  /**
   * Get roles by level
   */
  async findByLevel(level: number) {
    return this.prisma.refRole.findMany({
      where: { level },
      orderBy: { namaRole: 'asc' },
    });
  }
}
