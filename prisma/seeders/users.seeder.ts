// prisma/seeders/users.seeder.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedLogisticsUsers() {
  console.log('📝 Creating Sample Logistics Users...\n');

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
  const superadminRole = await prisma.refRole.findFirst({
    where: { namaRole: 'Superadmin' },
  });

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

  if (
    !superadminRole ||
    !hrdRole ||
    !opsManagerRole ||
    !driverRole ||
    !warehouseRole
  ) {
    throw new Error(
      'Required roles not found. Make sure seedRoles() ran successfully!',
    );
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 Creating Sample Karyawan & Users...\n');

  // ===== 2. CREATE SUPERADMIN USER (No Karyawan) =====
  let superadminUser = await prisma.user.findUnique({
    where: { username: 'superadmin' },
  });

  if (!superadminUser) {
    console.log('   → Creating superadmin user account...');
    const passwordHash = await bcrypt.hash('super123', 10);

    superadminUser = await prisma.user.create({
      data: {
        username: 'superadmin',
        email: 'superadmin@logistics.com',
        passwordHash,
        useDepartmentRole: false,
        isActive: true,
      },
    });

    await prisma.userRole.create({
      data: {
        idUser: superadminUser.idUser,
        idRole: superadminRole.idRole,
      },
    });

    console.log('     ✅ User created:');
    console.log('        Username: superadmin');
    console.log('        Password: super123');
    console.log('        Role: Superadmin (Level 1)\n');
  } else {
    console.log('     ✅ User already exists: superadmin\n');
  }

  // ===== 3. CREATE KARYAWAN 1: HR Manager =====
  let karyawanHRD = await prisma.refKaryawan.findUnique({
    where: { nik: 'HRD001' },
  });

  if (!karyawanHRD) {
    console.log('   → Creating HR Manager karyawan...');
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
      },
    });
    console.log('     ✅ Karyawan created: Sarah Anderson (HR Manager)');
  } else {
    console.log('     ✅ Karyawan already exists: Sarah Anderson');
  }

  // CREATE USER FOR HR MANAGER
  let hrdUser = await prisma.user.findUnique({
    where: { username: 'hrd.admin' },
  });

  if (!hrdUser) {
    console.log('   → Creating hrd.admin user account...');
    const passwordHash = await bcrypt.hash('hrd123', 10);

    hrdUser = await prisma.user.create({
      data: {
        username: 'hrd.admin',
        email: 'sarah.anderson@logistics.com',
        passwordHash,
        idKaryawan: karyawanHRD.idKaryawan,
        useDepartmentRole: true,
        isActive: true,
      },
    });

    console.log('     ✅ User created:');
    console.log('        Username: hrd.admin');
    console.log('        Password: hrd123');
    console.log('        Role: HRD (from department)\n');
  } else {
    console.log('     ✅ User already exists: hrd.admin\n');
  }

  // ===== 4. CREATE KARYAWAN 2: Operations Manager =====
  let karyawanOps = await prisma.refKaryawan.findUnique({
    where: { nik: 'OPS001' },
  });

  if (!karyawanOps) {
    console.log('   → Creating Operations Manager karyawan...');
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
      },
    });
    console.log('     ✅ Karyawan created: Michael Chen (Operations Manager)');
  } else {
    console.log('     ✅ Karyawan already exists: Michael Chen');
  }

  // CREATE USER FOR OPS MANAGER
  let opsUser = await prisma.user.findUnique({
    where: { username: 'ops.manager' },
  });

  if (!opsUser) {
    console.log('   → Creating ops.manager user account...');
    const passwordHash = await bcrypt.hash('ops123', 10);

    opsUser = await prisma.user.create({
      data: {
        username: 'ops.manager',
        email: 'michael.chen@logistics.com',
        passwordHash,
        idKaryawan: karyawanOps.idKaryawan,
        useDepartmentRole: true,
        isActive: true,
      },
    });

    console.log('     ✅ User created:');
    console.log('        Username: ops.manager');
    console.log('        Password: ops123');
    console.log('        Role: Operations Manager (from department)\n');
  } else {
    console.log('     ✅ User already exists: ops.manager\n');
  }

  // ===== 5. CREATE KARYAWAN 3: Driver =====
  let karyawanDriver = await prisma.refKaryawan.findUnique({
    where: { nik: 'DRV001' },
  });

  if (!karyawanDriver) {
    console.log('   → Creating Driver karyawan...');
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
      },
    });
    console.log('     ✅ Karyawan created: Budi Santoso (Heavy Truck Driver)');
  } else {
    console.log('     ✅ Karyawan already exists: Budi Santoso');
  }

  // CREATE USER FOR DRIVER
  let driverUser = await prisma.user.findUnique({
    where: { username: 'driver1' },
  });

  if (!driverUser) {
    console.log('   → Creating driver1 user account...');
    const passwordHash = await bcrypt.hash('driver123', 10);

    driverUser = await prisma.user.create({
      data: {
        username: 'driver1',
        email: 'budi.santoso@logistics.com',
        passwordHash,
        idKaryawan: karyawanDriver.idKaryawan,
        useDepartmentRole: true,
        isActive: true,
      },
    });

    console.log('     ✅ User created:');
    console.log('        Username: driver1');
    console.log('        Password: driver123');
    console.log('        Role: Driver (from department)\n');
  } else {
    console.log('     ✅ User already exists: driver1\n');
  }

  // ===== 6. CREATE KARYAWAN 4: Warehouse Staff =====
  let karyawanWarehouse = await prisma.refKaryawan.findUnique({
    where: { nik: 'WH001' },
  });

  if (!karyawanWarehouse) {
    console.log('   → Creating Warehouse Staff karyawan...');
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
      },
    });
    console.log('     ✅ Karyawan created: Andi Wijaya (Warehouse Staff)');
  } else {
    console.log('     ✅ Karyawan already exists: Andi Wijaya');
  }

  // CREATE USER FOR WAREHOUSE STAFF
  let warehouseUser = await prisma.user.findUnique({
    where: { username: 'warehouse1' },
  });

  if (!warehouseUser) {
    console.log('   → Creating warehouse1 user account...');
    const passwordHash = await bcrypt.hash('warehouse123', 10);

    warehouseUser = await prisma.user.create({
      data: {
        username: 'warehouse1',
        email: 'andi.wijaya@logistics.com',
        passwordHash,
        idKaryawan: karyawanWarehouse.idKaryawan,
        useDepartmentRole: true,
        isActive: true,
      },
    });

    console.log('     ✅ User created:');
    console.log('        Username: warehouse1');
    console.log('        Password: warehouse123');
    console.log('        Role: Warehouse Staff (from department)\n');
  } else {
    console.log('     ✅ User already exists: warehouse1\n');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📊 SAMPLE USERS SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ✅ Karyawan created:  4');
  console.log('   ✅ Users created:     5');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📝 LOGIN CREDENTIALS:');
  console.log('───────────────────────────────────────────────────────────');
  console.log('   1. Superadmin (Full Access):');
  console.log('      Username: superadmin');
  console.log('      Password: super123');
  console.log('      Role:     Superadmin (Level 1)\n');

  console.log('   2. HRD Manager:');
  console.log('      Username: hrd.admin');
  console.log('      Password: hrd123');
  console.log('      Role:     HRD (Level 2)');
  console.log('      Karyawan: Sarah Anderson\n');

  console.log('   3. Operations Manager:');
  console.log('      Username: ops.manager');
  console.log('      Password: ops123');
  console.log('      Role:     Operations Manager (Level 3)');
  console.log('      Karyawan: Michael Chen\n');

  console.log('   4. Heavy Truck Driver:');
  console.log('      Username: driver1');
  console.log('      Password: driver123');
  console.log('      Role:     Driver (Level 4)');
  console.log('      Karyawan: Budi Santoso\n');

  console.log('   5. Warehouse Staff:');
  console.log('      Username: warehouse1');
  console.log('      Password: warehouse123');
  console.log('      Role:     Warehouse Staff (Level 4)');
  console.log('      Karyawan: Andi Wijaya\n');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// If run directly
if (require.main === module) {
  seedLogisticsUsers()
    .catch((e) => {
      console.error('❌ Error seeding users:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
