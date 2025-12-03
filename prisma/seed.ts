/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PrismaClient, RefRole, RefDepartemen } from '@prisma/client';
import { seedPermissions } from './seeders/permission.seeder';
import { seedRoles } from './seeders/role.seeder';
import { seedLogisticsDepartments } from './seeders/departments.seeder';
import { seedLogisticsUsers } from './seeders/users.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log(
    '🚀 Starting HR System Database Seeding (LOGISTICS COMPANY)...\n',
  );
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

  // ===== STEP 4: SEED LOGISTICS DEPARTMENTS & JABATAN =====
  console.log('🏢 STEP 4: Creating Logistics Departments & Positions...\n');
  await seedLogisticsDepartments();
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== STEP 5: SEED SAMPLE USERS =====
  console.log('👤 STEP 5: Creating Sample Users...\n');
  await seedLogisticsUsers();
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== FINAL SUMMARY =====
  const departments = await prisma.refDepartemen.count();
  const jabatan = await prisma.refJabatan.count();
  const karyawan = await prisma.refKaryawan.count();
  const users = await prisma.user.count();

  console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 SEEDING SUMMARY (LOGISTICS COMPANY):');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   ✅ Permissions:     37 created`);
  console.log(`   ✅ Roles:           10 created (Logistics-specific)`);
  console.log(`   ✅ Role-Perms:      Mapped for all roles`);
  console.log(`   ✅ Departments:     ${departments} created`);
  console.log(`   ✅ Positions:       ${jabatan} created`);
  console.log(`   ✅ Karyawan:        ${karyawan} created`);
  console.log(`   ✅ Users:           ${users} created`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📝 NEXT STEPS:');
  console.log('───────────────────────────────────────────────────────────');
  console.log('   1. Start your NestJS application:');
  console.log('      → npm run start:dev\n');
  console.log('   2. Login with sample accounts:');
  console.log('      → POST /api/auth/login');
  console.log('        • superadmin / super123 (Full access)');
  console.log('        • hrd.admin / hrd123 (HRD Manager)');
  console.log('        • ops.manager / ops123 (Operations Manager)');
  console.log('        • driver1 / driver123 (Driver)');
  console.log('        • warehouse1 / warehouse123 (Warehouse Staff)\n');
  console.log('   3. Access Prisma Studio to view data:');
  console.log('      → npx prisma studio');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('\n❌ SEEDING FAILED:', e);
    console.error('\nError details:', e.message);
    console.error('\nStack trace:', e.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
