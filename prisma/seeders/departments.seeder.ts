// prisma/seeders/departments-logistics.seeder.ts
import { PrismaClient, RefRole, RefDepartemen } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedLogisticsDepartments() {
  console.log('🏢 Creating Logistics Company Departments & Positions...\n');

  // Get roles
  const roles: RefRole[] = await prisma.refRole.findMany();

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

  // ===== CREATE DEPARTMENTS =====
  const departments: RefDepartemen[] = await prisma.$transaction([
    // Core Management
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Human Resource',
        idRoleDefault: hrdRole.idRole,
        deskripsi: 'Manage recruitment, employee relations, and HR operations',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Information Technology',
        idRoleDefault: adminRole.idRole,
        deskripsi: 'System development, maintenance, and IT infrastructure',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Finance & Accounting',
        idRoleDefault: financeRole.idRole,
        deskripsi: 'Financial management, accounting, and payroll processing',
      },
    }),

    // Operations - Core Logistics
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Operations',
        idRoleDefault: opsManagerRole.idRole,
        deskripsi: 'Overall logistics operations and coordination',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Warehouse',
        idRoleDefault: supervisorRole.idRole,
        deskripsi: 'Warehouse management, inventory, and storage operations',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Transportation',
        idRoleDefault: supervisorRole.idRole,
        deskripsi: 'Fleet management and delivery operations',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Distribution',
        idRoleDefault: supervisorRole.idRole,
        deskripsi: 'Distribution planning and last-mile delivery',
      },
    }),

    // Support Departments
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Customer Service',
        idRoleDefault: karyawanRole.idRole,
        deskripsi: 'Customer support and complaint handling',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Sales & Marketing',
        idRoleDefault: karyawanRole.idRole,
        deskripsi: 'Business development and marketing activities',
      },
    }),
    prisma.refDepartemen.create({
      data: {
        namaDepartemen: 'Procurement',
        idRoleDefault: karyawanRole.idRole,
        deskripsi: 'Procurement of vehicles, equipment, and supplies',
      },
    }),
  ]);

  console.log('✅ Departments created:', departments.length);
  console.log('\n📋 Department Details:');
  console.log(
    '┌──────────────────────────────┬────────────────────┬─────────────┐',
  );
  console.log(
    '│ Department Name              │ Default Role       │ Level       │',
  );
  console.log(
    '├──────────────────────────────┼────────────────────┼─────────────┤',
  );
  departments.forEach((dept) => {
    const role = roles.find((r) => r.idRole === dept.idRoleDefault);
    console.log(
      `│ ${dept.namaDepartemen.padEnd(28)} │ ${role?.namaRole.padEnd(18)} │ Level ${role?.level}     │`,
    );
  });
  console.log(
    '└──────────────────────────────┴────────────────────┴─────────────┘\n',
  );

  // ===== CREATE JABATAN (POSITIONS) =====
  console.log('💼 Creating Positions (Jabatan)...\n');

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
    // HR Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'HR Manager',
        idDepartemen: hrDept!.idDepartemen,
        deskripsiJabatan:
          'Lead HR operations, recruitment, and employee development',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'HR Specialist',
        idDepartemen: hrDept!.idDepartemen,
        deskripsiJabatan:
          'Handle recruitment, employee relations, and HR administration',
        status: true,
      },
    }),

    // IT Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'IT Manager',
        idDepartemen: itDept!.idDepartemen,
        deskripsiJabatan: 'Manage IT infrastructure and system development',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'System Administrator',
        idDepartemen: itDept!.idDepartemen,
        deskripsiJabatan: 'Maintain servers, networks, and IT systems',
        status: true,
      },
    }),

    // Finance Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Finance Manager',
        idDepartemen: financeDept!.idDepartemen,
        deskripsiJabatan: 'Lead financial planning and accounting operations',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Accountant',
        idDepartemen: financeDept!.idDepartemen,
        deskripsiJabatan: 'Handle bookkeeping and financial reporting',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Payroll Staff',
        idDepartemen: financeDept!.idDepartemen,
        deskripsiJabatan: 'Process employee payroll and benefits',
        status: true,
      },
    }),

    // Operations Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Operations Director',
        idDepartemen: opsDept!.idDepartemen,
        deskripsiJabatan: 'Oversee all logistics operations',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Operations Manager',
        idDepartemen: opsDept!.idDepartemen,
        deskripsiJabatan: 'Manage daily logistics operations and coordination',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Operations Coordinator',
        idDepartemen: opsDept!.idDepartemen,
        deskripsiJabatan:
          'Coordinate between departments for smooth operations',
        status: true,
      },
    }),

    // Warehouse Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Warehouse Manager',
        idDepartemen: warehouseDept!.idDepartemen,
        deskripsiJabatan: 'Manage warehouse operations and inventory',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Warehouse Supervisor',
        idDepartemen: warehouseDept!.idDepartemen,
        deskripsiJabatan: 'Supervise warehouse staff and daily activities',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Warehouse Staff',
        idDepartemen: warehouseDept!.idDepartemen,
        deskripsiJabatan: 'Handle loading, unloading, and inventory management',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Forklift Operator',
        idDepartemen: warehouseDept!.idDepartemen,
        deskripsiJabatan: 'Operate forklift for moving goods',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Inventory Controller',
        idDepartemen: warehouseDept!.idDepartemen,
        deskripsiJabatan: 'Monitor and control warehouse inventory',
        status: true,
      },
    }),

    // Transportation Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Fleet Manager',
        idDepartemen: transportDept!.idDepartemen,
        deskripsiJabatan: 'Manage vehicle fleet and maintenance',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Transportation Supervisor',
        idDepartemen: transportDept!.idDepartemen,
        deskripsiJabatan: 'Supervise drivers and delivery routes',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Heavy Truck Driver',
        idDepartemen: transportDept!.idDepartemen,
        deskripsiJabatan: 'Drive heavy trucks for long-distance delivery',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Light Truck Driver',
        idDepartemen: transportDept!.idDepartemen,
        deskripsiJabatan: 'Drive light trucks for local delivery',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Courier',
        idDepartemen: transportDept!.idDepartemen,
        deskripsiJabatan: 'Deliver packages using motorcycle or van',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Vehicle Mechanic',
        idDepartemen: transportDept!.idDepartemen,
        deskripsiJabatan: 'Maintain and repair company vehicles',
        status: true,
      },
    }),

    // Distribution Department
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Distribution Manager',
        idDepartemen: distributionDept!.idDepartemen,
        deskripsiJabatan: 'Plan and manage distribution network',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Distribution Supervisor',
        idDepartemen: distributionDept!.idDepartemen,
        deskripsiJabatan: 'Supervise distribution team and routes',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Route Planner',
        idDepartemen: distributionDept!.idDepartemen,
        deskripsiJabatan: 'Plan optimal delivery routes',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Dispatcher',
        idDepartemen: distributionDept!.idDepartemen,
        deskripsiJabatan: 'Dispatch drivers and coordinate deliveries',
        status: true,
      },
    }),

    // Customer Service
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'CS Manager',
        idDepartemen: csDept!.idDepartemen,
        deskripsiJabatan: 'Manage customer service operations',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Customer Service Officer',
        idDepartemen: csDept!.idDepartemen,
        deskripsiJabatan: 'Handle customer inquiries and complaints',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Call Center Agent',
        idDepartemen: csDept!.idDepartemen,
        deskripsiJabatan: 'Answer customer calls and provide support',
        status: true,
      },
    }),

    // Sales & Marketing
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Sales Manager',
        idDepartemen: salesDept!.idDepartemen,
        deskripsiJabatan: 'Lead sales team and achieve targets',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Sales Executive',
        idDepartemen: salesDept!.idDepartemen,
        deskripsiJabatan: 'Acquire new clients and maintain relationships',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Marketing Staff',
        idDepartemen: salesDept!.idDepartemen,
        deskripsiJabatan: 'Execute marketing campaigns and promotions',
        status: true,
      },
    }),

    // Procurement
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Procurement Manager',
        idDepartemen: procurementDept!.idDepartemen,
        deskripsiJabatan: 'Manage procurement of vehicles and supplies',
        status: true,
      },
    }),
    prisma.refJabatan.create({
      data: {
        namaJabatan: 'Procurement Staff',
        idDepartemen: procurementDept!.idDepartemen,
        deskripsiJabatan: 'Handle purchasing and vendor relations',
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
}
