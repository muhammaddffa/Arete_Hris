/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/auth/guards/permissions.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSION_KEY,
  RequiredPermission,
} from '../decorators/permissions.decorator';
import { hasPermission } from '../../common/constants/permission.constant';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ambil metadata dari @RequirePermission decorator
    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Tidak ada decorator → akses bebas (hanya butuh JWT valid)
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user?.permissions) {
      throw new ForbiddenException('Tidak memiliki permission');
    }

    // Cek apakah permission ada
    const levelAkses: number | undefined =
      user.permissions[required.namaPermission];

    if (levelAkses === undefined) {
      throw new ForbiddenException(
        `Tidak punya akses: ${required.namaPermission}`,
      );
    }

    // Cek bitmask: apakah level yang dimiliki mencakup level yang dibutuhkan
    if (!hasPermission(levelAkses, required.levelAkses)) {
      throw new ForbiddenException(
        `Level akses tidak cukup untuk: ${required.namaPermission}`,
      );
    }

    return true;
  }
}
