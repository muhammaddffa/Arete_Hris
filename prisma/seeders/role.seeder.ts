/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PrismaClient, RefRole } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRoles() {
  console.log(
    '📝 Seeding Roles & Role-Permission Mapping (Logistics Company)...\n',
  );

  // ===== CREATE ROLES =====
  const roles = [
    // Level 1
    { namaRole: 'Superadmin', deskripsi: 'Full system access', level: 1 },

    // Level 2
    { namaRole: 'HRD', deskripsi: 'Human Resource Department', level: 2 },
    { namaRole: 'Admin', deskripsi: 'System Administrator', level: 2 },
    { namaRole: 'Finance', deskripsi: 'Finance Department', level: 2 },

    // Level 3 - Managers & Coordinators
    {
      namaRole: 'Operations Manager',
      deskripsi: 'Operations Manager',
      level: 3,
    },
    {
      namaRole: 'Operations Coordinator',
      deskripsi: 'Operations Coordinator',
      level: 3,
    }, // ← BARU!
    { namaRole: 'Branch Manager', deskripsi: 'Branch Manager', level: 3 },
    { namaRole: 'Warehouse Manager', deskripsi: 'Warehouse Manager', level: 3 }, // ← BARU!
    {
      namaRole: 'Warehouse Supervisor',
      deskripsi: 'Warehouse Supervisor',
      level: 3,
    }, // ← BARU!
    { namaRole: 'Fleet Manager', deskripsi: 'Fleet Manager', level: 3 }, // ← BARU!
    {
      namaRole: 'Transportation Supervisor',
      deskripsi: 'Transportation Supervisor',
      level: 3,
    }, // ← BARU!
    {
      namaRole: 'Supervisor',
      deskripsi: 'Team Supervisor (Generic)',
      level: 3,
    },

    // Level 4 - Staff
    { namaRole: 'Driver', deskripsi: 'Driver', level: 4 },
    { namaRole: 'Warehouse Staff', deskripsi: 'Warehouse Staff', level: 4 },
    { namaRole: 'Karyawan', deskripsi: 'Regular Employee', level: 4 },
  ];
  const createdRoles: RefRole[] = [];
  for (const role of roles) {
    const result = await prisma.refRole.upsert({
      where: { namaRole: role.namaRole },
      update: {},
      create: role,
    });
    createdRoles.push(result);
    console.log(
      `   ✅ Role created: ${result.namaRole} (ID: ${result.idRole})`,
    );
  }

  console.log(`\n✅ Total roles created: ${createdRoles.length}\n`);

  // ===== 2. GET ALL PERMISSIONS =====
  const allPermissions = await prisma.refPermission.findMany();
  console.log(`📋 Found ${allPermissions.length} permissions in database\n`);

  if (allPermissions.length === 0) {
    throw new Error('❌ No permissions found! Run seedPermissions() first.');
  }

  const permissionMap = new Map(
    allPermissions.map((p) => [p.namaPermission, p.idPermission]),
  );

  // ===== 3. ASSIGN PERMISSIONS TO ROLES =====
  console.log('📝 Mapping permissions to roles...\n');

  // Helper function
  async function assignPermissions(
    roleName: string,
    permissionNames: string[],
  ) {
    const role = createdRoles.find((r) => r.namaRole === roleName);
    if (!role) {
      console.error(`❌ Role not found: ${roleName}`);
      return 0;
    }

    let count = 0;
    for (const permName of permissionNames) {
      const permId = permissionMap.get(permName);
      if (permId) {
        try {
          await prisma.rolePermission.create({
            data: {
              idRole: role.idRole,
              idPermission: permId,
            },
          });
          count++;
        } catch (error) {
          // Skip if already exists (duplicate key error)
          if (!error.code || error.code !== 'P2002') {
            console.error(
              `Error assigning ${permName} to ${roleName}:`,
              error.message,
            );
          }
        }
      } else {
        console.warn(`⚠️  Permission not found: ${permName}`);
      }
    }

    console.log(`${roleName}: ${count} permissions assigned`);
    return count;
  }

  // SUPERADMIN: ALL PERMISSIONS
  await assignPermissions(
    'Superadmin',
    allPermissions.map((p) => p.namaPermission),
  );

  // HRD: 29 PERMISSIONS
  await assignPermissions('HRD', [
    'view_karyawan',
    'create_karyawan',
    'update_karyawan',
    'approve_candidate',
    'reject_candidate',
    'resign_karyawan',
    'create_user_account',
    'view_users',
    'reset_password',
    'toggle_user_status',
    'manage_department',
    'manage_jabatan',
    'view_presensi',
    'view_all_presensi',
    'manage_presensi',
    'manage_jadwal_kerja',
    'assign_jadwal',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'view_all_pengajuan_izin',
    'approve_izin',
    'manage_jenis_izin',
    'manage_saldo_cuti',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
    'view_all_pengajuan_lembur',
    'approve_lembur',
    'manage_wawancara',
    'conduct_wawancara',
    'manage_blacklist',
    'view_reports',
    'export_data',
    'view_all_karyawan',
  ]);

  // ADMIN: 9 PERMISSIONS
  await assignPermissions('Admin', [
    'view_karyawan',
    'manage_department',
    'manage_jabatan',
    'view_all_presensi',
    'manage_jadwal_kerja',
    'assign_jadwal',
    'view_all_pengajuan_izin',
    'view_all_pengajuan_lembur',
    'view_reports',
  ]);

  // FINANCE: 8 PERMISSIONS
  await assignPermissions('Finance', [
    'view_karyawan',
    'view_all_presensi',
    'view_all_pengajuan_izin',
    'view_all_pengajuan_lembur',
    'view_reports',
    'export_data',
    'create_pengajuan_izin',
    'create_pengajuan_lembur',
  ]);

  // OPERATIONS MANAGER: 15 PERMISSIONS
  await assignPermissions('Operations Manager', [
    'view_karyawan',
    'view_presensi',
    'view_all_presensi',
    'manage_presensi',
    'manage_jadwal_kerja',
    'assign_jadwal',
    'view_all_pengajuan_izin',
    'approve_izin',
    'view_all_pengajuan_lembur',
    'approve_lembur',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
    'view_reports',
  ]);

  // BRANCH MANAGER: 14 PERMISSIONS
  await assignPermissions('Branch Manager', [
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
  ]);

  // SUPERVISOR: 13 PERMISSIONS
  await assignPermissions('Supervisor', [
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
  ]);

  // DRIVER: 6 PERMISSIONS
  await assignPermissions('Driver', [
    'view_karyawan',
    'view_presensi',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
  ]);

  // WAREHOUSE STAFF: 6 PERMISSIONS
  await assignPermissions('Warehouse Staff', [
    'view_karyawan',
    'view_presensi',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
  ]);

  // KARYAWAN: 6 PERMISSIONS
  await assignPermissions('Karyawan', [
    'view_karyawan',
    'view_presensi',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
  ]);

  await assignPermissions('Operations Coordinator', [
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
    'view_reports',
  ]);

  // WAREHOUSE MANAGER: 13 PERMISSIONS (BARU!)
  await assignPermissions('Warehouse Manager', [
    'view_karyawan',
    'view_presensi',
    'view_all_presensi',
    'manage_presensi',
    'assign_jadwal',
    'view_all_pengajuan_izin',
    'approve_izin',
    'view_all_pengajuan_lembur',
    'approve_lembur',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
  ]);

  // WAREHOUSE SUPERVISOR: 13 PERMISSIONS (BARU!)
  await assignPermissions('Warehouse Supervisor', [
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
  ]);

  // FLEET MANAGER: 13 PERMISSIONS (BARU!)
  await assignPermissions('Fleet Manager', [
    'view_karyawan',
    'view_presensi',
    'view_all_presensi',
    'manage_jadwal_kerja',
    'assign_jadwal',
    'view_all_pengajuan_izin',
    'approve_izin',
    'view_all_pengajuan_lembur',
    'approve_lembur',
    'create_pengajuan_izin',
    'view_pengajuan_izin',
    'create_pengajuan_lembur',
    'view_pengajuan_lembur',
  ]);

  // TRANSPORTATION SUPERVISOR: 13 PERMISSIONS (BARU!)
  await assignPermissions('Transportation Supervisor', [
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
    'view_reports',
  ]);

  // ===== VERIFY =====
  const totalMappings = await prisma.rolePermission.count();
  console.log(
    `\n✅ Total role-permission mappings created: ${totalMappings}\n`,
  );

  // Detailed breakdown
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 ROLE-PERMISSION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  for (const role of createdRoles) {
    const count = await prisma.rolePermission.count({
      where: { idRole: role.idRole },
    });
    console.log(
      `   ${role.namaRole.padEnd(20)} (Level ${role.level}): ${count} permissions`,
    );
  }
  console.log('═══════════════════════════════════════════════════════════\n');
}

// If run directly
if (require.main === module) {
  seedRoles()
    .catch((e) => {
      console.error('❌ Error seeding roles:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
