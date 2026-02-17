import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedLogisticsKaryawan() {
  console.log('📝 Creating Sample Logistics Karyawan (with Auth)...\n');

  // ===== GET REQUIRED JABATAN =====
  const hrDept = await prisma.refDepartemen.findFirst({ where: { namaDepartemen: 'Human Resource' } });
  const opsDept = await prisma.refDepartemen.findFirst({ where: { namaDepartemen: 'Operations' } });
  const transportDept = await prisma.refDepartemen.findFirst({ where: { namaDepartemen: 'Transportation' } });
  const warehouseDept = await prisma.refDepartemen.findFirst({ where: { namaDepartemen: 'Warehouse' } });

  if (!hrDept || !opsDept || !transportDept || !warehouseDept) {
    throw new Error('Required departments not found. Run seedLogisticsDepartments() first!');
  }

  const hrManagerJabatan = await prisma.refJabatan.findFirst({
    where: { namaJabatan: 'HR Manager', idDepartemen: hrDept.idDepartemen },
  });
  const opsManagerJabatan = await prisma.refJabatan.findFirst({
    where: { namaJabatan: 'Operations Manager', idDepartemen: opsDept.idDepartemen },
  });
  const driverJabatan = await prisma.refJabatan.findFirst({
    where: { namaJabatan: 'Heavy Truck Driver', idDepartemen: transportDept.idDepartemen },
  });
  const warehouseJabatan = await prisma.refJabatan.findFirst({
    where: { namaJabatan: 'Warehouse Staff', idDepartemen: warehouseDept.idDepartemen },
  });

  if (!hrManagerJabatan || !opsManagerJabatan || !driverJabatan || !warehouseJabatan) {
    throw new Error('Required jabatan not found. Run seedLogisticsDepartments() first!');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📝 Creating Sample Karyawan with Auth Credentials...\n');

  // ===== HELPER =====
  async function createKaryawan(data: {
    nik: string;
    nama: string;
    username: string;
    tempatLahir: string;
    tanggalLahir: Date;
    jenisKelamin: 'L' | 'P';
    statusPernikahan: 'menikah' | 'belum_menikah' | 'cerai';
    agama: string;
    noHpPribadi: string;
    email: string;
    idJabatan: string;
    tanggalMasuk: Date;
    jabatanLabel: string;
  }) {
    const existing = await prisma.refKaryawan.findUnique({ where: { nik: data.nik } });
    if (existing) {
      console.log(`     ✅ Already exists: ${data.nama}\n`);
      return existing;
    }

    console.log(`   → Creating ${data.jabatanLabel}...`);
    const passwordHash = await bcrypt.hash(data.username, 10);

    const karyawan = await prisma.refKaryawan.create({
      data: {
        nik: data.nik,
        nama: data.nama,
        tempatLahir: data.tempatLahir,
        tanggalLahir: data.tanggalLahir,
        jenisKelamin: data.jenisKelamin,
        statusPernikahan: data.statusPernikahan,
        agama: data.agama,
        noHpPribadi: data.noHpPribadi,
        email: data.email,
        idJabatan: data.idJabatan,
        tanggalMasuk: data.tanggalMasuk,
        status: 'aktif',
        statusKeaktifan: true,
        // Auth fields
        username: data.username,
        passwordHash,
        isActive: true,
        mustChangePassword: false,
      },
    });

    console.log(`     ✅ Created: ${data.nama} (${data.jabatanLabel})`);
    console.log(`        Username: ${data.username}`);
    console.log(`        Password: ${data.username}`);
    console.log(`        Permission: dari jabatan (${data.jabatanLabel})\n`);

    return karyawan;
  }

  // ===== CREATE KARYAWAN =====
  await createKaryawan({
    nik: 'HRD001',
    nama: 'Sarah Anderson',
    username: 'sarah.anderson',
    tempatLahir: 'Jakarta',
    tanggalLahir: new Date('1985-03-15'),
    jenisKelamin: 'P',
    statusPernikahan: 'menikah',
    agama: 'Islam',
    noHpPribadi: '081234567890',
    email: 'sarah.anderson@logistics.com',
    idJabatan: hrManagerJabatan.idJabatan,
    tanggalMasuk: new Date('2020-01-01'),
    jabatanLabel: 'HR Manager',
  });

  await createKaryawan({
    nik: 'OPS001',
    nama: 'Michael Chen',
    username: 'michael.chen',
    tempatLahir: 'Surabaya',
    tanggalLahir: new Date('1982-07-20'),
    jenisKelamin: 'L',
    statusPernikahan: 'menikah',
    agama: 'Buddha',
    noHpPribadi: '081298765432',
    email: 'michael.chen@logistics.com',
    idJabatan: opsManagerJabatan.idJabatan,
    tanggalMasuk: new Date('2018-03-01'),
    jabatanLabel: 'Operations Manager',
  });

  await createKaryawan({
    nik: 'DRV001',
    nama: 'Budi Santoso',
    username: 'budi.santoso',
    tempatLahir: 'Bandung',
    tanggalLahir: new Date('1990-05-10'),
    jenisKelamin: 'L',
    statusPernikahan: 'menikah',
    agama: 'Islam',
    noHpPribadi: '081234509876',
    email: 'budi.santoso@logistics.com',
    idJabatan: driverJabatan.idJabatan,
    tanggalMasuk: new Date('2021-08-15'),
    jabatanLabel: 'Heavy Truck Driver',
  });

  await createKaryawan({
    nik: 'WH001',
    nama: 'Andi Wijaya',
    username: 'andi.wijaya',
    tempatLahir: 'Semarang',
    tanggalLahir: new Date('1995-11-25'),
    jenisKelamin: 'L',
    statusPernikahan: 'belum_menikah',
    agama: 'Kristen',
    noHpPribadi: '081298760001',
    email: 'andi.wijaya@logistics.com',
    idJabatan: warehouseJabatan.idJabatan,
    tanggalMasuk: new Date('2022-02-10'),
    jabatanLabel: 'Warehouse Staff',
  });

  // ===== SUMMARY =====
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 SAMPLE KARYAWAN SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ✅ Karyawan created:  4 (all with auth credentials)');
  console.log('   ℹ️  Permission:       dari jabatan_permission (bukan role)');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📝 LOGIN CREDENTIALS (Username = Password):');
  console.log('───────────────────────────────────────────────────────────');
  console.log('   1. sarah.anderson  → HR Manager       (Human Resource)');
  console.log('   2. michael.chen    → Operations Manager (Operations)');
  console.log('   3. budi.santoso    → Heavy Truck Driver (Transportation)');
  console.log('   4. andi.wijaya     → Warehouse Staff    (Warehouse)');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// If run directly
if (require.main === module) {
  seedLogisticsKaryawan()
    .catch((e) => {
      console.error('❌ Error seeding karyawan:', e);
      process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
}
