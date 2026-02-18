import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// Bitmask constants — READ=1, CREATE=2, UPDATE=4, DELETE=8
// ============================================================
const P = {
  READ: 1, // 0001
  CREATE: 2, // 0010
  UPDATE: 4, // 0100
  DELETE: 8, // 1000
  READ_CREATE: 1 | 2, // 3  — read + create
  READ_WRITE: 1 | 2 | 4, // 7  — read + create + update
  FULL: 1 | 2 | 4 | 8, // 15 — semua akses
} as const;

// ============================================================
// Helper: assign permissions ke jabatan
// ============================================================
async function assignJabatanPermissions(
  namaJabatan: string,
  idDepartemen: string,
  permissions: { namaPermission: string; levelAkses: number }[],
) {
  const jabatan = await prisma.refJabatan.findFirst({
    where: { namaJabatan, idDepartemen },
  });

  if (!jabatan) {
    console.warn(`   ⚠️  Jabatan tidak ditemukan: ${namaJabatan}`);
    return 0;
  }

  const allPermissions = await prisma.refPermission.findMany({
    where: { namaPermission: { in: permissions.map((p) => p.namaPermission) } },
  });

  const permMap = new Map(
    allPermissions.map((p) => [p.namaPermission, p.idPermission]),
  );

  let count = 0;
  for (const { namaPermission, levelAkses } of permissions) {
    const idPermission = permMap.get(namaPermission);
    if (!idPermission) {
      console.warn(`      ⚠️  Permission tidak ditemukan: ${namaPermission}`);
      continue;
    }
    await prisma.jabatanPermission.upsert({
      where: {
        idJabatan_idPermission: { idJabatan: jabatan.idJabatan, idPermission },
      },
      update: { levelAkses },
      create: { idJabatan: jabatan.idJabatan, idPermission, levelAkses },
    });
    count++;
  }

  console.log(`   ✅ ${namaJabatan.padEnd(30)} → ${count} permissions`);
  return count;
}

