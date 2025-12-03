/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// prisma/seeders/role.seeder.ts - LOGISTICS COMPANY VERSION
import { PrismaClient, RefRole } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRoles() {
  console.log(
    '📝 Seeding Roles & Role-Permission Mapping (Logistics Company)...\n',
  );

  // ===== 1. CREATE ROLES FOR LOGISTICS COMPANY =====
  const roles = [
    {
      namaRole: 'Superadmin',
      deskripsi: 'Full system access - Can manage entire HRIS system',
      level: 1,
    },
    {
      namaRole: 'HRD',
      deskripsi:
        'Human Resource Department - Manage recruitment, employees, attendance, leave',
      level: 2,
    },
    {
      namaRole: 'Admin',
      deskripsi:
        'System Administrator - Manage master data and system configuration',
      level: 2,
    },
    {
      namaRole: 'Finance',
      deskripsi:
        'Finance Department - Access payroll data, overtime, and financial reports',
      level: 2,
    },
    {
      namaRole: 'Operations Manager',
      deskripsi:
        'Operations Manager - Manage warehouse, drivers, delivery team',
      level: 3,
    },
    {
      namaRole: 'Branch Manager',
      deskripsi: 'Branch Manager - Manage branch employees and operations',
      level: 3,
    },
    {
      namaRole: 'Supervisor',
      deskripsi:
        'Team Supervisor - Approve team leave, overtime, manage team attendance',
      level: 3,
    },
    {
      namaRole: 'Driver',
      deskripsi:
        'Driver - Self-service attendance, leave request, view schedule',
      level: 4,
    },
    {
      namaRole: 'Warehouse Staff',
      deskripsi: 'Warehouse Staff - Self-service attendance, leave request',
      level: 4,
    },
    {
      namaRole: 'Karyawan',
      deskripsi: 'Regular Employee - Self-service access for office staff',
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
    '┌────┬────────────────────┬───────┬────────────────────────────────────────┐',
  );
  console.log(
    '│ ID │ Role Name          │ Level │ Description                            │',
  );
  console.log(
    '├────┼────────────────────┼───────┼────────────────────────────────────────┤',
  );
  createdRoles.forEach((role) => {
    const desc = role.deskripsi ? role.deskripsi.substring(0, 38) : '';
    console.log(
      `│ ${String(role.idRole).padEnd(2)} │ ${role.namaRole.padEnd(18)} │ ${String(role.level).padEnd(5)} │ ${desc.padEnd(38)} │`,
    );
  });
  console.log(
    '└────┴────────────────────┴───────┴────────────────────────────────────────┘\n',
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
    // Karyawan Management (6/7)
    'view_karyawan',
    'create_karyawan',
    'update_karyawan',
    'approve_candidate',
    'reject_candidate',
    'resign_karyawan',

    // User Management (4/5)
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

    // Jadwal Kerja (2/2)
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

    // Recruitment (2/2)
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
    'create_pengajuan_izin',
    'create_pengajuan_lembur',
  ];
  await assignPermissionsToRole(finance.idRole, financePermissions);
  console.log(`     ✅ Finance: ${financePermissions.length} permissions\n`);

  // ===== OPERATIONS MANAGER: 15 PERMISSIONS =====
  const opsManager = createdRoles.find(
    (r) => r.namaRole === 'Operations Manager',
  );
  if (!opsManager) throw new Error('Operations Manager role tidak ditemukan');

  console.log('   → Assigning permissions to Operations Manager...');
  const opsManagerPermissions = [
    // View karyawan
    'view_karyawan',

    // Presensi management
    'view_presensi',
    'view_all_presensi',
    'manage_presensi',

    // Jadwal management
    'manage_jadwal_kerja',
    'assign_jadwal',

    // Approval workflow
    'view_all_pengajuan_izin',
    'approve_izin',
    'view_all_pengajuan_lembur',
    'approve_lembur',

    // Self-service
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',

    // Reports
    'view_reports',
  ];
  await assignPermissionsToRole(opsManager.idRole, opsManagerPermissions);
  console.log(
    `     ✅ Operations Manager: ${opsManagerPermissions.length} permissions\n`,
  );

  // ===== BRANCH MANAGER: 14 PERMISSIONS =====
  const branchManager = createdRoles.find(
    (r) => r.namaRole === 'Branch Manager',
  );
  if (!branchManager) throw new Error('Branch Manager role tidak ditemukan');

  console.log('   → Assigning permissions to Branch Manager...');
  const branchManagerPermissions = [
    'view_karyawan',
    'view_presensi',
    'view_all_presensi',
    'assign_jadwal',
    'view_all_pengajuan_izin',
    'approve_izin',
    'view_all_pengajuan_lembur',
    'approve_lembur',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
    'conduct_wawancara',
    'view_reports',
  ];
  await assignPermissionsToRole(branchManager.idRole, branchManagerPermissions);
  console.log(
    `     ✅ Branch Manager: ${branchManagerPermissions.length} permissions\n`,
  );

  // ===== SUPERVISOR: 13 PERMISSIONS =====
  const supervisor = createdRoles.find((r) => r.namaRole === 'Supervisor');
  if (!supervisor) throw new Error('Supervisor role tidak ditemukan');

  console.log('   → Assigning permissions to Supervisor...');
  const supervisorPermissions = [
    'view_karyawan',
    'view_presensi',
    'view_all_presensi',
    'view_all_pengajuan_izin',
    'approve_izin',
    'view_all_pengajuan_lembur',
    'approve_lembur',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
    'conduct_wawancara',
    'view_reports',
  ];
  await assignPermissionsToRole(supervisor.idRole, supervisorPermissions);
  console.log(
    `     ✅ Supervisor: ${supervisorPermissions.length} permissions\n`,
  );

  // ===== DRIVER: 6 PERMISSIONS =====
  const driver = createdRoles.find((r) => r.namaRole === 'Driver');
  if (!driver) throw new Error('Driver role tidak ditemukan');

  console.log('   → Assigning permissions to Driver...');
  const driverPermissions = [
    'view_karyawan',
    'view_presensi',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
  ];
  await assignPermissionsToRole(driver.idRole, driverPermissions);
  console.log(`     ✅ Driver: ${driverPermissions.length} permissions\n`);

  // ===== WAREHOUSE STAFF: 6 PERMISSIONS =====
  const warehouse = createdRoles.find((r) => r.namaRole === 'Warehouse Staff');
  if (!warehouse) throw new Error('Warehouse Staff role tidak ditemukan');

  console.log('   → Assigning permissions to Warehouse Staff...');
  const warehousePermissions = [
    'view_karyawan',
    'view_presensi',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
  ];
  await assignPermissionsToRole(warehouse.idRole, warehousePermissions);
  console.log(
    `     ✅ Warehouse Staff: ${warehousePermissions.length} permissions\n`,
  );

  // ===== KARYAWAN: 6 PERMISSIONS =====
  const karyawan = createdRoles.find((r) => r.namaRole === 'Karyawan');
  if (!karyawan) throw new Error('Karyawan role tidak ditemukan');

  console.log('   → Assigning permissions to Karyawan...');
  const karyawanPermissions = [
    'view_karyawan',
    'view_presensi',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
  ];
  await assignPermissionsToRole(karyawan.idRole, karyawanPermissions);
  console.log(`     ✅ Karyawan: ${karyawanPermissions.length} permissions\n`);

  // ===== SUMMARY =====
  console.log('═════════════════════════════════════════════════════════════');
  console.log('📊 ROLE-PERMISSION SUMMARY (LOGISTICS COMPANY)');
  console.log('═════════════════════════════════════════════════════════════');
  console.log(
    `   Superadmin (Level 1):         ${allPermissions.length}/37 permissions (Full Access)`,
  );
  console.log(`   HRD (Level 2):                29/37 permissions`);
  console.log(`   Admin (Level 2):              9/37 permissions`);
  console.log(`   Finance (Level 2):            8/37 permissions`);
  console.log(`   Operations Manager (Level 3): 15/37 permissions`);
  console.log(`   Branch Manager (Level 3):     14/37 permissions`);
  console.log(`   Supervisor (Level 3):         13/37 permissions`);
  console.log(`   Driver (Level 4):             6/37 permissions`);
  console.log(`   Warehouse Staff (Level 4):    6/37 permissions`);
  console.log(`   Karyawan (Level 4):           6/37 permissions`);
  console.log(
    '═════════════════════════════════════════════════════════════\n',
  );
}
