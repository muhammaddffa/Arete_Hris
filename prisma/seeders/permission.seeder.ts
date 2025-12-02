// prisma/seeders/permission.seeder.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPermissions() {
  console.log('📝 Seeding Permissions...\n');

  const permissions = [
    // ===== KARYAWAN MANAGEMENT (7) =====
    {
      namaPermission: 'view_karyawan',
      deskripsi: 'Melihat daftar dan detail karyawan',
    },
    {
      namaPermission: 'create_karyawan',
      deskripsi: 'Menambah karyawan baru (candidate)',
    },
    {
      namaPermission: 'update_karyawan',
      deskripsi: 'Mengubah data karyawan',
    },
    {
      namaPermission: 'delete_karyawan',
      deskripsi: 'Menghapus data karyawan (hard delete)',
    },
    {
      namaPermission: 'approve_candidate',
      deskripsi: 'Approve candidate menjadi karyawan aktif',
    },
    {
      namaPermission: 'reject_candidate',
      deskripsi: 'Reject candidate dari rekrutmen',
    },
    {
      namaPermission: 'resign_karyawan',
      deskripsi: 'Proses resign karyawan',
    },

    // ===== USER & AUTH MANAGEMENT (5) =====
    {
      namaPermission: 'create_user_account',
      deskripsi: 'Membuat akun user untuk karyawan',
    },
    {
      namaPermission: 'view_users',
      deskripsi: 'Melihat daftar users dan detail akun',
    },
    {
      namaPermission: 'assign_roles',
      deskripsi: 'Assign custom roles ke user (override department role)',
    },
    {
      namaPermission: 'reset_password',
      deskripsi: 'Reset password user (admin action)',
    },
    {
      namaPermission: 'toggle_user_status',
      deskripsi: 'Aktifkan/nonaktifkan status user',
    },

    // ===== DEPARTMENT & JABATAN (2) =====
    {
      namaPermission: 'manage_department',
      deskripsi: 'CRUD departemen (master data)',
    },
    {
      namaPermission: 'manage_jabatan',
      deskripsi: 'CRUD jabatan (master data)',
    },

    // ===== PRESENSI (3) =====
    {
      namaPermission: 'view_presensi',
      deskripsi: 'Melihat presensi (filter by role: sendiri/tim/semua)',
    },
    {
      namaPermission: 'view_all_presensi',
      deskripsi: 'Melihat presensi semua karyawan (HRD/Admin)',
    },
    {
      namaPermission: 'manage_presensi',
      deskripsi: 'Edit/delete presensi (koreksi data)',
    },

    // ===== JADWAL KERJA (2) =====
    {
      namaPermission: 'manage_jadwal_kerja',
      deskripsi: 'CRUD jadwal kerja (shift pagi/siang/malam/remote)',
    },
    {
      namaPermission: 'assign_jadwal',
      deskripsi: 'Assign jadwal kerja ke karyawan',
    },

    // ===== IZIN & CUTI (6) =====
    {
      namaPermission: 'create_pengajuan_izin',
      deskripsi: 'Mengajukan izin/cuti (self-service)',
    },
    {
      namaPermission: 'view_pengajuan_izin',
      deskripsi: 'Melihat pengajuan izin sendiri',
    },
    {
      namaPermission: 'view_all_pengajuan_izin',
      deskripsi: 'Melihat semua pengajuan izin (HRD/Manager)',
    },
    {
      namaPermission: 'approve_izin',
      deskripsi: 'Approve/reject pengajuan izin (approval workflow)',
    },
    {
      namaPermission: 'manage_jenis_izin',
      deskripsi: 'CRUD jenis izin (cuti tahunan/sakit/dll)',
    },
    {
      namaPermission: 'manage_saldo_cuti',
      deskripsi: 'Manage saldo cuti karyawan (adjust balance)',
    },

    // ===== LEMBUR (4) =====
    {
      namaPermission: 'create_pengajuan_lembur',
      deskripsi: 'Mengajukan lembur (self-service)',
    },
    {
      namaPermission: 'view_pengajuan_lembur',
      deskripsi: 'Melihat pengajuan lembur sendiri',
    },
    {
      namaPermission: 'view_all_pengajuan_lembur',
      deskripsi: 'Melihat semua pengajuan lembur (HRD/Manager)',
    },
    {
      namaPermission: 'approve_lembur',
      deskripsi: 'Approve/reject pengajuan lembur (approval workflow)',
    },

    // ===== WAWANCARA (2) =====
    {
      namaPermission: 'manage_wawancara',
      deskripsi: 'CRUD jadwal wawancara kandidat',
    },
    {
      namaPermission: 'conduct_wawancara',
      deskripsi: 'Melakukan wawancara dan input hasil/nilai',
    },

    // ===== BLACKLIST (1) =====
    {
      namaPermission: 'manage_blacklist',
      deskripsi: 'CRUD blacklist karyawan bermasalah',
    },

    // ===== REPORTS & EXPORT (2) =====
    {
      namaPermission: 'view_reports',
      deskripsi: 'Melihat laporan dan statistik HR',
    },
    {
      namaPermission: 'export_data',
      deskripsi: 'Export data ke Excel/PDF/CSV',
    },
  ];

  let created = 0;
  let updated = 0; // ← DIPERBAIKI: tambahkan deklarasi variabel

  for (const permission of permissions) {
    const existing = await prisma.refPermission.findUnique({
      where: { namaPermission: permission.namaPermission },
    });

    if (existing) {
      await prisma.refPermission.update({
        where: { namaPermission: permission.namaPermission },
        data: { deskripsi: permission.deskripsi },
      });
      updated++;
    } else {
      await prisma.refPermission.create({
        data: permission,
      });
      created++;
    }
  }

  console.log('✅ Permissions seeded:');
  console.log(`   - Created: ${created}`);
  console.log(`   - Updated: ${updated}`);
  console.log(`   - Total: ${permissions.length}\n`);

  // Display summary
  console.log('📋 Permission Categories:');
  console.log('   - Karyawan Management:    7 permissions');
  console.log('   - User & Auth:            5 permissions');
  console.log('   - Department & Jabatan:   2 permissions');
  console.log('   - Presensi:               3 permissions');
  console.log('   - Jadwal Kerja:           2 permissions');
  console.log('   - Izin & Cuti:            6 permissions');
  console.log('   - Lembur:                 4 permissions');
  console.log('   - Wawancara:              2 permissions');
  console.log('   - Blacklist:              1 permission');
  console.log('   - Reports & Export:       2 permissions');
  console.log('   ─────────────────────────────────────');
  console.log('   TOTAL:                   37 permissions\n');
}
