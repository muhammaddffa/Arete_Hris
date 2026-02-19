import { PrismaClient, RefDepartemen } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedLogisticsDepartments() {
  console.log('🏢 Creating Logistics Company Departments & Positions...\n');

  // ===== CREATE DEPARTMENTS =====
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

  console.log(`✅ Departments created: ${departments.length}`);

  // Helper cari departemen
  const getDept = (nama: string) => {
    const d = departments.find((d) => d.namaDepartemen === nama);
    if (!d) throw new Error(`Departemen tidak ditemukan: ${nama}`);
    return d.idDepartemen;
  };

  // ===== CREATE JABATAN =====
  // Catatan: tidak ada idRoleDefault — permission diatur via jabatan_permission
  console.log('\n💼 Creating Positions (Jabatan)...\n');

  const jabatan = await prisma.$transaction([
    // Human Resource
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'HR Manager',
          idDepartemen: getDept('Human Resource'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'HR Manager',
        idDepartemen: getDept('Human Resource'),
        deskripsiJabatan: 'Lead HR operations and team',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'HR Specialist',
          idDepartemen: getDept('Human Resource'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'HR Specialist',
        idDepartemen: getDept('Human Resource'),
        deskripsiJabatan: 'Handle recruitment and employee relations',
        status: true,
      },
    }),

    // Information Technology
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'IT Manager',
          idDepartemen: getDept('Information Technology'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'IT Manager',
        idDepartemen: getDept('Information Technology'),
        deskripsiJabatan: 'Manage IT infrastructure and system development',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'System Administrator',
          idDepartemen: getDept('Information Technology'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'System Administrator',
        idDepartemen: getDept('Information Technology'),
        deskripsiJabatan: 'Maintain servers, networks, and IT systems',
        status: true,
      },
    }),

    // Finance & Accounting
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Finance Manager',
          idDepartemen: getDept('Finance & Accounting'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Finance Manager',
        idDepartemen: getDept('Finance & Accounting'),
        deskripsiJabatan: 'Lead financial planning and accounting operations',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Accountant',
          idDepartemen: getDept('Finance & Accounting'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Accountant',
        idDepartemen: getDept('Finance & Accounting'),
        deskripsiJabatan: 'Handle bookkeeping and financial reporting',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Payroll Staff',
          idDepartemen: getDept('Finance & Accounting'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Payroll Staff',
        idDepartemen: getDept('Finance & Accounting'),
        deskripsiJabatan: 'Process employee payroll and benefits',
        status: true,
      },
    }),

    // Operations
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Operations Director',
          idDepartemen: getDept('Operations'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Operations Director',
        idDepartemen: getDept('Operations'),
        deskripsiJabatan: 'Oversee all logistics operations',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Operations Manager',
          idDepartemen: getDept('Operations'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Operations Manager',
        idDepartemen: getDept('Operations'),
        deskripsiJabatan: 'Manage daily logistics operations',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Operations Coordinator',
          idDepartemen: getDept('Operations'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Operations Coordinator',
        idDepartemen: getDept('Operations'),
        deskripsiJabatan: 'Coordinate between departments',
        status: true,
      },
    }),

    // Warehouse
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Warehouse Manager',
          idDepartemen: getDept('Warehouse'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Warehouse Manager',
        idDepartemen: getDept('Warehouse'),
        deskripsiJabatan: 'Manage warehouse operations and inventory',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Warehouse Supervisor',
          idDepartemen: getDept('Warehouse'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Warehouse Supervisor',
        idDepartemen: getDept('Warehouse'),
        deskripsiJabatan: 'Supervise warehouse staff and operations',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Warehouse Staff',
          idDepartemen: getDept('Warehouse'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Warehouse Staff',
        idDepartemen: getDept('Warehouse'),
        deskripsiJabatan: 'Handle loading, unloading, and inventory',
        status: true,
      },
    }),

    // Transportation
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Fleet Manager',
          idDepartemen: getDept('Transportation'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Fleet Manager',
        idDepartemen: getDept('Transportation'),
        deskripsiJabatan: 'Manage vehicle fleet and maintenance',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Transportation Supervisor',
          idDepartemen: getDept('Transportation'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Transportation Supervisor',
        idDepartemen: getDept('Transportation'),
        deskripsiJabatan: 'Supervise drivers and delivery routes',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Heavy Truck Driver',
          idDepartemen: getDept('Transportation'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Heavy Truck Driver',
        idDepartemen: getDept('Transportation'),
        deskripsiJabatan: 'Drive heavy trucks for cargo delivery',
        status: true,
      },
    }),

    // Distribution
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Distribution Manager',
          idDepartemen: getDept('Distribution'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Distribution Manager',
        idDepartemen: getDept('Distribution'),
        deskripsiJabatan: 'Plan and manage distribution network',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Distribution Supervisor',
          idDepartemen: getDept('Distribution'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Distribution Supervisor',
        idDepartemen: getDept('Distribution'),
        deskripsiJabatan: 'Supervise distribution team and routes',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Route Planner',
          idDepartemen: getDept('Distribution'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Route Planner',
        idDepartemen: getDept('Distribution'),
        deskripsiJabatan: 'Plan optimal delivery routes',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Dispatcher',
          idDepartemen: getDept('Distribution'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Dispatcher',
        idDepartemen: getDept('Distribution'),
        deskripsiJabatan: 'Dispatch drivers and coordinate deliveries',
        status: true,
      },
    }),

    // Customer Service
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'CS Manager',
          idDepartemen: getDept('Customer Service'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'CS Manager',
        idDepartemen: getDept('Customer Service'),
        deskripsiJabatan: 'Manage customer service operations',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Customer Service Officer',
          idDepartemen: getDept('Customer Service'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Customer Service Officer',
        idDepartemen: getDept('Customer Service'),
        deskripsiJabatan: 'Handle customer inquiries and complaints',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Call Center Agent',
          idDepartemen: getDept('Customer Service'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Call Center Agent',
        idDepartemen: getDept('Customer Service'),
        deskripsiJabatan: 'Answer customer calls and provide support',
        status: true,
      },
    }),

    // Sales & Marketing
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Sales Manager',
          idDepartemen: getDept('Sales & Marketing'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Sales Manager',
        idDepartemen: getDept('Sales & Marketing'),
        deskripsiJabatan: 'Lead sales team and achieve targets',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Sales Executive',
          idDepartemen: getDept('Sales & Marketing'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Sales Executive',
        idDepartemen: getDept('Sales & Marketing'),
        deskripsiJabatan: 'Acquire new clients and maintain relationships',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Marketing Staff',
          idDepartemen: getDept('Sales & Marketing'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Marketing Staff',
        idDepartemen: getDept('Sales & Marketing'),
        deskripsiJabatan: 'Execute marketing campaigns and promotions',
        status: true,
      },
    }),

    // Procurement
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Procurement Manager',
          idDepartemen: getDept('Procurement'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Procurement Manager',
        idDepartemen: getDept('Procurement'),
        deskripsiJabatan: 'Manage procurement of vehicles and supplies',
        status: true,
      },
    }),
    prisma.refJabatan.upsert({
      where: {
        namaJabatan_idDepartemen: {
          namaJabatan: 'Procurement Staff',
          idDepartemen: getDept('Procurement'),
        },
      },
      update: {},
      create: {
        namaJabatan: 'Procurement Staff',
        idDepartemen: getDept('Procurement'),
        deskripsiJabatan: 'Handle purchasing and vendor relations',
        status: true,
      },
    }),
  ]);

  console.log(`✅ Positions (jabatan) created: ${jabatan.length}`);
  console.log('\n📋 Positions by Department:');

  for (const dept of departments) {
    const deptJabatan = jabatan.filter(
      (j) => j.idDepartemen === dept.idDepartemen,
    );
    if (deptJabatan.length > 0) {
      console.log(`\n   ${dept.namaDepartemen}:`);
      deptJabatan.forEach((j) => console.log(`      - ${j.namaJabatan}`));
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
    .finally(async () => await prisma.$disconnect());
}
