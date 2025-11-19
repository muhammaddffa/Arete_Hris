// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Seed Roles
  console.log('📝 Seeding Roles...');
  const roles = await Promise.all([
    prisma.refRole.upsert({
      where: { namaRole: 'Super Admin' },
      update: {},
      create: {
        namaRole: 'Super Admin',
        deskripsi: 'Super administrator dengan akses penuh ke seluruh sistem',
        level: 1,
      },
    }),
    prisma.refRole.upsert({
      where: { namaRole: 'Admin HRD' },
      update: {},
      create: {
        namaRole: 'Admin HRD',
        deskripsi: 'Administrator HRD yang mengelola data karyawan',
        level: 2,
      },
    }),
    prisma.refRole.upsert({
      where: { namaRole: 'Finance' },
      update: {},
      create: {
        namaRole: 'Finance',
        deskripsi: 'Tim finance yang mengelola gaji dan keuangan',
        level: 2,
      },
    }),
    prisma.refRole.upsert({
      where: { namaRole: 'Manager' },
      update: {},
      create: {
        namaRole: 'Manager',
        deskripsi: 'Manager departemen',
        level: 3,
      },
    }),
    prisma.refRole.upsert({
      where: { namaRole: 'Karyawan' },
      update: {},
      create: {
        namaRole: 'Karyawan',
        deskripsi: 'Karyawan biasa',
        level: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${roles.length} roles`);

  // 2. Seed Permissions
  console.log('📝 Seeding Permissions...');
  const permissions = await Promise.all([
    // User Management
    prisma.refPermission.upsert({
      where: { namaPermission: 'user.create' },
      update: {},
      create: {
        namaPermission: 'user.create',
        deskripsi: 'Membuat user baru',
      },
    }),
    prisma.refPermission.upsert({
      where: { namaPermission: 'user.read' },
      update: {},
      create: {
        namaPermission: 'user.read',
        deskripsi: 'Melihat data user',
      },
    }),
    prisma.refPermission.upsert({
      where: { namaPermission: 'user.update' },
      update: {},
      create: {
        namaPermission: 'user.update',
        deskripsi: 'Mengupdate data user',
      },
    }),
    prisma.refPermission.upsert({
      where: { namaPermission: 'user.delete' },
      update: {},
      create: {
        namaPermission: 'user.delete',
        deskripsi: 'Menghapus user',
      },
    }),

    // Employee Management
    prisma.refPermission.upsert({
      where: { namaPermission: 'employee.create' },
      update: {},
      create: {
        namaPermission: 'employee.create',
        deskripsi: 'Membuat data karyawan',
      },
    }),
    prisma.refPermission.upsert({
      where: { namaPermission: 'employee.read' },
      update: {},
      create: {
        namaPermission: 'employee.read',
        deskripsi: 'Melihat data karyawan',
      },
    }),
    prisma.refPermission.upsert({
      where: { namaPermission: 'employee.update' },
      update: {},
      create: {
        namaPermission: 'employee.update',
        deskripsi: 'Mengupdate data karyawan',
      },
    }),
    prisma.refPermission.upsert({
      where: { namaPermission: 'employee.delete' },
      update: {},
      create: {
        namaPermission: 'employee.delete',
        deskripsi: 'Menghapus data karyawan',
      },
    }),

    // Department Management
    prisma.refPermission.upsert({
      where: { namaPermission: 'department.manage' },
      update: {},
      create: {
        namaPermission: 'department.manage',
        deskripsi: 'Mengelola departemen',
      },
    }),

    // Attendance
    prisma.refPermission.upsert({
      where: { namaPermission: 'attendance.manage' },
      update: {},
      create: {
        namaPermission: 'attendance.manage',
        deskripsi: 'Mengelola absensi',
      },
    }),
    prisma.refPermission.upsert({
      where: { namaPermission: 'attendance.view' },
      update: {},
      create: {
        namaPermission: 'attendance.view',
        deskripsi: 'Melihat absensi',
      },
    }),

    // Payroll
    prisma.refPermission.upsert({
      where: { namaPermission: 'payroll.manage' },
      update: {},
      create: {
        namaPermission: 'payroll.manage',
        deskripsi: 'Mengelola penggajian',
      },
    }),
    prisma.refPermission.upsert({
      where: { namaPermission: 'payroll.view' },
      update: {},
      create: {
        namaPermission: 'payroll.view',
        deskripsi: 'Melihat data gaji',
      },
    }),
  ]);

  console.log(`✅ Created ${permissions.length} permissions`);

  // 3. Assign Permissions to Roles
  console.log('📝 Assigning Permissions to Roles...');

  const superAdmin = roles.find((r) => r.namaRole === 'Super Admin');
  const adminHRD = roles.find((r) => r.namaRole === 'Admin HRD');
  const finance = roles.find((r) => r.namaRole === 'Finance');
  const manager = roles.find((r) => r.namaRole === 'Manager');
  const karyawan = roles.find((r) => r.namaRole === 'Karyawan');

  // Super Admin - All permissions
  if (superAdmin) {
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          idRole_idPermission: {
            idRole: superAdmin.idRole,
            idPermission: permission.idPermission,
          },
        },
        update: {},
        create: {
          idRole: superAdmin.idRole,
          idPermission: permission.idPermission,
        },
      });
    }
    console.log(`✅ Assigned all permissions to Super Admin`);
  }

  // Admin HRD - User & Employee management
  if (adminHRD) {
    const hrdPermissions = permissions.filter((p) =>
      ['user.', 'employee.', 'department.', 'attendance.'].some((prefix) =>
        p.namaPermission.startsWith(prefix),
      ),
    );
    for (const permission of hrdPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          idRole_idPermission: {
            idRole: adminHRD.idRole,
            idPermission: permission.idPermission,
          },
        },
        update: {},
        create: {
          idRole: adminHRD.idRole,
          idPermission: permission.idPermission,
        },
      });
    }
    console.log(
      `✅ Assigned ${hrdPermissions.length} permissions to Admin HRD`,
    );
  }

  // Finance - Payroll management
  if (finance) {
    const financePermissions = permissions.filter((p) =>
      p.namaPermission.startsWith('payroll.'),
    );
    for (const permission of financePermissions) {
      await prisma.rolePermission.upsert({
        where: {
          idRole_idPermission: {
            idRole: finance.idRole,
            idPermission: permission.idPermission,
          },
        },
        update: {},
        create: {
          idRole: finance.idRole,
          idPermission: permission.idPermission,
        },
      });
    }
    console.log(
      `✅ Assigned ${financePermissions.length} permissions to Finance`,
    );
  }

  // Manager - View permissions
  if (manager) {
    const managerPermissions = permissions.filter(
      (p) =>
        p.namaPermission.includes('.read') ||
        p.namaPermission.includes('.view'),
    );
    for (const permission of managerPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          idRole_idPermission: {
            idRole: manager.idRole,
            idPermission: permission.idPermission,
          },
        },
        update: {},
        create: {
          idRole: manager.idRole,
          idPermission: permission.idPermission,
        },
      });
    }
    console.log(
      `✅ Assigned ${managerPermissions.length} permissions to Manager`,
    );
  }

  // Karyawan - Basic view permissions
  if (karyawan) {
    const karyawanPermissions = permissions.filter((p) =>
      ['attendance.view', 'payroll.view'].includes(p.namaPermission),
    );
    for (const permission of karyawanPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          idRole_idPermission: {
            idRole: karyawan.idRole,
            idPermission: permission.idPermission,
          },
        },
        update: {},
        create: {
          idRole: karyawan.idRole,
          idPermission: permission.idPermission,
        },
      });
    }
    console.log(
      `✅ Assigned ${karyawanPermissions.length} permissions to Karyawan`,
    );
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
