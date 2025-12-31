/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// prisma/seeders/departments.seeder.ts
import { PrismaClient, RefRole, RefDepartemen } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedLogisticsDepartments() {
  console.log('🏢 Creating Logistics Company Departments & Positions...\n');

  // Get roles untuk assignment ke jabatan
  const roles: RefRole[] = await prisma.refRole.findMany();

  const getRole = (namaRole: string) => {
    const role = roles.find((r) => r.namaRole === namaRole);
    if (!role) throw new Error(`Role not found: ${namaRole}`);
    return role;
  };

  const hrdRole = roles.find((r) => r.namaRole === 'HRD');
  const adminRole = roles.find((r) => r.namaRole === 'Admin');
  const financeRole = roles.find((r) => r.namaRole === 'Finance');
  const opsManagerRole = roles.find((r) => r.namaRole === 'Operations Manager');
  const supervisorRole = roles.find((r) => r.namaRole === 'Supervisor');
  const driverRole = roles.find((r) => r.namaRole === 'Driver');
  const warehouseRole = roles.find((r) => r.namaRole === 'Warehouse Staff');
  const karyawanRole = roles.find((r) => r.namaRole === 'Karyawan');

  if (
    !hrdRole ||
    !adminRole ||
    !financeRole ||
    !opsManagerRole ||
    !supervisorRole ||
    !driverRole ||
    !warehouseRole ||
    !karyawanRole
  ) {
    throw new Error('Required roles not found');
  }

  // ===== CREATE DEPARTMENTS (NO ROLE DEFAULT) =====
  const departments: RefDepartemen[] = await prisma.$transaction([
    prisma.refDepartemen.upsert({
      where: { namaDepartemen: 'Human Resource' },
      update: {},
      create: {
        namaDepartemen: 'Human Resource',
        deskripsi: 'Manage recruitment, employee relations, and HR operations',
      },
    }),
    prisma.refDepartemen.upsert({
      where: { namaDepartemen: 'Information Technology' },
      update: {},
      create: {
        namaDepartemen: 'Information Technology',
        deskripsi: 'System development, maintenance, and IT infrastructure',
      },
    }),
    prisma.refDepartemen.upsert({
      where: { namaDepartemen: 'Finance & Accounting' },
      update: {},
      create: {
        namaDepartemen: 'Finance & Accounting',
        deskripsi: 'Financial management, accounting, and payroll processing',
      },
    }),

    prisma.refDepartemen.upsert({
      where: { namaDepartemen: 'Operations' },
      update: {},
      create: {
        namaDepartemen: 'Operations',
        deskripsi: 'Overall logistics operations and coordination',
      },
    }),
    prisma.refDepartemen.upsert({
      where: { namaDepartemen: 'Warehouse' },
      update: {},
      create: {
        namaDepartemen: 'Warehouse',
        deskripsi: 'Warehouse management, inventory, and storage operations',
      },
    }),
    prisma.refDepartemen.upsert({
      where: { namaDepartemen: 'Transportation' },
      update: {},
      create: {
        namaDepartemen: 'Transportation',
        deskripsi: 'Fleet management and delivery operations',
      },
    }),
    prisma.refDepartemen.upsert({
      where: { namaDepartemen: 'Distribution' },
      update: {},
      create: {
        namaDepartemen: 'Distribution',
        deskripsi: 'Distribution planning and last-mile delivery',
      },
    }),

    prisma.refDepartemen.upsert({
      where: { namaDepartemen: 'Customer Service' },
      update: {},
      create: {
        namaDepartemen: 'Customer Service',
        deskripsi: 'Customer support and complaint handling',
      },
    }),
    prisma.refDepartemen.upsert({
      where: { namaDepartemen: 'Sales & Marketing' },
      update: {},
      create: {
        namaDepartemen: 'Sales & Marketing',
        deskripsi: 'Business development and marketing activities',
      },
    }),
    prisma.refDepartemen.upsert({
      where: { namaDepartemen: 'Procurement' },
      update: {},
      create: {
        namaDepartemen: 'Procurement',
        deskripsi: 'Procurement of vehicles, equipment, and supplies',
      },
    }),
  ]);

  console.log('✅ Departments created:', departments.length);
  console.log('\n📋 Department Details:');
  console.log(
    '┌──────────────────────────────┬─────────────────────────────────────┐',
  );
  console.log(
    '│ Department Name              │ Description                         │',
  );
  console.log(
    '├──────────────────────────────┼─────────────────────────────────────┤',
  );
  departments.forEach((dept) => {
    const desc = dept.deskripsi?.substring(0, 35) || '';
    console.log(`│ ${dept.namaDepartemen.padEnd(28)} │ ${desc.padEnd(35)} │`);
  });
  console.log(
    '└──────────────────────────────┴─────────────────────────────────────┘\n',
  );

  // ===== CREATE JABATAN (POSITIONS) WITH ROLE =====
  console.log('💼 Creating Positions (Jabatan) with Role Assignments...\n');

  const hrDept = departments.find((d) => d.namaDepartemen === 'Human Resource');
  const itDept = departments.find(
    (d) => d.namaDepartemen === 'Information Technology',
  );
  const financeDept = departments.find(
    (d) => d.namaDepartemen === 'Finance & Accounting',
  );
  const opsDept = departments.find((d) => d.namaDepartemen === 'Operations');
  const warehouseDept = departments.find(
    (d) => d.namaDepartemen === 'Warehouse',
  );
  const transportDept = departments.find(
    (d) => d.namaDepartemen === 'Transportation',
  );
  const distributionDept = departments.find(
    (d) => d.namaDepartemen === 'Distribution',
  );
  const csDept = departments.find(
    (d) => d.namaDepartemen === 'Customer Service',
  );
  const salesDept = departments.find(
    (d) => d.namaDepartemen === 'Sales & Marketing',
  );
  const procurementDept = departments.find(
    (d) => d.namaDepartemen === 'Procurement',
  );

  const jabatan = await prisma.$transaction([
    // HR Department - HRD Role
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'HR Manager',
        idDepartemen: hrDept!.idDepartemen,
        idRoleDefault: getRole('HRD').idRole, // ✅ Match
        deskripsiJabatan: 'Lead HR operations...',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'HR Specialist',
        idDepartemen: hrDept!.idDepartemen,
        idRoleDefault: getRole('HRD').idRole, // ✅ Match
        deskripsiJabatan: 'Handle recruitment...',
        status: true,
      },
    }),
    // IT Department - Admin Role
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'IT Manager',
        idDepartemen: itDept!.idDepartemen,
        idRoleDefault: adminRole.idRole,
        deskripsiJabatan: 'Manage IT infrastructure and system development',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'System Administrator',
        idDepartemen: itDept!.idDepartemen,
        idRoleDefault: adminRole.idRole,
        deskripsiJabatan: 'Maintain servers, networks, and IT systems',
        status: true,
      },
    }),

    // Finance Department - Finance Role
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Finance Manager',
        idDepartemen: financeDept!.idDepartemen,
        idRoleDefault: financeRole.idRole,
        deskripsiJabatan: 'Lead financial planning and accounting operations',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Accountant',
        idDepartemen: financeDept!.idDepartemen,
        idRoleDefault: financeRole.idRole,
        deskripsiJabatan: 'Handle bookkeeping and financial reporting',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Payroll Staff',
        idDepartemen: financeDept!.idDepartemen,
        idRoleDefault: karyawanRole.idRole,
        deskripsiJabatan: 'Process employee payroll and benefits',
        status: true,
      },
    }),

    // Operations Department - Operations Manager Role
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Operations Director',
        idDepartemen: opsDept!.idDepartemen,
        idRoleDefault: getRole('Operations Manager').idRole, // ✅ Match
        deskripsiJabatan: 'Oversee all logistics operations',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Operations Manager',
        idDepartemen: opsDept!.idDepartemen,
        idRoleDefault: getRole('Operations Manager').idRole, // ✅ Match
        deskripsiJabatan: 'Manage daily logistics operations',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Operations Coordinator',
        idDepartemen: opsDept!.idDepartemen,
        idRoleDefault: getRole('Operations Coordinator').idRole, // ✅ BARU! Match
        deskripsiJabatan: 'Coordinate between departments',
        status: true,
      },
    }),

    // Warehouse Department - Supervisor & Warehouse Staff Role
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Warehouse Manager',
        idDepartemen: warehouseDept!.idDepartemen,
        idRoleDefault: getRole('Warehouse Manager').idRole, // ✅ BARU! Match
        deskripsiJabatan: 'Manage warehouse operations and inventory',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Warehouse Supervisor',
        idDepartemen: warehouseDept!.idDepartemen,
        idRoleDefault: getRole('Warehouse Supervisor').idRole, // ✅ BARU! Match
        deskripsiJabatan: 'Supervise warehouse staff',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Warehouse Staff',
        idDepartemen: warehouseDept!.idDepartemen,
        idRoleDefault: getRole('Warehouse Staff').idRole, // ✅ Match
        deskripsiJabatan: 'Handle loading, unloading',
        status: true,
      },
    }),

    // Transportation Department - Supervisor & Driver Role
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Fleet Manager',
        idDepartemen: transportDept!.idDepartemen,
        idRoleDefault: getRole('Fleet Manager').idRole, // ✅ BARU! Match
        deskripsiJabatan: 'Manage vehicle fleet and maintenance',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Transportation Supervisor',
        idDepartemen: transportDept!.idDepartemen,
        idRoleDefault: getRole('Transportation Supervisor').idRole, // ✅ BARU! Match
        deskripsiJabatan: 'Supervise drivers and delivery routes',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Heavy Truck Driver',
        idDepartemen: transportDept!.idDepartemen,
        idRoleDefault: getRole('Driver').idRole, // ✅ Match (generic untuk semua driver)
        deskripsiJabatan: 'Drive heavy trucks',
        status: true,
      },
    }),

    // Distribution Department - Supervisor & Karyawan Role
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Distribution Manager',
        idDepartemen: distributionDept!.idDepartemen,
        idRoleDefault: supervisorRole.idRole,
        deskripsiJabatan: 'Plan and manage distribution network',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Distribution Supervisor',
        idDepartemen: distributionDept!.idDepartemen,
        idRoleDefault: supervisorRole.idRole,
        deskripsiJabatan: 'Supervise distribution team and routes',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Route Planner',
        idDepartemen: distributionDept!.idDepartemen,
        idRoleDefault: karyawanRole.idRole,
        deskripsiJabatan: 'Plan optimal delivery routes',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Dispatcher',
        idDepartemen: distributionDept!.idDepartemen,
        idRoleDefault: karyawanRole.idRole,
        deskripsiJabatan: 'Dispatch drivers and coordinate deliveries',
        status: true,
      },
    }),

    // Customer Service - Karyawan Role
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'CS Manager',
        idDepartemen: csDept!.idDepartemen,
        idRoleDefault: supervisorRole.idRole,
        deskripsiJabatan: 'Manage customer service operations',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Customer Service Officer',
        idDepartemen: csDept!.idDepartemen,
        idRoleDefault: karyawanRole.idRole,
        deskripsiJabatan: 'Handle customer inquiries and complaints',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Call Center Agent',
        idDepartemen: csDept!.idDepartemen,
        idRoleDefault: karyawanRole.idRole,
        deskripsiJabatan: 'Answer customer calls and provide support',
        status: true,
      },
    }),

    // Sales & Marketing - Karyawan Role
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Sales Manager',
        idDepartemen: salesDept!.idDepartemen,
        idRoleDefault: supervisorRole.idRole,
        deskripsiJabatan: 'Lead sales team and achieve targets',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Sales Executive',
        idDepartemen: salesDept!.idDepartemen,
        idRoleDefault: karyawanRole.idRole,
        deskripsiJabatan: 'Acquire new clients and maintain relationships',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Marketing Staff',
        idDepartemen: salesDept!.idDepartemen,
        idRoleDefault: karyawanRole.idRole,
        deskripsiJabatan: 'Execute marketing campaigns and promotions',
        status: true,
      },
    }),

    // Procurement - Karyawan Role
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Procurement Manager',
        idDepartemen: procurementDept!.idDepartemen,
        idRoleDefault: supervisorRole.idRole,
        deskripsiJabatan: 'Manage procurement of vehicles and supplies',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Procurement Staff',
        idDepartemen: procurementDept!.idDepartemen,
        idRoleDefault: karyawanRole.idRole,
        deskripsiJabatan: 'Handle purchasing and vendor relations',
        status: true,
      },
    }),
  ]);

  console.log('✅ Positions created:', jabatan.length);

  // Group by department and role
  const jabatanByDept = departments
    .map((dept) => ({
      dept: dept.namaDepartemen,
      positions: jabatan.filter((j) => j.idDepartemen === dept.idDepartemen),
    }))
    .filter((item) => item.positions.length > 0);

  console.log('\n📋 Positions by Department (with Role Assignment):');
  for (const item of jabatanByDept) {
    console.log(`\n   ${item.dept}:`);
    for (const pos of item.positions) {
      const role = roles.find((r) => r.idRole === pos.idRoleDefault);
      console.log(
        `      - ${pos.namaJabatan.padEnd(30)} → Role: ${role?.namaRole}`,
      );
    }
  }

  console.log(
    '\n═══════════════════════════════════════════════════════════\n',
  );
}

// If run directly
if (require.main === module) {
  seedLogisticsDepartments()
    .catch((e) => {
      console.error('❌ Error seeding departments:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
