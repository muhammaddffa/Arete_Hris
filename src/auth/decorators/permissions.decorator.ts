// src/auth/decorators/permissions.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'required_permission';

export interface RequiredPermission {
  namaPermission: string;
  levelAkses: number; // bitmask: READ=1, CREATE=2, UPDATE=4, DELETE=8
}

/**
 * Decorator untuk proteksi endpoint berdasarkan permission + level akses
 *
 * @param namaPermission - nama permission yang dibutuhkan (sesuai refpermission.nama_permission)
 * @param levelAkses     - bitmask level akses minimum yang dibutuhkan
 *
 * @example
 * // Hanya butuh bisa READ
 * @RequirePermission('view_karyawan', PERMISSION.READ)
 *
 * // Butuh bisa CREATE
 * @RequirePermission('create_karyawan', PERMISSION.CREATE)
 *
 * // Butuh bisa DELETE
 * @RequirePermission('delete_karyawan', PERMISSION.DELETE)
 *
 * // Tombol approve/reject — pakai CREATE karena menulis status baru
 * @RequirePermission('approve_izin', PERMISSION.CREATE)
 */
export const RequirePermission = (namaPermission: string, levelAkses: number) =>
  SetMetadata(PERMISSION_KEY, {
    namaPermission,
    levelAkses,
  } as RequiredPermission);
