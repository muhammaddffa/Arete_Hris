import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPermissions() {
  console.log('📝 Seeding Permissions (Refactored Naming)...\n');

  const permissions = [
    // ===== KARYAWAN MANAGEMENT (5) =====
    {
      namaPermission: 'manage_karyawan',
      deskripsi: 'Kelola data karyawan (CRUD) - HRD',
    },
    {
      namaPermission: 'own_profile',
      deskripsi: 'Akses dan update profil sendiri',
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

    // ===== AUTH & USER MANAGEMENT (4) =====
    {
      namaPermission: 'reset_password',
      deskripsi: 'Reset password karyawan (admin action)',
    },
    {
      namaPermission: 'toggle_user_status',
      deskripsi: 'Aktifkan/nonaktifkan status karyawan',
    },
    {
      namaPermission: 'manage_permission',
      deskripsi: 'Manage permission override per karyawan',
    },
    {
      namaPermission: 'view_audit_log',
      deskripsi: 'Melihat log perubahan permission',
    },

    // ===== DEPARTMENT & JABATAN (2) =====
    {
      namaPermission: 'manage_department',
      deskripsi: 'Kelola departemen (CRUD master data)',
    },
    {
      namaPermission: 'manage_jabatan',
      deskripsi: 'Kelola jabatan & permission jabatan (CRUD)',
    },

    // ===== PRESENSI (3) =====
    {
      namaPermission: 'own_presensi',
      deskripsi: 'Clock in/out dan lihat presensi sendiri',
    },
    {
      namaPermission: 'view_all_presensi',
      deskripsi: 'Melihat presensi semua karyawan (Manager)',
    },
    {
      namaPermission: 'manage_presensi',
      deskripsi: 'Kelola presensi - koreksi data (HRD)',
    },

    // ===== JADWAL KERJA (2) =====
    {
      namaPermission: 'manage_jadwal_kerja',
      deskripsi: 'Kelola jadwal kerja (CRUD)',
    },
    {
      namaPermission: 'assign_jadwal',
      deskripsi: 'Assign jadwal kerja ke karyawan',
    },

    // ===== IZIN & CUTI (7) =====
    {
      namaPermission: 'submit_izin',
      deskripsi: 'Ajukan izin/cuti sendiri (self-service)',
    },
    {
      namaPermission: 'view_all_izin',
      deskripsi: 'Melihat semua pengajuan izin (Manager/HRD)',
    },
    {
      namaPermission: 'approve_izin',
      deskripsi: 'Approve/reject pengajuan izin (Atasan)',
    },
    {
      namaPermission: 'manage_izin',
      deskripsi: 'Kelola semua pengajuan izin (HRD)',
    },
    {
      namaPermission: 'manage_jenis_izin',
      deskripsi: 'Kelola jenis izin (CRUD master data)',
    },
    {
      namaPermission: 'manage_saldo_cuti',
      deskripsi: 'Kelola saldo cuti karyawan',
    },

    // ===== LEMBUR (4) =====
    {
      namaPermission: 'submit_lembur',
      deskripsi: 'Ajukan lembur sendiri (self-service)',
    },
    {
      namaPermission: 'view_all_lembur',
      deskripsi: 'Melihat semua pengajuan lembur (Manager/HRD)',
    },
    {
      namaPermission: 'approve_lembur',
      deskripsi: 'Approve/reject pengajuan lembur (Atasan)',
    },
    {
      namaPermission: 'manage_lembur',
      deskripsi: 'Kelola semua pengajuan lembur (HRD)',
    },

    // ===== WAWANCARA (2) =====
    {
      namaPermission: 'manage_wawancara',
      deskripsi: 'Kelola jadwal wawancara kandidat (CRUD)',
    },
    {
      namaPermission: 'conduct_wawancara',
      deskripsi: 'Melakukan wawancara dan input hasil/nilai',
    },

    // ===== BLACKLIST (1) =====
    {
      namaPermission: 'manage_blacklist',
      deskripsi: 'Kelola blacklist karyawan bermasalah (CRUD)',
    },

    // ===== FORM & SURVEY (3) =====
    {
      namaPermission: 'answer_form',
      deskripsi: 'Isi form/survey dan lihat jawaban sendiri',
    },
    {
      namaPermission: 'view_form_responses',
      deskripsi: 'Lihat semua jawaban form/survey (HRD)',
    },
    {
      namaPermission: 'manage_form',
      deskripsi: 'Kelola form, question, option (CRUD)',
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
  let updated = 0;

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
      await prisma.refPermission.create({ data: permission });
      created++;
    }
  }

  console.log(`✅ Permissions seeded:`);
  console.log(`   - Created: ${created}`);
  console.log(`   - Updated: ${updated}`);
  console.log(`   - Total: ${permissions.length}\n`);

  console.log('📋 Permission Categories:');
  console.log('   - Karyawan Management:    5 permissions');
  console.log('   - Auth & User Mgmt:       4 permissions');
  console.log('   - Department & Jabatan:   2 permissions');
  console.log('   - Presensi:               3 permissions');
  console.log('   - Jadwal Kerja:           2 permissions');
  console.log('   - Izin & Cuti:            7 permissions');
  console.log('   - Lembur:                 4 permissions');
  console.log('   - Wawancara:              2 permissions');
  console.log('   - Blacklist:              1 permission');
  console.log('   - Form & Survey:          3 permissions');
  console.log('   - Reports & Export:       2 permissions');
  console.log('   ─────────────────────────────────────');
  console.log(
    `   TOTAL:                   ${permissions.length} permissions\n`,
  );
}

// If run directly
if (require.main === module) {
  seedPermissions()
    .catch((e) => {
      console.error('❌ Error seeding permissions:', e);
      process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
}
