/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// prisma/seed.ts
import { PrismaClient, RefRole, RefDepartemen } from '@prisma/client';
import { seedPermissions } from './permission.seeder';
import { seedRoles } from './role.seeder';
import { seedUsers } from './users.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting HR System Database Seeding...\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== STEP 1: CLEAN DATABASE =====
  console.log('🗑️  STEP 1: Cleaning existing data...\n');

  console.log('   → Deleting role-permission mappings...');
  await prisma.rolePermission.deleteMany();

  console.log('   → Deleting user roles...');
  await prisma.userRole.deleteMany();

  console.log('   → Deleting users...');
  await prisma.user.deleteMany();

  console.log('   → Deleting karyawan...');
  await prisma.refKaryawan.deleteMany();

  console.log('   → Deleting jabatan...');
  await prisma.refJabatan.deleteMany();

  console.log('   → Deleting departemen...');
  await prisma.refDepartemen.deleteMany();

  console.log('   → Deleting permissions...');
  await prisma.refPermission.deleteMany();

  console.log('   → Deleting roles...');
  await prisma.refRole.deleteMany();

  // Reset auto-increment sequences
  console.log('   → Resetting ID sequences...');
  await prisma.$executeRaw`ALTER SEQUENCE refrole_id_role_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE refpermission_id_permission_seq RESTART WITH 1`;

  console.log('\n✅ Database cleaned successfully\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== STEP 2: SEED PERMISSIONS =====
  console.log('🌱 STEP 2: Seeding Permissions...\n');
  await seedPermissions();
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== STEP 3: SEED ROLES & MAP PERMISSIONS =====
  console.log('🎭 STEP 3: Seeding Roles & Mapping Permissions...\n');
  await seedRoles();
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== STEP 4: SEED SAMPLE DEPARTMENTS =====
  console.log('🏢 STEP 4: Creating Sample Departments...\n');

  const roles: RefRole[] = await prisma.refRole.findMany();

  const hrdRole = roles.find((r) => r.namaRole === 'HRD');
  if (!hrdRole) throw new Error('HRD role tidak ditemukan');

  const adminRole = roles.find((r) => r.namaRole === 'Admin');
  if (!adminRole) throw new Error('Admin role tidak ditemukan');

  const financeRole = roles.find((r) => r.namaRole === 'Finance');
  if (!financeRole) throw new Error('Finance role tidak ditemukan');

  const karyawanRole = roles.find((r) => r.namaRole === 'Karyawan');
  if (!karyawanRole) throw new Error('Karyawan role tidak ditemukan');

  const departments: RefDepartemen[] = await prisma.$transaction([
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Human Resource',
        idRoleDefault: hrdRole.idRole,
        deskripsi: 'Manage recruitment, employee data, and HR operations',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Information Technology',
        idRoleDefault: adminRole.idRole,
        deskripsi: 'System development, maintenance, and IT support',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Finance & Accounting',
        idRoleDefault: financeRole.idRole,
        deskripsi: 'Financial management, budgeting, and payroll',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Marketing',
        idRoleDefault: karyawanRole.idRole,
        deskripsi: 'Marketing campaigns and brand management',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Sales',
        idRoleDefault: karyawanRole.idRole,
        deskripsi: 'Sales operations and business development',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Operations',
        idRoleDefault: karyawanRole.idRole,
        deskripsi: 'Daily operations and logistics',
      },
    }),
  ]);

  console.log('✅ Departments created:', departments.length);
  console.log('\n📋 Department Details:');
  console.log(
    '┌──────────────────────────────┬────────────────┬─────────────┐',
  );
  console.log(
    '│ Department Name              │ Default Role   │ Level       │',
  );
  console.log(
    '├──────────────────────────────┼────────────────┼─────────────┤',
  );
  departments.forEach((dept) => {
    const role = roles.find((r) => r.idRole === dept.idRoleDefault);
    console.log(
      `│ ${dept.namaDepartemen.padEnd(28)} │ ${role?.namaRole.padEnd(14)} │ Level ${role?.level}     │`,
    );
  });
  console.log(
    '└──────────────────────────────┴────────────────┴─────────────┘\n',
  );

  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== STEP 5: SEED SAMPLE JABATAN =====
  console.log('💼 STEP 5: Creating Sample Positions (Jabatan)...\n');

  const hrDept = departments.find((d) => d.namaDepartemen === 'Human Resource');
  if (!hrDept) throw new Error('HR Department tidak ditemukan');

  const itDept = departments.find(
    (d) => d.namaDepartemen === 'Information Technology',
  );
  if (!itDept) throw new Error('IT Department tidak ditemukan');

  const financeDept = departments.find(
    (d) => d.namaDepartemen === 'Finance & Accounting',
  );
  if (!financeDept) throw new Error('Finance Department tidak ditemukan');

  const marketingDept = departments.find(
    (d) => d.namaDepartemen === 'Marketing',
  );
  if (!marketingDept) throw new Error('Marketing Department tidak ditemukan');

  const salesDept = departments.find((d) => d.namaDepartemen === 'Sales');
  if (!salesDept) throw new Error('Sales Department tidak ditemukan');

  const jabatan = await prisma.$transaction([
    // HR Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'HR Manager',
        idDepartemen: hrDept.idDepartemen,
        deskripsiJabatan:
          'Lead HR operations, recruitment, and employee management',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'HR Specialist',
        idDepartemen: hrDept.idDepartemen,
        deskripsiJabatan:
          'Handle recruitment, onboarding, and employee relations',
        status: true,
      },
    }),

    // IT Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'IT Manager',
        idDepartemen: itDept.idDepartemen,
        deskripsiJabatan: 'Lead IT department and manage infrastructure',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Backend Developer',
        idDepartemen: itDept.idDepartemen,
        deskripsiJabatan: 'Develop and maintain server-side applications',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Frontend Developer',
        idDepartemen: itDept.idDepartemen,
        deskripsiJabatan: 'Develop user interfaces and web applications',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'DevOps Engineer',
        idDepartemen: itDept.idDepartemen,
        deskripsiJabatan: 'Manage CI/CD pipelines and infrastructure',
        status: true,
      },
    }),

    // Finance Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Finance Manager',
        idDepartemen: financeDept.idDepartemen,
        deskripsiJabatan: 'Lead finance operations and budgeting',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Accountant',
        idDepartemen: financeDept.idDepartemen,
        deskripsiJabatan: 'Handle bookkeeping and financial records',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Payroll Specialist',
        idDepartemen: financeDept.idDepartemen,
        deskripsiJabatan: 'Process payroll and employee benefits',
        status: true,
      },
    }),

    // Marketing Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Marketing Manager',
        idDepartemen: marketingDept.idDepartemen,
        deskripsiJabatan: 'Lead marketing campaigns and strategy',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Digital Marketing Specialist',
        idDepartemen: marketingDept.idDepartemen,
        deskripsiJabatan: 'Manage digital marketing and social media',
        status: true,
      },
    }),

    // Sales Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Sales Manager',
        idDepartemen: salesDept.idDepartemen,
        deskripsiJabatan: 'Lead sales team and manage targets',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Sales Executive',
        idDepartemen: salesDept.idDepartemen,
        deskripsiJabatan: 'Handle client relationships and sales',
        status: true,
      },
    }),
  ]);

  console.log('✅ Positions created:', jabatan.length);

  // Group by department
  const jabatanByDept = departments
    .map((dept) => ({
      dept: dept.namaDepartemen,
      positions: jabatan.filter((j) => j.idDepartemen === dept.idDepartemen),
    }))
    .filter((item) => item.positions.length > 0);

  console.log('\n📋 Positions by Department:');
  jabatanByDept.forEach((item) => {
    console.log(`\n   ${item.dept}:`);
    item.positions.forEach((pos) => {
      console.log(`      - ${pos.namaJabatan}`);
    });
  });

  console.log(
    '\n═══════════════════════════════════════════════════════════\n',
  );

  // ===== STEP 6: SEED SAMPLE USERS ===== (NEW!)
  await seedUsers();

  // ===== FINAL SUMMARY =====
  console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 SEEDING SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   ✅ Permissions:     37 created`);
  console.log(`   ✅ Roles:           6 created`);
  console.log(`   ✅ Role-Perms:      Mapped for all roles`);
  console.log(`   ✅ Departments:     ${departments.length} created`);
  console.log(`   ✅ Positions:       ${jabatan.length} created`);
  console.log(`   ✅ Karyawan:        2 created`);
  console.log(`   ✅ Users:           3 created`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📝 NEXT STEPS:');
  console.log('───────────────────────────────────────────────────────────');
  console.log('   1. Start your NestJS application:');
  console.log('      → npm run start:dev\n');
  console.log('   2. Login with sample accounts:');
  console.log('      → POST /api/auth/login');
  console.log('        • superadmin / super123 (Full access)');
  console.log('        • admin / admin123 (HRD access)');
  console.log('        • john.smith / john123 (Employee access)\n');
  console.log('   3. Access Prisma Studio to view data:');
  console.log('      → npx prisma studio');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('\n❌ SEEDING FAILED:', e);
    console.error('\nError details:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
