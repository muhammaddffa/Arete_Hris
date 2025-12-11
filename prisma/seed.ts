/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PrismaClient } from '@prisma/client';
import { seedPermissions } from './seeders/permission.seeder';
import { seedRoles } from './seeders/role.seeder';
import { seedLogisticsDepartments } from './seeders/departments.seeder';
import { seedLogisticsKaryawan } from './seeders/karyawan.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting HR System Database Seeding...\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== CLEAN DATABASE =====
  console.log('🗑️  STEP 1: Cleaning database...\n');

  await prisma.karyawanPermissionOverride.deleteMany();
  await prisma.karyawanRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.refKaryawan.deleteMany();
  await prisma.refJabatan.deleteMany();
  await prisma.refDepartemen.deleteMany();
  await prisma.refPermission.deleteMany();
  await prisma.refRole.deleteMany();

  await prisma.$executeRaw`ALTER SEQUENCE refrole_id_role_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE refpermission_id_permission_seq RESTART WITH 1`;

  console.log('✅ Database cleaned successfully\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== SEED PERMISSIONS =====
  console.log('🌱 Seeding Permissions...\n');
  await seedPermissions();
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== SEED ROLES & MAP PERMISSIONS =====
  console.log('🎭 Seeding Roles & Mapping Permissions...\n');
  await seedRoles();

  // Verify role-permission mapping
  const rolePermCount = await prisma.rolePermission.count();
  console.log(`\n✅ Role-Permission mappings created: ${rolePermCount}`);
  if (rolePermCount === 0) {
    throw new Error('❌ CRITICAL: role_permission table is empty!');
  }
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== SEED DEPARTMENTS & JABATAN =====
  console.log('🏢 STEP 4: Seeding Departments & Jabatan...\n');
  await seedLogisticsDepartments();
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== SEED KARYAWAN =====
  console.log('👤 STEP 5: Seeding Karyawan...\n');
  await seedLogisticsKaryawan();
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== FINAL SUMMARY =====
  const departments = await prisma.refDepartemen.count();
  const jabatan = await prisma.refJabatan.count();
  const karyawan = await prisma.refKaryawan.count();

  console.log('🎉 DATABASE SEEDING COMPLETED!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 SEEDING SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   ✅ Permissions:        37 created`);
  console.log(`   ✅ Roles:              10 created`);
  console.log(`   ✅ Role-Permissions:   ${rolePermCount} mappings`);
  console.log(`   ✅ Departments:        ${departments} created`);
  console.log(`   ✅ Jabatan:            ${jabatan} created`);
  console.log(`   ✅ Karyawan:           ${karyawan} created`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📝 LOGIN CREDENTIALS (username = password):');
  console.log('   • sarah.anderson / sarah.anderson (HRD Manager)');
  console.log('   • michael.chen / michael.chen (Operations Manager)');
  console.log('   • budi.santoso / budi.santoso (Driver)');
  console.log('   • andi.wijaya / andi.wijaya (Warehouse Staff)');
  console.log(
    '\n═══════════════════════════════════════════════════════════\n',
  );
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
