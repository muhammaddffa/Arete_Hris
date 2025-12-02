/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// prisma/seeders/role.seeder.ts
import { PrismaClient, RefRole } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRoles() {
  console.log('📝 Seeding Roles & Role-Permission Mapping...\n');

  // ===== 1. CREATE ROLES =====
  const roles = [
    {
      namaRole: 'Superadmin',
      deskripsi: 'Full system access - Can do everything',
      level: 1,
    },
    {
      namaRole: 'HRD',
      deskripsi:
        'Human Resource Department - Manage employees, recruitment, attendance',
      level: 2,
    },
    {
      namaRole: 'Admin',
      deskripsi:
        'System Administrator - Manage system settings and master data',
      level: 2,
    },
    {
      namaRole: 'Finance',
      deskripsi:
        'Finance Department - Manage payroll, budgets, and financial reports',
      level: 2,
    },
    {
      namaRole: 'Manager',
      deskripsi: 'Department Manager - Approve requests, manage team',
      level: 3,
    },
    {
      namaRole: 'Karyawan',
      deskripsi: 'Regular Employee - Self-service access',
      level: 4,
    },
  ];

  const createdRoles: RefRole[] = [];
  for (const role of roles) {
    const result = await prisma.refRole.upsert({
      where: { namaRole: role.namaRole },
      update: {},
      create: role,
    });
    createdRoles.push(result);
  }

  console.log('✅ Roles created/verified:', createdRoles.length);
  console.log('\n📋 Role Details:');
  console.log(
    '┌────┬──────────────┬───────┬─────────────────────────────────────┐',
  );
  console.log(
    '│ ID │ Role Name    │ Level │ Description                         │',
  );
  console.log(
    '├────┼──────────────┼───────┼─────────────────────────────────────┤',
  );
  createdRoles.forEach((role) => {
    const desc = role.deskripsi ? role.deskripsi.substring(0, 35) : '';
    console.log(
      `│ ${String(role.idRole).padEnd(2)} │ ${role.namaRole.padEnd(12)} │ ${String(role.level).padEnd(5)} │ ${desc.padEnd(35)} │`,
    );
  });
  console.log(
    '└────┴──────────────┴───────┴─────────────────────────────────────┘\n',
  );

  // ===== 2. GET ALL PERMISSIONS =====
  const allPermissions = await prisma.refPermission.findMany();
  const permissionMap = new Map(
    allPermissions.map((p) => [p.namaPermission, p.idPermission]),
  );

  // ===== 3. ASSIGN PERMISSIONS TO ROLES =====
  console.log('📝 Mapping permissions to roles...\n');

  // Helper function to assign permissions
  async function assignPermissionsToRole(
    roleId: number,
    permissionNames: string[],
  ) {
    for (const permName of permissionNames) {
      const permId = permissionMap.get(permName);
      if (permId) {
        await prisma.rolePermission.upsert({
          where: {
            idRole_idPermission: {
              idRole: roleId,
              idPermission: permId,
            },
          },
          update: {},
          create: {
            idRole: roleId,
            idPermission: permId,
          },
        });
      }
    }
  }

  // ===== SUPERADMIN: ALL PERMISSIONS (37) =====
  const superadmin = createdRoles.find((r) => r.namaRole === 'Superadmin');
  if (!superadmin) throw new Error('Superadmin role tidak ditemukan');

  console.log('   → Assigning ALL permissions to Superadmin...');

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        idRole_idPermission: {
          idRole: superadmin.idRole,
          idPermission: permission.idPermission,
        },
      },
      update: {},
      create: {
        idRole: superadmin.idRole,
        idPermission: permission.idPermission,
      },
    });
  }
  console.log(`     ✅ Superadmin: ${allPermissions.length} permissions\n`);

  // ===== HRD: 29 PERMISSIONS =====
  const hrd = createdRoles.find((r) => r.namaRole === 'HRD');
  if (!hrd) throw new Error('HRD role tidak ditemukan');

  console.log('   → Assigning permissions to HRD...');

  const hrdPermissions = [
    // Karyawan (6/7 - no delete)
    'view_karyawan',
    'create_karyawan',
    'update_karyawan',
    'approve_candidate',
    'reject_candidate',
    'resign_karyawan',

    // Auth (4/5 - no assign_roles, that's superadmin only)
    'create_user_account',
    'view_users',
    'reset_password',
    'toggle_user_status',

    // Master Data (2/2)
    'manage_department',
    'manage_jabatan',

    // Presensi (3/3)
    'view_presensi',
    'view_all_presensi',
    'manage_presensi',

    // Jadwal (2/2)
    'manage_jadwal_kerja',
    'assign_jadwal',

    // Izin & Cuti (6/6)
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'view_all_pengajuan_izin',
    'approve_izin',
    'manage_jenis_izin',
    'manage_saldo_cuti',

    // Lembur (4/4)
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
    'view_all_pengajuan_lembur',
    'approve_lembur',

    // Wawancara (2/2)
    'manage_wawancara',
    'conduct_wawancara',

    // Blacklist (1/1)
    'manage_blacklist',

    // Reports (2/2)
    'view_reports',
    'export_data',
  ];

  await assignPermissionsToRole(hrd.idRole, hrdPermissions);
  console.log(`     ✅ HRD: ${hrdPermissions.length} permissions\n`);

  // ===== ADMIN: 9 PERMISSIONS =====
  const admin = createdRoles.find((r) => r.namaRole === 'Admin');
  if (!admin) throw new Error('Admin role tidak ditemukan');

  console.log('   → Assigning permissions to Admin...');

  const adminPermissions = [
    'view_karyawan',
    'manage_department',
    'manage_jabatan',
    'view_all_presensi',
    'manage_jadwal_kerja',
    'assign_jadwal',
    'view_all_pengajuan_izin',
    'view_all_pengajuan_lembur',
    'view_reports',
  ];

  await assignPermissionsToRole(admin.idRole, adminPermissions);
  console.log(`     ✅ Admin: ${adminPermissions.length} permissions\n`);

  // ===== FINANCE: 8 PERMISSIONS =====
  const finance = createdRoles.find((r) => r.namaRole === 'Finance');
  if (!finance) throw new Error('Finance role tidak ditemukan');

  console.log('   → Assigning permissions to Finance...');

  const financePermissions = [
    'view_karyawan',
    'view_all_presensi',
    'view_all_pengajuan_izin',
    'view_all_pengajuan_lembur',
    'view_reports',
    'export_data',
    'create_pengajuan_izin', // Self-service
    'create_pengajuan_lembur', // Self-service
  ];

  await assignPermissionsToRole(finance.idRole, financePermissions);
  console.log(`     ✅ Finance: ${financePermissions.length} permissions\n`);

  // ===== MANAGER: 13 PERMISSIONS =====
  const manager = createdRoles.find((r) => r.namaRole === 'Manager');
  if (!manager) throw new Error('Manager role tidak ditemukan');

  console.log('   → Assigning permissions to Manager...');

  const managerPermissions = [
    // View only
    'view_karyawan',

    // Presensi team
    'view_presensi',
    'view_all_presensi',

    // Approve team requests
    'view_all_pengajuan_izin',
    'approve_izin',
    'view_all_pengajuan_lembur',
    'approve_lembur',

    // Self-service
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',

    // Wawancara (if assigned)
    'conduct_wawancara',

    // Reports
    'view_reports',
  ];

  await assignPermissionsToRole(manager.idRole, managerPermissions);
  console.log(`     ✅ Manager: ${managerPermissions.length} permissions\n`);

  // ===== KARYAWAN: 6 PERMISSIONS =====
  const karyawan = createdRoles.find((r) => r.namaRole === 'Karyawan');
  if (!karyawan) throw new Error('Karyawan role tidak ditemukan');

  console.log('   → Assigning permissions to Karyawan...');

  const karyawanPermissions = [
    // Self-service only
    'view_karyawan', // Own profile
    'view_presensi', // Own attendance
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
  ];

  await assignPermissionsToRole(karyawan.idRole, karyawanPermissions);
  console.log(`     ✅ Karyawan: ${karyawanPermissions.length} permissions\n`);

  // ===== SUMMARY =====
  console.log('═════════════════════════════════════════════════════════════');
  console.log('📊 ROLE-PERMISSION SUMMARY');
  console.log('═════════════════════════════════════════════════════════════');
  console.log(
    `   Superadmin (Level 1):  ${allPermissions.length}/37 permissions (Full Access)`,
  );
  console.log(`   HRD (Level 2):         29/37 permissions`);
  console.log(`   Admin (Level 2):       9/37 permissions`);
  console.log(`   Finance (Level 2):     8/37 permissions`);
  console.log(`   Manager (Level 3):     13/37 permissions`);
  console.log(`   Karyawan (Level 4):    6/37 permissions`);
  console.log(
    '═════════════════════════════════════════════════════════════\n',
  );
}
