import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed for HR System...\n');

  console.log('🗑️  Cleaning existing data...');

  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.refKaryawan.deleteMany();
  await prisma.refJabatan.deleteMany();
  await prisma.refDepartemen.deleteMany();
  await prisma.refPermission.deleteMany();
  await prisma.refRole.deleteMany();

  await prisma.$executeRaw`ALTER SEQUENCE refrole_id_role_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE refpermission_id_permission_seq RESTART WITH 1`;

  console.log('✅ Database cleaned\n');

  // ============================================
  // 2. SEED ROLES (INT - Master Data)
  // ============================================
  console.log('📝 Creating roles...');

  const roles = await prisma.$transaction([
    prisma.refRole.create({
      data: {
        namaRole: 'superadmin',
        deskripsi: 'Full system access',
        level: 1,
      },
    }),
    prisma.refRole.create({
      data: {
        namaRole: 'hrd',
        deskripsi: 'HR Department - Manage recruitment & employee data',
        level: 2,
      },
    }),
    prisma.refRole.create({
      data: {
        namaRole: 'admin',
        deskripsi: 'System administrator - Manage system settings',
        level: 2,
      },
    }),
    prisma.refRole.create({
      data: {
        namaRole: 'finance',
        deskripsi: 'Finance Department - Manage payroll & budgets',
        level: 2,
      },
    }),
    prisma.refRole.create({
      data: {
        namaRole: 'manager',
        deskripsi: 'Department manager - Manage team & approvals',
        level: 3,
      },
    }),
    prisma.refRole.create({
      data: {
        namaRole: 'karyawan',
        deskripsi: 'Regular employee',
        level: 4,
      },
    }),
  ]);

  console.log('✅ Roles created:', roles.length);
  console.log('\n📋 Role IDs:');
  console.log('┌────┬─────────────┬───────┐');
  console.log('│ ID │ Role Name   │ Level │');
  console.log('├────┼─────────────┼───────┤');
  roles.forEach((role) => {
    console.log(
      `│ ${String(role.idRole).padEnd(2)} │ ${role.namaRole.padEnd(11)} │ ${String(role.level).padEnd(5)} │`,
    );
  });
  console.log('└────┴─────────────┴───────┘\n');

  // 3. SEED PERMISSIONS
  console.log('📝 Creating permissions...');

  const permissions = await prisma.$transaction([
    prisma.refPermission.create({
      data: {
        namaPermission: 'manage_karyawan',
        deskripsi: 'Create, edit, delete karyawan',
      },
    }),
    prisma.refPermission.create({
      data: {
        namaPermission: 'view_karyawan',
        deskripsi: 'View karyawan data',
      },
    }),
    prisma.refPermission.create({
      data: {
        namaPermission: 'manage_jabatan',
        deskripsi: 'Manage positions',
      },
    }),
    prisma.refPermission.create({
      data: {
        namaPermission: 'manage_departemen',
        deskripsi: 'Manage departments',
      },
    }),
    prisma.refPermission.create({
      data: {
        namaPermission: 'view_salary',
        deskripsi: 'View salary information',
      },
    }),
    prisma.refPermission.create({
      data: {
        namaPermission: 'approve_leave',
        deskripsi: 'Approve leave requests',
      },
    }),
    prisma.refPermission.create({
      data: {
        namaPermission: 'view_reports',
        deskripsi: 'View reports',
      },
    }),
  ]);

  console.log('✅ Permissions created:', permissions.length, '\n');

  // 4. MAP ROLE-PERMISSION
  console.log('📝 Mapping role permissions...');

  const superadminRole = roles.find((r) => r.namaRole === 'superadmin')!;
  const hrdRole = roles.find((r) => r.namaRole === 'hrd')!;
  const adminRole = roles.find((r) => r.namaRole === 'admin')!;
  const financeRole = roles.find((r) => r.namaRole === 'finance')!;
  const managerRole = roles.find((r) => r.namaRole === 'manager')!;

  // Superadmin: ALL permissions
  for (const permission of permissions) {
    await prisma.rolePermission.create({
      data: {
        idRole: superadminRole.idRole,
        idPermission: permission.idPermission,
      },
    });
  }

  // HRD: manage karyawan, jabatan, departemen, view salary
  const hrdPerms = [
    'manage_karyawan',
    'view_karyawan',
    'manage_jabatan',
    'manage_departemen',
    'view_salary',
  ];
  for (const permName of hrdPerms) {
    const perm = permissions.find((p) => p.namaPermission === permName);
    if (perm) {
      await prisma.rolePermission.create({
        data: {
          idRole: hrdRole.idRole,
          idPermission: perm.idPermission,
        },
      });
    }
  }

  // Admin: manage departemen, jabatan, view karyawan
  const adminPerms = ['manage_departemen', 'manage_jabatan', 'view_karyawan'];
  for (const permName of adminPerms) {
    const perm = permissions.find((p) => p.namaPermission === permName);
    if (perm) {
      await prisma.rolePermission.create({
        data: {
          idRole: adminRole.idRole,
          idPermission: perm.idPermission,
        },
      });
    }
  }

  // Finance: view salary, view reports
  const financePerms = ['view_salary', 'view_reports'];
  for (const permName of financePerms) {
    const perm = permissions.find((p) => p.namaPermission === permName);
    if (perm) {
      await prisma.rolePermission.create({
        data: {
          idRole: financeRole.idRole,
          idPermission: perm.idPermission,
        },
      });
    }
  }

  // Manager: view karyawan, approve leave
  const managerPerms = ['view_karyawan', 'approve_leave'];
  for (const permName of managerPerms) {
    const perm = permissions.find((p) => p.namaPermission === permName);
    if (perm) {
      await prisma.rolePermission.create({
        data: {
          idRole: managerRole.idRole,
          idPermission: perm.idPermission,
        },
      });
    }
  }

  console.log(' Role permissions mapped\n');

  // 5. SEED SAMPLE DEPARTMENTS
  console.log(' Creating sample departments...');

  const karyawanRole = roles.find((r) => r.namaRole === 'karyawan')!;

  const departments = await prisma.$transaction([
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'IT',
        idRoleDefault: adminRole.idRole,
        deskripsi: 'Information Technology - System development & maintenance',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Finance',
        idRoleDefault: financeRole.idRole,
        deskripsi: 'Finance & Accounting - Budget & payroll management',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Marketing',
        idRoleDefault: karyawanRole.idRole,
        deskripsi: 'Marketing & Communications',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Sales',
        idRoleDefault: karyawanRole.idRole,
        deskripsi: 'Sales & Business Development',
      },
    }),
  ]);

  console.log('✅ Departments created:', departments.length);
  console.log('\n📋 Departments:');
  departments.forEach((dept) => {
    const role = roles.find((r) => r.idRole === dept.idRoleDefault);
    console.log(
      `   - ${dept.namaDepartemen} (Default Role: ${role?.namaRole})`,
    );
  });

  // ============================================
  // 6. SEED SAMPLE JABATAN
  // ============================================
  console.log('\n📝 Creating sample positions...');

  const itDept = departments.find((d) => d.namaDepartemen === 'IT')!;
  const financeDept = departments.find((d) => d.namaDepartemen === 'Finance')!;
  const marketingDept = departments.find(
    (d) => d.namaDepartemen === 'Marketing',
  )!;

  const jabatan = await prisma.$transaction([
    // IT Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'IT Manager',
        idDepartemen: itDept.idDepartemen,
        deskripsiJabatan: 'Lead IT department & manage infrastructure',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Backend Developer',
        idDepartemen: itDept.idDepartemen,
        deskripsiJabatan: 'Develop server-side applications',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Frontend Developer',
        idDepartemen: itDept.idDepartemen,
        deskripsiJabatan: 'Develop user interfaces',
        status: true,
      },
    }),
    // Finance Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Finance Manager',
        idDepartemen: financeDept.idDepartemen,
        deskripsiJabatan: 'Lead finance operations',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Accountant',
        idDepartemen: financeDept.idDepartemen,
        deskripsiJabatan: 'Handle bookkeeping & financial records',
        status: true,
      },
    }),
    // Marketing Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Marketing Manager',
        idDepartemen: marketingDept.idDepartemen,
        deskripsiJabatan: 'Lead marketing campaigns',
        status: true,
      },
    }),
  ]);

  console.log('✅ Positions created:', jabatan.length);

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('═══════════════════════════════════════');
  console.log('Next steps:');
  console.log('1. Start your NestJS app: npm run start:dev');
  console.log('2. Test department endpoints');
  console.log('3. Test jabatan endpoints');
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
