// prisma/seeders/users.seeder.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log('👤 STEP 6: Creating Sample Users & Karyawan...\n');

  // ===== 1. GET REQUIRED DATA =====
  const hrDept = await prisma.refDepartemen.findFirst({
    where: { namaDepartemen: 'Human Resource' },
  });

  const itDept = await prisma.refDepartemen.findFirst({
    where: { namaDepartemen: 'Information Technology' },
  });

  if (!hrDept || !itDept) {
    throw new Error('Required departments not found. Run seed.ts first!');
  }

  // Get jabatan
  const hrManagerJabatan = await prisma.refJabatan.findFirst({
    where: {
      namaJabatan: 'HR Manager',
      idDepartemen: hrDept.idDepartemen,
    },
  });

  const backendDevJabatan = await prisma.refJabatan.findFirst({
    where: {
      namaJabatan: 'Backend Developer',
      idDepartemen: itDept.idDepartemen,
    },
  });

  if (!hrManagerJabatan || !backendDevJabatan) {
    throw new Error('Required jabatan not found. Run seed.ts first!');
  }

  // Get roles
  const superadminRole = await prisma.refRole.findFirst({
    where: { namaRole: 'Superadmin' },
  });

  const hrdRole = await prisma.refRole.findFirst({
    where: { namaRole: 'HRD' },
  });

  const karyawanRole = await prisma.refRole.findFirst({
    where: { namaRole: 'Karyawan' },
  });

  if (!superadminRole || !hrdRole || !karyawanRole) {
    throw new Error('Required roles not found. Run seed.ts first!');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 Creating Sample Karyawan & Users...\n');

  // ===== 2. CREATE KARYAWAN 1: HRD Manager (Admin) =====
  let karyawanAdmin = await prisma.refKaryawan.findUnique({
    where: { nik: 'HRD001' },
  });

  if (!karyawanAdmin) {
    console.log('   → Creating HRD Manager karyawan...');
    karyawanAdmin = await prisma.refKaryawan.create({
      data: {
        nik: 'HRD001',
        nama: 'Sarah Anderson',
        tempatLahir: 'Jakarta',
        tanggalLahir: new Date('1985-03-15'),
        jenisKelamin: 'P',
        statusPernikahan: 'menikah',
        agama: 'Islam',
        noHpPribadi: '081234567890',
        email: 'sarah.anderson@company.com',
        idJabatan: hrManagerJabatan.idJabatan,
        tanggalMasuk: new Date('2020-01-01'),
        status: 'aktif',
        statusKeaktifan: true,
      },
    });
    console.log('     ✅ Karyawan created: Sarah Anderson (HRD Manager)');
  } else {
    console.log('     ✅ Karyawan already exists: Sarah Anderson');
  }

  // ===== 3. CREATE USER FOR HRD MANAGER =====
  let adminUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (!adminUser) {
    console.log('   → Creating admin user account...');
    const passwordHash = await bcrypt.hash('admin123', 10);

    adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'sarah.anderson@company.com',
        passwordHash,
        idKaryawan: karyawanAdmin.idKaryawan,
        useDepartmentRole: true, // Use HRD role from department
        isActive: true,
      },
    });

    console.log('     ✅ User created:');
    console.log('        Username: admin');
    console.log('        Password: admin123');
    console.log('        Role: HRD (from department)\n');
  } else {
    console.log('     ✅ User already exists: admin\n');
  }

  // ===== 4. CREATE SUPERADMIN USER (No Karyawan) =====
  let superadminUser = await prisma.user.findUnique({
    where: { username: 'superadmin' },
  });

  if (!superadminUser) {
    console.log('   → Creating superadmin user account...');
    const passwordHash = await bcrypt.hash('super123', 10);

    superadminUser = await prisma.user.create({
      data: {
        username: 'superadmin',
        email: 'superadmin@company.com',
        passwordHash,
        useDepartmentRole: false, // Use custom role
        isActive: true,
      },
    });

    // Assign Superadmin role
    await prisma.userRole.create({
      data: {
        idUser: superadminUser.idUser,
        idRole: superadminRole.idRole,
      },
    });

    console.log('     ✅ User created:');
    console.log('        Username: superadmin');
    console.log('        Password: super123');
    console.log('        Role: Superadmin (custom role)\n');
  } else {
    console.log('     ✅ User already exists: superadmin\n');
  }

  // ===== 5. CREATE KARYAWAN 2: Backend Developer =====
  let karyawanDev = await prisma.refKaryawan.findUnique({
    where: { nik: 'IT001' },
  });

  if (!karyawanDev) {
    console.log('   → Creating Backend Developer karyawan...');
    karyawanDev = await prisma.refKaryawan.create({
      data: {
        nik: 'IT001',
        nama: 'John Smith',
        tempatLahir: 'Bandung',
        tanggalLahir: new Date('1995-08-20'),
        jenisKelamin: 'L',
        statusPernikahan: 'belum_menikah',
        agama: 'Kristen',
        noHpPribadi: '081298765432',
        email: 'john.smith@company.com',
        idJabatan: backendDevJabatan.idJabatan,
        tanggalMasuk: new Date('2023-06-01'),
        status: 'aktif',
        statusKeaktifan: true,
      },
    });
    console.log('     ✅ Karyawan created: John Smith (Backend Developer)');
  } else {
    console.log('     ✅ Karyawan already exists: John Smith');
  }

  // ===== 6. CREATE USER FOR BACKEND DEVELOPER =====
  let devUser = await prisma.user.findUnique({
    where: { username: 'john.smith' },
  });

  if (!devUser) {
    console.log('   → Creating john.smith user account...');
    const passwordHash = await bcrypt.hash('john123', 10);

    devUser = await prisma.user.create({
      data: {
        username: 'john.smith',
        email: 'john.smith@company.com',
        passwordHash,
        idKaryawan: karyawanDev.idKaryawan,
        useDepartmentRole: true,
        isActive: true,
      },
    });

    console.log('     ✅ User created:');
    console.log('        Username: john.smith');
    console.log('        Password: john123');
    console.log('        Role: Karyawan (from IT department)\n');
  } else {
    console.log('     ✅ User already exists: john.smith\n');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📊 SAMPLE USERS SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ✅ Karyawan created:  2');
  console.log('   ✅ Users created:     3');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📝 LOGIN CREDENTIALS:');
  console.log('───────────────────────────────────────────────────────────');
  console.log('   1. Superadmin (Full Access):');
  console.log('      Username: superadmin');
  console.log('      Password: super123');
  console.log('      Role:     Superadmin (Level 1)\n');

  console.log('   2. Admin HRD (HR Manager):');
  console.log('      Username: admin');
  console.log('      Password: admin123');
  console.log('      Role:     HRD (Level 2)');
  console.log('      Karyawan: Sarah Anderson\n');

  console.log('   3. Regular Employee (Backend Dev):');
  console.log('      Username: john.smith');
  console.log('      Password: john123');
  console.log('      Role:     Karyawan (Level 4)');
  console.log('      Karyawan: John Smith\n');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// If run directly
if (require.main === module) {
  seedUsers()
    .catch((e) => {
      console.error('❌ Error seeding users:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