export async function seedJabatanPermissions() {
  console.log('🔐 Seeding Jabatan Permissions (Refactored)...\n');

  // ============================================================
  // Permission sets yang sering dipakai (reusable)
  // ============================================================

  // Semua karyawan: lihat profil sendiri + presensi + ajukan izin/lembur
  const basic = [
    { namaPermission: 'manage_karyawan', levelAkses: P.READ }, // read daftar karyawan
    { namaPermission: 'own_profile', levelAkses: P.READ_CREATE }, // update profil sendiri
    { namaPermission: 'own_presensi', levelAkses: P.READ_CREATE }, // clock in/out
    { namaPermission: 'submit_izin', levelAkses: P.READ_CREATE }, // ajukan izin
    { namaPermission: 'submit_lembur', levelAkses: P.READ_CREATE }, // ajukan lembur
    { namaPermission: 'answer_form', levelAkses: P.READ_CREATE }, // isi form/survey
  ];

  // Manager/supervisor: approval + view semua + report
  const approval = [
    { namaPermission: 'view_all_presensi', levelAkses: P.READ },
    { namaPermission: 'view_all_izin', levelAkses: P.READ },
    { namaPermission: 'approve_izin', levelAkses: P.CREATE }, // approve = CREATE action
    { namaPermission: 'view_all_lembur', levelAkses: P.READ },
    { namaPermission: 'approve_lembur', levelAkses: P.CREATE },
    { namaPermission: 'view_reports', levelAkses: P.READ },
  ];

  // ============================================================
  // Ambil semua departemen sekali
  // ============================================================
  const depts = await prisma.refDepartemen.findMany();
  const dept = (nama: string) => {
    const d = depts.find((d) => d.namaDepartemen === nama);
    if (!d) throw new Error(`Departemen tidak ditemukan: ${nama}`);
    return d.idDepartemen;
  };

  // ==========================================
  // HUMAN RESOURCE
  // ==========================================
  console.log('📂 Human Resource:');

  await assignJabatanPermissions('HR Manager', dept('Human Resource'), [
    ...basic,
    { namaPermission: 'manage_karyawan', levelAkses: P.FULL }, // CRUD karyawan
    { namaPermission: 'approve_candidate', levelAkses: P.CREATE },
    { namaPermission: 'reject_candidate', levelAkses: P.CREATE },
    { namaPermission: 'resign_karyawan', levelAkses: P.CREATE },
    { namaPermission: 'reset_password', levelAkses: P.CREATE },
    { namaPermission: 'toggle_user_status', levelAkses: P.CREATE },
    { namaPermission: 'manage_permission', levelAkses: P.READ_WRITE },
    { namaPermission: 'view_audit_log', levelAkses: P.READ },
    { namaPermission: 'manage_department', levelAkses: P.FULL },
    { namaPermission: 'manage_jabatan', levelAkses: P.FULL },
    { namaPermission: 'view_all_presensi', levelAkses: P.READ },
    { namaPermission: 'manage_presensi', levelAkses: P.FULL },
    { namaPermission: 'manage_jadwal_kerja', levelAkses: P.FULL },
    { namaPermission: 'assign_jadwal', levelAkses: P.CREATE },
    { namaPermission: 'view_all_izin', levelAkses: P.READ },
    { namaPermission: 'approve_izin', levelAkses: P.CREATE },
    { namaPermission: 'manage_izin', levelAkses: P.FULL },
    { namaPermission: 'manage_jenis_izin', levelAkses: P.FULL },
    { namaPermission: 'manage_saldo_cuti', levelAkses: P.FULL },
    { namaPermission: 'view_all_lembur', levelAkses: P.READ },
    { namaPermission: 'approve_lembur', levelAkses: P.CREATE },
    { namaPermission: 'manage_lembur', levelAkses: P.FULL },
    { namaPermission: 'manage_wawancara', levelAkses: P.FULL },
    { namaPermission: 'conduct_wawancara', levelAkses: P.CREATE },
    { namaPermission: 'manage_blacklist', levelAkses: P.FULL },
    { namaPermission: 'view_form_responses', levelAkses: P.READ },
    { namaPermission: 'manage_form', levelAkses: P.FULL },
    { namaPermission: 'view_reports', levelAkses: P.READ },
    { namaPermission: 'export_data', levelAkses: P.READ },
  ]);

  await assignJabatanPermissions('HR Specialist', dept('Human Resource'), [
    ...basic,
    { namaPermission: 'manage_karyawan', levelAkses: P.READ_WRITE }, // CRU, no delete
    { namaPermission: 'approve_candidate', levelAkses: P.CREATE },
    { namaPermission: 'reject_candidate', levelAkses: P.CREATE },
    { namaPermission: 'view_all_presensi', levelAkses: P.READ },
    { namaPermission: 'view_all_izin', levelAkses: P.READ },
    { namaPermission: 'approve_izin', levelAkses: P.CREATE },
    { namaPermission: 'manage_jenis_izin', levelAkses: P.READ_WRITE },
    { namaPermission: 'manage_saldo_cuti', levelAkses: P.READ_WRITE },
    { namaPermission: 'view_all_lembur', levelAkses: P.READ },
    { namaPermission: 'approve_lembur', levelAkses: P.CREATE },
    { namaPermission: 'manage_wawancara', levelAkses: P.READ_WRITE },
    { namaPermission: 'conduct_wawancara', levelAkses: P.CREATE },
    { namaPermission: 'view_form_responses', levelAkses: P.READ },
    { namaPermission: 'view_reports', levelAkses: P.READ },
  ]);

  // ==========================================
  // INFORMATION TECHNOLOGY
  // ==========================================
  console.log('\n📂 Information Technology:');

  await assignJabatanPermissions('IT Manager', dept('Information Technology'), [
    ...basic,
    ...approval,
    { namaPermission: 'manage_department', levelAkses: P.READ },
    { namaPermission: 'manage_jabatan', levelAkses: P.READ },
    { namaPermission: 'manage_jadwal_kerja', levelAkses: P.READ_WRITE },
    { namaPermission: 'assign_jadwal', levelAkses: P.CREATE },
    { namaPermission: 'reset_password', levelAkses: P.CREATE },
    { namaPermission: 'toggle_user_status', levelAkses: P.CREATE },
    { namaPermission: 'view_audit_log', levelAkses: P.READ },
    { namaPermission: 'export_data', levelAkses: P.READ },
  ]);

  await assignJabatanPermissions(
    'System Administrator',
    dept('Information Technology'),
    [
      ...basic,
      { namaPermission: 'view_all_presensi', levelAkses: P.READ },
      { namaPermission: 'view_all_izin', levelAkses: P.READ },
      { namaPermission: 'view_all_lembur', levelAkses: P.READ },
      { namaPermission: 'view_reports', levelAkses: P.READ },
      { namaPermission: 'reset_password', levelAkses: P.CREATE },
      { namaPermission: 'view_audit_log', levelAkses: P.READ },
    ],
  );

  // ==========================================
  // FINANCE & ACCOUNTING
  // ==========================================
  console.log('\n📂 Finance & Accounting:');

  await assignJabatanPermissions(
    'Finance Manager',
    dept('Finance & Accounting'),
    [
      ...basic,
      ...approval,
      { namaPermission: 'export_data', levelAkses: P.READ },
    ],
  );

  await assignJabatanPermissions('Accountant', dept('Finance & Accounting'), [
    ...basic,
    { namaPermission: 'view_all_presensi', levelAkses: P.READ },
    { namaPermission: 'view_all_izin', levelAkses: P.READ },
    { namaPermission: 'view_all_lembur', levelAkses: P.READ },
    { namaPermission: 'view_reports', levelAkses: P.READ },
    { namaPermission: 'export_data', levelAkses: P.READ },
  ]);

  await assignJabatanPermissions(
    'Payroll Staff',
    dept('Finance & Accounting'),
    [
      ...basic,
      { namaPermission: 'view_all_presensi', levelAkses: P.READ },
      { namaPermission: 'view_all_izin', levelAkses: P.READ },
      { namaPermission: 'view_all_lembur', levelAkses: P.READ },
      { namaPermission: 'export_data', levelAkses: P.READ },
    ],
  );

  // ==========================================
  // OPERATIONS
  // ==========================================
  console.log('\n📂 Operations:');

  await assignJabatanPermissions('Operations Director', dept('Operations'), [
    ...basic,
    ...approval,
    { namaPermission: 'manage_presensi', levelAkses: P.READ_WRITE },
    { namaPermission: 'manage_jadwal_kerja', levelAkses: P.READ_WRITE },
    { namaPermission: 'assign_jadwal', levelAkses: P.CREATE },
    { namaPermission: 'export_data', levelAkses: P.READ },
  ]);

  await assignJabatanPermissions('Operations Manager', dept('Operations'), [
    ...basic,
    ...approval,
    { namaPermission: 'manage_presensi', levelAkses: P.READ_WRITE },
    { namaPermission: 'manage_jadwal_kerja', levelAkses: P.READ_WRITE },
    { namaPermission: 'assign_jadwal', levelAkses: P.CREATE },
  ]);

  await assignJabatanPermissions('Operations Coordinator', dept('Operations'), [
    ...basic,
    ...approval,
    { namaPermission: 'assign_jadwal', levelAkses: P.CREATE },
  ]);

  // ==========================================
  // WAREHOUSE
  // ==========================================
  console.log('\n📂 Warehouse:');

  await assignJabatanPermissions('Warehouse Manager', dept('Warehouse'), [
    ...basic,
    ...approval,
    { namaPermission: 'manage_presensi', levelAkses: P.READ_WRITE },
    { namaPermission: 'assign_jadwal', levelAkses: P.CREATE },
    { namaPermission: 'conduct_wawancara', levelAkses: P.CREATE },
  ]);

  await assignJabatanPermissions('Warehouse Supervisor', dept('Warehouse'), [
    ...basic,
    ...approval,
    { namaPermission: 'conduct_wawancara', levelAkses: P.CREATE },
  ]);

  await assignJabatanPermissions('Warehouse Staff', dept('Warehouse'), [
    ...basic,
  ]);

  // ==========================================
  // TRANSPORTATION
  // ==========================================
  console.log('\n📂 Transportation:');

  await assignJabatanPermissions('Fleet Manager', dept('Transportation'), [
    ...basic,
    ...approval,
    { namaPermission: 'manage_jadwal_kerja', levelAkses: P.READ_WRITE },
    { namaPermission: 'assign_jadwal', levelAkses: P.CREATE },
    { namaPermission: 'manage_presensi', levelAkses: P.READ_WRITE },
  ]);

  await assignJabatanPermissions(
    'Transportation Supervisor',
    dept('Transportation'),
    [
      ...basic,
      ...approval,
      { namaPermission: 'assign_jadwal', levelAkses: P.CREATE },
      { namaPermission: 'conduct_wawancara', levelAkses: P.CREATE },
    ],
  );

  await assignJabatanPermissions('Heavy Truck Driver', dept('Transportation'), [
    ...basic,
  ]);

  // ==========================================
  // DISTRIBUTION
  // ==========================================
  console.log('\n📂 Distribution:');

  await assignJabatanPermissions('Distribution Manager', dept('Distribution'), [
    ...basic,
    ...approval,
    { namaPermission: 'assign_jadwal', levelAkses: P.CREATE },
    { namaPermission: 'conduct_wawancara', levelAkses: P.CREATE },
  ]);

  await assignJabatanPermissions(
    'Distribution Supervisor',
    dept('Distribution'),
    [
      ...basic,
      ...approval,
      { namaPermission: 'conduct_wawancara', levelAkses: P.CREATE },
    ],
  );

  await assignJabatanPermissions('Route Planner', dept('Distribution'), [
    ...basic,
  ]);
  await assignJabatanPermissions('Dispatcher', dept('Distribution'), [
    ...basic,
  ]);

  // ==========================================
  // CUSTOMER SERVICE
  // ==========================================
  console.log('\n📂 Customer Service:');

  await assignJabatanPermissions('CS Manager', dept('Customer Service'), [
    ...basic,
    ...approval,
    { namaPermission: 'conduct_wawancara', levelAkses: P.CREATE },
  ]);

  await assignJabatanPermissions(
    'Customer Service Officer',
    dept('Customer Service'),
    [...basic],
  );
  await assignJabatanPermissions(
    'Call Center Agent',
    dept('Customer Service'),
    [...basic],
  );

  // ==========================================
  // SALES & MARKETING
  // ==========================================
  console.log('\n📂 Sales & Marketing:');

  await assignJabatanPermissions('Sales Manager', dept('Sales & Marketing'), [
    ...basic,
    ...approval,
    { namaPermission: 'conduct_wawancara', levelAkses: P.CREATE },
  ]);

  await assignJabatanPermissions('Sales Executive', dept('Sales & Marketing'), [
    ...basic,
  ]);
  await assignJabatanPermissions('Marketing Staff', dept('Sales & Marketing'), [
    ...basic,
  ]);

  // ==========================================
  // PROCUREMENT
  // ==========================================
  console.log('\n📂 Procurement:');

  await assignJabatanPermissions('Procurement Manager', dept('Procurement'), [
    ...basic,
    ...approval,
    { namaPermission: 'export_data', levelAkses: P.READ },
  ]);

  await assignJabatanPermissions('Procurement Staff', dept('Procurement'), [
    ...basic,
  ]);

  // ==========================================
  // SUMMARY
  // ==========================================
  const total = await prisma.jabatanPermission.count();
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ Total jabatan-permission mappings: ${total}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

// If run directly
if (require.main === module) {
  seedJabatanPermissions()
    .catch((e) => {
      console.error('❌ Error seeding jabatan permissions:', e);
      process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
}
