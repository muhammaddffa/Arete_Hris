import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedLogisticsKaryawan() {
  console.log('📝 Creating Sample Logistics Karyawan (with Auth)...\n');

  // ===== 1. GET REQUIRED DATA =====
  const hrDept = await prisma.refDepartemen.findFirst({
    where: { namaDepartemen: 'Human Resource' },
  });

  const opsDept = await prisma.refDepartemen.findFirst({
    where: { namaDepartemen: 'Operations' },
  });

  const transportDept = await prisma.refDepartemen.findFirst({
    where: { namaDepartemen: 'Transportation' },
  });

  const warehouseDept = await prisma.refDepartemen.findFirst({
    where: { namaDepartemen: 'Warehouse' },
  });

  if (!hrDept || !opsDept || !transportDept || !warehouseDept) {
    throw new Error(
      'Required departments not found. Make sure seedLogisticsDepartments() ran successfully!',
    );
  }

  // Get jabatan
  const hrManagerJabatan = await prisma.refJabatan.findFirst({
    where: {
      namaJabatan: 'HR Manager',
      idDepartemen: hrDept.idDepartemen,
    },
  });

  const opsManagerJabatan = await prisma.refJabatan.findFirst({
    where: {
      namaJabatan: 'Operations Manager',
      idDepartemen: opsDept.idDepartemen,
    },
  });

  const driverJabatan = await prisma.refJabatan.findFirst({
    where: {
      namaJabatan: 'Heavy Truck Driver',
      idDepartemen: transportDept.idDepartemen,
    },
  });

  const warehouseJabatan = await prisma.refJabatan.findFirst({
    where: {
      namaJabatan: 'Warehouse Staff',
      idDepartemen: warehouseDept.idDepartemen,
    },
  });

  if (
    !hrManagerJabatan ||
    !opsManagerJabatan ||
    !driverJabatan ||
    !warehouseJabatan
  ) {
    throw new Error(
      'Required jabatan not found. Make sure seedLogisticsDepartments() ran successfully!',
    );
  }

  // Get roles
  const hrdRole = await prisma.refRole.findFirst({
    where: { namaRole: 'HRD' },
  });

  const opsManagerRole = await prisma.refRole.findFirst({
    where: { namaRole: 'Operations Manager' },
  });

  const driverRole = await prisma.refRole.findFirst({
    where: { namaRole: 'Driver' },
  });

  const warehouseRole = await prisma.refRole.findFirst({
    where: { namaRole: 'Warehouse Staff' },
  });

  if (!hrdRole || !opsManagerRole || !driverRole || !warehouseRole) {
    throw new Error(
      'Required roles not found. Make sure seedRoles() ran successfully!',
    );
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 Creating Sample Karyawan with Auth Credentials...\n');

  // ===== 2. CREATE KARYAWAN 1: HR Manager =====
  let karyawanHRD = await prisma.refKaryawan.findUnique({
    where: { nik: 'HRD001' },
  });

  if (!karyawanHRD) {
    console.log('   → Creating HR Manager karyawan...');
    const username = 'sarah.anderson';
    const passwordHash = await bcrypt.hash(username, 10); // Password = Username

    karyawanHRD = await prisma.refKaryawan.create({
      data: {
        nik: 'HRD001',
        nama: 'Sarah Anderson',
        tempatLahir: 'Jakarta',
        tanggalLahir: new Date('1985-03-15'),
        jenisKelamin: 'P',
        statusPernikahan: 'menikah',
        agama: 'Islam',
        noHpPribadi: '081234567890',
        email: 'sarah.anderson@logistics.com',
        idJabatan: hrManagerJabatan.idJabatan,
        tanggalMasuk: new Date('2020-01-01'),
        status: 'aktif',
        statusKeaktifan: true,
        // Auth fields
        username,
        passwordHash,
        useJabatanRole: true,
        isActive: true,
      },
    });

    console.log('     ✅ Karyawan created: Sarah Anderson (HR Manager)');
    console.log(`        Username: ${username}`);
    console.log(`        Password: ${username}`);
    console.log(
      `        Role: ${hrdRole.namaRole} (from jabatan, id: ${hrManagerJabatan.idRoleDefault})\n`,
    );
  } else {
    console.log('     ✅ Karyawan already exists: Sarah Anderson\n');
  }

  // ===== 3. CREATE KARYAWAN 2: Operations Manager =====
  let karyawanOps = await prisma.refKaryawan.findUnique({
    where: { nik: 'OPS001' },
  });

  if (!karyawanOps) {
    console.log('   → Creating Operations Manager karyawan...');
    const username = 'michael.chen';
    const passwordHash = await bcrypt.hash(username, 10); // Password = Username

    karyawanOps = await prisma.refKaryawan.create({
      data: {
        nik: 'OPS001',
        nama: 'Michael Chen',
        tempatLahir: 'Surabaya',
        tanggalLahir: new Date('1982-07-20'),
        jenisKelamin: 'L',
        statusPernikahan: 'menikah',
        agama: 'Buddha',
        noHpPribadi: '081298765432',
        email: 'michael.chen@logistics.com',
        idJabatan: opsManagerJabatan.idJabatan,
        tanggalMasuk: new Date('2018-03-01'),
        status: 'aktif',
        statusKeaktifan: true,
        // Auth fields
        username,
        passwordHash,
        useJabatanRole: true,
        isActive: true,
      },
    });

    console.log('     ✅ Karyawan created: Michael Chen (Operations Manager)');
    console.log(`        Username: ${username}`);
    console.log(`        Password: ${username}`);
    console.log(
      `        Role: ${opsManagerRole.namaRole} (from jabatan, id: ${opsManagerJabatan.idRoleDefault})\n`,
    );
  } else {
    console.log('     ✅ Karyawan already exists: Michael Chen\n');
  }

  // ===== 4. CREATE KARYAWAN 3: Driver =====
  let karyawanDriver = await prisma.refKaryawan.findUnique({
    where: { nik: 'DRV001' },
  });

  if (!karyawanDriver) {
    console.log('   → Creating Driver karyawan...');
    const username = 'budi.santoso';
    const passwordHash = await bcrypt.hash(username, 10); // Password = Username

    karyawanDriver = await prisma.refKaryawan.create({
      data: {
        nik: 'DRV001',
        nama: 'Budi Santoso',
        tempatLahir: 'Bandung',
        tanggalLahir: new Date('1990-05-10'),
        jenisKelamin: 'L',
        statusPernikahan: 'menikah',
        agama: 'Islam',
        noHpPribadi: '081234509876',
        email: 'budi.santoso@logistics.com',
        idJabatan: driverJabatan.idJabatan,
        tanggalMasuk: new Date('2021-08-15'),
        status: 'aktif',
        statusKeaktifan: true,
        // Auth fields
        username,
        passwordHash,
        useJabatanRole: true,
        isActive: true,
      },
    });

    console.log('     ✅ Karyawan created: Budi Santoso (Heavy Truck Driver)');
    console.log(`        Username: ${username}`);
    console.log(`        Password: ${username}`);
    console.log(
      `        Role: ${driverRole.namaRole} (from jabatan, id: ${driverJabatan.idRoleDefault})\n`,
    );
  } else {
    console.log('     ✅ Karyawan already exists: Budi Santoso\n');
  }

  // ===== 5. CREATE KARYAWAN 4: Warehouse Staff =====
  let karyawanWarehouse = await prisma.refKaryawan.findUnique({
    where: { nik: 'WH001' },
  });

  if (!karyawanWarehouse) {
    console.log('   → Creating Warehouse Staff karyawan...');
    const username = 'andi.wijaya';
    const passwordHash = await bcrypt.hash(username, 10); // Password = Username

    karyawanWarehouse = await prisma.refKaryawan.create({
      data: {
        nik: 'WH001',
        nama: 'Andi Wijaya',
        tempatLahir: 'Semarang',
        tanggalLahir: new Date('1995-11-25'),
        jenisKelamin: 'L',
        statusPernikahan: 'belum_menikah',
        agama: 'Kristen',
        noHpPribadi: '081298760001',
        email: 'andi.wijaya@logistics.com',
        idJabatan: warehouseJabatan.idJabatan,
        tanggalMasuk: new Date('2022-02-10'),
        status: 'aktif',
        statusKeaktifan: true,
        // Auth fields
        username,
        passwordHash,
        useJabatanRole: true,
        isActive: true,
      },
    });

    console.log('     ✅ Karyawan created: Andi Wijaya (Warehouse Staff)');
    console.log(`        Username: ${username}`);
    console.log(`        Password: ${username}`);
    console.log(
      `        Role: ${warehouseRole.namaRole} (from jabatan, id: ${warehouseJabatan.idRoleDefault})\n`,
    );
  } else {
    console.log('     ✅ Karyawan already exists: Andi Wijaya\n');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📊 SAMPLE KARYAWAN SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ✅ Karyawan created:  4 (all with auth credentials)');
  console.log('   ℹ️  useJabatanRole:   true (roles from jabatan.roleDefault)');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📝 LOGIN CREDENTIALS (Username = Password):');
  console.log('───────────────────────────────────────────────────────────');
  console.log('   1. HRD Manager:');
  console.log('      Username: sarah.anderson');
  console.log('      Password: sarah.anderson');
  console.log('      Role:     HRD (from jabatan)');
  console.log('      Karyawan: Sarah Anderson\n');

  console.log('   2. Operations Manager:');
  console.log('      Username: michael.chen');
  console.log('      Password: michael.chen');
  console.log('      Role:     Operations Manager (from jabatan)');
  console.log('      Karyawan: Michael Chen\n');

  console.log('   3. Heavy Truck Driver:');
  console.log('      Username: budi.santoso');
  console.log('      Password: budi.santoso');
  console.log('      Role:     Driver (from jabatan)');
  console.log('      Karyawan: Budi Santoso\n');

  console.log('   4. Warehouse Staff:');
  console.log('      Username: andi.wijaya');
  console.log('      Password: andi.wijaya');
  console.log('      Role:     Warehouse Staff (from jabatan)');
  console.log('      Karyawan: Andi Wijaya\n');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// If run directly
if (require.main === module) {
  seedLogisticsKaryawan()
    .catch((e) => {
      console.error('❌ Error seeding karyawan:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
