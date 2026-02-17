/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // 1. Cek karyawan masih aktif
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: payload.sub },
      select: {
        idKaryawan: true,
        username: true,
        nik: true,
        nama: true,
        isActive: true,
        lockedUntil: true,
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
            // Load semua permission dari jabatan
            permissions: {
              select: {
                levelAkses: true,
                permission: {
                  select: {
                    idPermission: true,
                    namaPermission: true,
                  },
                },
              },
            },
          },
        },
        // Load override permission per karyawan
        karyawanPermissionOverrides: {
          select: {
            typePermission: true,
            levelAkses: true,
            permission: {
              select: {
                idPermission: true,
                namaPermission: true,
              },
            },
          },
        },
      },
    });

    if (!karyawan || !karyawan.isActive) {
      throw new UnauthorizedException('Akun tidak aktif atau tidak ditemukan');
    }

    // Cek locked
    if (karyawan.lockedUntil && karyawan.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Akun terkunci hingga ${karyawan.lockedUntil.toISOString()}`,
      );
    }

    // 2. Hitung effective permissions (jabatan + override)
    const effectivePermissions = this.resolveEffectivePermissions(
      karyawan.jabatan.permissions,
      karyawan.karyawanPermissionOverrides,
    );

    // 3. Return user object — ini yang tersedia di req.user di semua guard/controller
    return {
      idKaryawan: karyawan.idKaryawan,
      username: karyawan.username,
      nik: karyawan.nik,
      nama: karyawan.nama,
      jabatan: {
        idJabatan: karyawan.jabatan.idJabatan,
        namaJabatan: karyawan.jabatan.namaJabatan,
        departemen: karyawan.jabatan.departemen,
      },
      // Map: { namaPermission → levelAkses (bitmask) }
      // Contoh: { view_karyawan: 1, create_karyawan: 7, delete_karyawan: 15 }
      permissions: effectivePermissions,
    };
  }

  // ============================================================
  // Resolve permission akhir setelah override diterapkan
  // ============================================================
  private resolveEffectivePermissions(
    jabatanPermissions: {
      levelAkses: number;
      permission: { idPermission: number; namaPermission: string };
    }[],
    overrides: {
      typePermission: boolean;
      levelAkses: number | null;
      permission: { idPermission: number; namaPermission: string };
    }[],
  ): Record<string, number> {
    // Mulai dari permission jabatan
    const result: Record<string, number> = {};
    for (const jp of jabatanPermissions) {
      result[jp.permission.namaPermission] = jp.levelAkses;
    }

    // Terapkan override
    for (const override of overrides) {
      const nama = override.permission.namaPermission;

      if (!override.typePermission) {
        // Revoke → hapus permission ini
        delete result[nama];
      } else if (override.levelAkses !== null) {
        // Grant → set/override level akses
        result[nama] = override.levelAkses;
      }
    }

    return result;
  }
}
