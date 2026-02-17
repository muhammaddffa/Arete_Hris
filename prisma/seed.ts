/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PrismaClient } from '@prisma/client';
import { seedPermissions } from './seeders/permission.seeder';
import { seedLogisticsDepartments } from './seeders/departments.seeder';
import { seedJabatanPermissions } from './seeders/jabatan_permission.seeder';
import { seedLogisticsKaryawan } from './seeders/karyawan.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting HR System Database Seeding...\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== STEP 1: SEED PERMISSIONS =====
  console.log('🌱 STEP 1: Seeding Permissions...\n');
  await seedPermissions();
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== STEP 2: SEED DEPARTMENTS & JABATAN =====
  console.log('🏢 STEP 2: Seeding Departments & Jabatan...\n');
  await seedLogisticsDepartments();
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== STEP 3: SEED JABATAN PERMISSIONS =====
  console.log('🔐 STEP 3: Seeding Jabatan Permissions...\n');
  await seedJabatanPermissions();

  const jabatanPermCount = await prisma.jabatanPermission.count();
  console.log(`✅ Jabatan-Permission mappings created: ${jabatanPermCount}`);
  if (jabatanPermCount === 0) {
    throw new Error('❌ CRITICAL: jabatan_permission table is empty!');
  }
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== STEP 4: SEED KARYAWAN =====
  console.log('👤 STEP 4: Seeding Karyawan...\n');
  await seedLogisticsKaryawan();
  console.log('═══════════════════════════════════════════════════════════\n');

  // ===== FINAL SUMMARY =====
  const [permissions, departments, jabatan, karyawan, jabatanPerms] =
    await Promise.all([
      prisma.refPermission.count(),
      prisma.refDepartemen.count(),
      prisma.refJabatan.count(),
      prisma.refKaryawan.count(),
      prisma.jabatanPermission.count(),
    ]);

  console.log('🎉 DATABASE SEEDING COMPLETED!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 SEEDING SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   ✅ Permissions:              ${permissions} created`);
  console.log(`   ✅ Departments:              ${departments} created`);
  console.log(`   ✅ Jabatan:                  ${jabatan} created`);
  console.log(`   ✅ Jabatan-Permission maps:  ${jabatanPerms} mappings`);
  console.log(`   ✅ Karyawan:                 ${karyawan} created`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📝 LOGIN CREDENTIALS (username = password):');
  console.log('   • sarah.anderson  (HR Manager)');
  console.log('   • michael.chen    (Operations Manager)');
  console.log('   • budi.santoso    (Heavy Truck Driver)');
  console.log('   • andi.wijaya     (Warehouse Staff)');
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
