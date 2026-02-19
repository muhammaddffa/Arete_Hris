-- CreateEnum
CREATE TYPE "StatusKaryawan" AS ENUM ('aktif', 'rejected', 'candidate', 'resign');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "StatusPernikahan" AS ENUM ('belum_menikah', 'menikah', 'cerai');

-- CreateEnum
CREATE TYPE "StatusKehadiran" AS ENUM ('hadir', 'izin', 'sakit', 'alpa', 'cuti', 'libur', 'dinas_luar');

-- CreateEnum
CREATE TYPE "SumberPresensi" AS ENUM ('manual', 'biometric', 'mobile_app', 'web_app', 'qr_code');

-- CreateEnum
CREATE TYPE "StatusPersetujuan" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "StatusWawancara" AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');

-- CreateEnum
CREATE TYPE "JenisWawancara" AS ENUM ('hrd', 'user');

-- CreateTable
CREATE TABLE "refpermission" (
    "id_permission" SERIAL NOT NULL,
    "nama_permission" VARCHAR(50) NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refpermission_pkey" PRIMARY KEY ("id_permission")
);

-- CreateTable
CREATE TABLE "refdepartemen" (
    "id_departemen" UUID NOT NULL,
    "nama_departemen" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refdepartemen_pkey" PRIMARY KEY ("id_departemen")
);

-- CreateTable
CREATE TABLE "refjabatan" (
    "id_jabatan" UUID NOT NULL,
    "nama_jabatan" VARCHAR(100) NOT NULL,
    "id_departemen" UUID NOT NULL,
    "id_atasan" UUID,
    "deskripsi_jabatan" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refjabatan_pkey" PRIMARY KEY ("id_jabatan")
);

-- CreateTable
CREATE TABLE "jabatan_permission" (
    "id_jabatan" UUID NOT NULL,
    "id_permission" INTEGER NOT NULL,
    "level_akses" INTEGER NOT NULL,

    CONSTRAINT "jabatan_permission_pkey" PRIMARY KEY ("id_jabatan","id_permission")
);

-- CreateTable
CREATE TABLE "refkaryawan" (
    "id_karyawan" UUID NOT NULL,
    "nik" VARCHAR(20),
    "npwp" VARCHAR(30),
    "skck" VARCHAR(255),
    "surat_kesehatan" VARCHAR(255),
    "cv" VARCHAR(255),
    "nama" VARCHAR(100) NOT NULL,
    "tempat_lahir" VARCHAR(100) NOT NULL,
    "tanggal_lahir" DATE NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "status_pernikahan" "StatusPernikahan" NOT NULL,
    "pasfoto" VARCHAR(255),
    "agama" VARCHAR(20) NOT NULL,
    "no_hp_pribadi" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100),
    "alamat" TEXT,
    "id_jabatan" UUID NOT NULL,
    "nama_bank" VARCHAR(50),
    "nomor_rekening" VARCHAR(50),
    "status_keaktifan" BOOLEAN NOT NULL DEFAULT true,
    "tanggal_masuk" DATE NOT NULL,
    "tanggal_resign" DATE,
    "status" "StatusKaryawan" NOT NULL DEFAULT 'candidate',
    "username" VARCHAR(50),
    "password_hash" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "reset_token" VARCHAR(100),
    "reset_token_expires" TIMESTAMP(3),
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refkaryawan_pkey" PRIMARY KEY ("id_karyawan")
);

-- CreateTable
CREATE TABLE "karyawan_permission_override" (
    "id_karyawan" UUID NOT NULL,
    "id_permission" INTEGER NOT NULL,
    "type_permission" BOOLEAN NOT NULL,
    "level_akses" INTEGER,
    "deskripsi" TEXT,

    CONSTRAINT "karyawan_permission_override_pkey" PRIMARY KEY ("id_karyawan","id_permission")
);

-- CreateTable
CREATE TABLE "permission_audit_log" (
    "id_log" UUID NOT NULL,
    "id_karyawan" UUID NOT NULL,
    "id_permission" INTEGER NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "type_permission" BOOLEAN,
    "level_akses" INTEGER,
    "granted_by" UUID NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_audit_log_pkey" PRIMARY KEY ("id_log")
);

-- CreateTable
CREATE TABLE "refjadwalkerja" (
    "id_jadwal" UUID NOT NULL,
    "kode_jadwal" VARCHAR(20) NOT NULL,
    "nama_jadwal" VARCHAR(100) NOT NULL,
    "jam_masuk" VARCHAR(5),
    "jam_pulang" VARCHAR(5),
    "hari_kerja" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refjadwalkerja_pkey" PRIMARY KEY ("id_jadwal")
);

-- CreateTable
CREATE TABLE "karyawanjadwal" (
    "id_karyawan_jadwal" UUID NOT NULL,
    "id_karyawan" UUID NOT NULL,
    "id_jadwal" UUID NOT NULL,
    "tanggal_mulai_efektif" DATE NOT NULL,
    "tanggal_selesai_efektif" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "karyawanjadwal_pkey" PRIMARY KEY ("id_karyawan_jadwal")
);

-- CreateTable
CREATE TABLE "presensi" (
    "id_presensi" UUID NOT NULL,
    "id_karyawan" UUID NOT NULL,
    "tanggal_presensi" DATE NOT NULL,
    "waktu_clock_in" TIMESTAMPTZ(3),
    "waktu_clock_out" TIMESTAMPTZ(3),
    "status_kehadiran" "StatusKehadiran" NOT NULL DEFAULT 'hadir',
    "sumber_presensi" "SumberPresensi" NOT NULL DEFAULT 'manual',
    "keterangan" TEXT,
    "lokasi_clock_in" VARCHAR(255),
    "lokasi_clock_out" VARCHAR(255),
    "foto_clock_in" VARCHAR(500),
    "foto_clock_out" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presensi_pkey" PRIMARY KEY ("id_presensi")
);

-- CreateTable
CREATE TABLE "refjenisizin" (
    "id_jenis_izin" UUID NOT NULL,
    "kode_izin" VARCHAR(20) NOT NULL,
    "nama_izin" VARCHAR(100) NOT NULL,
    "potong_cuti" BOOLEAN NOT NULL DEFAULT true,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refjenisizin_pkey" PRIMARY KEY ("id_jenis_izin")
);

-- CreateTable
CREATE TABLE "refsaldocuti" (
    "id_saldo" UUID NOT NULL,
    "id_karyawan" UUID NOT NULL,
    "tahun" INTEGER NOT NULL,
    "saldo_awal" INTEGER NOT NULL DEFAULT 12,
    "saldo_terpakai" INTEGER NOT NULL DEFAULT 0,
    "saldo_sisa" INTEGER NOT NULL DEFAULT 12,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refsaldocuti_pkey" PRIMARY KEY ("id_saldo")
);

-- CreateTable
CREATE TABLE "pengajuanizin" (
    "id_pengajuan_izin" UUID NOT NULL,
    "id_karyawan" UUID NOT NULL,
    "id_jenis_izin" UUID NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE NOT NULL,
    "jumlah_hari" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "path_bukti" VARCHAR(500),
    "status_persetujuan" "StatusPersetujuan" NOT NULL DEFAULT 'pending',
    "id_atasan" UUID,
    "tanggal_persetujuan" TIMESTAMPTZ(3),
    "catatan_atasan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengajuanizin_pkey" PRIMARY KEY ("id_pengajuan_izin")
);

-- CreateTable
CREATE TABLE "pengajuanlembur" (
    "id_lembur" UUID NOT NULL,
    "id_karyawan" UUID NOT NULL,
    "tanggal_lembur" DATE NOT NULL,
    "jam_mulai" VARCHAR(5) NOT NULL,
    "jam_selesai" VARCHAR(5) NOT NULL,
    "total_jam" DECIMAL(4,2) NOT NULL,
    "keterangan_pekerjaan" TEXT NOT NULL,
    "status_persetujuan" "StatusPersetujuan" NOT NULL DEFAULT 'pending',
    "id_atasan" UUID,
    "tanggal_persetujuan" TIMESTAMPTZ(3),
    "catatan_atasan" TEXT,
    "referensi_gaji_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengajuanlembur_pkey" PRIMARY KEY ("id_lembur")
);

-- CreateTable
CREATE TABLE "refblacklist" (
    "id_blacklist" UUID NOT NULL,
    "id_karyawan" UUID NOT NULL,
    "nik" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "pasfoto" VARCHAR(255),
    "alasan" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refblacklist_pkey" PRIMARY KEY ("id_blacklist")
);

-- CreateTable
CREATE TABLE "wawancara" (
    "id_wawancara" UUID NOT NULL,
    "id_pewawancara" UUID NOT NULL,
    "id_peserta" UUID NOT NULL,
    "tanggal_wawancara" DATE NOT NULL,
    "jam_wawancara" VARCHAR(5) NOT NULL,
    "jenis_wawancara" "JenisWawancara" NOT NULL DEFAULT 'hrd',
    "lokasi" VARCHAR(255),
    "link_online" VARCHAR(500),
    "catatan" TEXT,
    "hasil" TEXT,
    "nilai_hasil" INTEGER,
    "status" "StatusWawancara" NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wawancara_pkey" PRIMARY KEY ("id_wawancara")
);

-- CreateTable
CREATE TABLE "refForm" (
    "id_form" UUID NOT NULL,
    "name_form" VARCHAR(200) NOT NULL,
    "deskripsi" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refForm_pkey" PRIMARY KEY ("id_form")
);

-- CreateTable
CREATE TABLE "refquestion" (
    "id_question" UUID NOT NULL,
    "id_form" UUID NOT NULL,
    "name_question" VARCHAR(500) NOT NULL,
    "question_type" VARCHAR(50) NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "order_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refquestion_pkey" PRIMARY KEY ("id_question")
);

-- CreateTable
CREATE TABLE "refoption" (
    "id_option" UUID NOT NULL,
    "id_question" UUID NOT NULL,
    "option_text" VARCHAR(300) NOT NULL,
    "option_value" VARCHAR(100),
    "order_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refoption_pkey" PRIMARY KEY ("id_option")
);

-- CreateTable
CREATE TABLE "answer" (
    "id_answer" UUID NOT NULL,
    "id_form" UUID NOT NULL,
    "id_question" UUID NOT NULL,
    "id_karyawan" UUID NOT NULL,
    "id_option" UUID,
    "text_answer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id_answer")
);

-- CreateIndex
CREATE UNIQUE INDEX "refpermission_nama_permission_key" ON "refpermission"("nama_permission");

-- CreateIndex
CREATE UNIQUE INDEX "refdepartemen_nama_departemen_key" ON "refdepartemen"("nama_departemen");

-- CreateIndex
CREATE INDEX "refjabatan_id_departemen_idx" ON "refjabatan"("id_departemen");

-- CreateIndex
CREATE INDEX "refjabatan_id_atasan_idx" ON "refjabatan"("id_atasan");

-- CreateIndex
CREATE UNIQUE INDEX "refjabatan_nama_jabatan_id_departemen_key" ON "refjabatan"("nama_jabatan", "id_departemen");

-- CreateIndex
CREATE INDEX "jabatan_permission_id_jabatan_idx" ON "jabatan_permission"("id_jabatan");

-- CreateIndex
CREATE INDEX "jabatan_permission_id_permission_idx" ON "jabatan_permission"("id_permission");

-- CreateIndex
CREATE UNIQUE INDEX "refkaryawan_nik_key" ON "refkaryawan"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "refkaryawan_username_key" ON "refkaryawan"("username");

-- CreateIndex
CREATE INDEX "refkaryawan_id_jabatan_idx" ON "refkaryawan"("id_jabatan");

-- CreateIndex
CREATE INDEX "refkaryawan_nik_idx" ON "refkaryawan"("nik");

-- CreateIndex
CREATE INDEX "refkaryawan_status_idx" ON "refkaryawan"("status");

-- CreateIndex
CREATE INDEX "refkaryawan_status_keaktifan_idx" ON "refkaryawan"("status_keaktifan");

-- CreateIndex
CREATE INDEX "refkaryawan_username_idx" ON "refkaryawan"("username");

-- CreateIndex
CREATE INDEX "karyawan_permission_override_id_karyawan_idx" ON "karyawan_permission_override"("id_karyawan");

-- CreateIndex
CREATE INDEX "karyawan_permission_override_id_permission_idx" ON "karyawan_permission_override"("id_permission");

-- CreateIndex
CREATE INDEX "permission_audit_log_id_karyawan_idx" ON "permission_audit_log"("id_karyawan");

-- CreateIndex
CREATE INDEX "permission_audit_log_granted_by_idx" ON "permission_audit_log"("granted_by");

-- CreateIndex
CREATE INDEX "permission_audit_log_action_idx" ON "permission_audit_log"("action");

-- CreateIndex
CREATE INDEX "permission_audit_log_created_at_idx" ON "permission_audit_log"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "refjadwalkerja_kode_jadwal_key" ON "refjadwalkerja"("kode_jadwal");

-- CreateIndex
CREATE INDEX "refjadwalkerja_kode_jadwal_idx" ON "refjadwalkerja"("kode_jadwal");

-- CreateIndex
CREATE INDEX "karyawanjadwal_id_karyawan_idx" ON "karyawanjadwal"("id_karyawan");

-- CreateIndex
CREATE INDEX "karyawanjadwal_id_jadwal_idx" ON "karyawanjadwal"("id_jadwal");

-- CreateIndex
CREATE INDEX "karyawanjadwal_tanggal_mulai_efektif_idx" ON "karyawanjadwal"("tanggal_mulai_efektif");

-- CreateIndex
CREATE UNIQUE INDEX "karyawanjadwal_id_karyawan_tanggal_mulai_efektif_key" ON "karyawanjadwal"("id_karyawan", "tanggal_mulai_efektif");

-- CreateIndex
CREATE INDEX "presensi_id_karyawan_idx" ON "presensi"("id_karyawan");

-- CreateIndex
CREATE INDEX "presensi_tanggal_presensi_idx" ON "presensi"("tanggal_presensi");

-- CreateIndex
CREATE INDEX "presensi_status_kehadiran_idx" ON "presensi"("status_kehadiran");

-- CreateIndex
CREATE UNIQUE INDEX "presensi_id_karyawan_tanggal_presensi_key" ON "presensi"("id_karyawan", "tanggal_presensi");

-- CreateIndex
CREATE UNIQUE INDEX "refjenisizin_kode_izin_key" ON "refjenisizin"("kode_izin");

-- CreateIndex
CREATE INDEX "refjenisizin_kode_izin_idx" ON "refjenisizin"("kode_izin");

-- CreateIndex
CREATE INDEX "refsaldocuti_id_karyawan_idx" ON "refsaldocuti"("id_karyawan");

-- CreateIndex
CREATE INDEX "refsaldocuti_tahun_idx" ON "refsaldocuti"("tahun");

-- CreateIndex
CREATE UNIQUE INDEX "refsaldocuti_id_karyawan_tahun_key" ON "refsaldocuti"("id_karyawan", "tahun");

-- CreateIndex
CREATE INDEX "pengajuanizin_id_karyawan_idx" ON "pengajuanizin"("id_karyawan");

-- CreateIndex
CREATE INDEX "pengajuanizin_id_jenis_izin_idx" ON "pengajuanizin"("id_jenis_izin");

-- CreateIndex
CREATE INDEX "pengajuanizin_id_atasan_idx" ON "pengajuanizin"("id_atasan");

-- CreateIndex
CREATE INDEX "pengajuanizin_status_persetujuan_idx" ON "pengajuanizin"("status_persetujuan");

-- CreateIndex
CREATE INDEX "pengajuanizin_tanggal_mulai_idx" ON "pengajuanizin"("tanggal_mulai");

-- CreateIndex
CREATE INDEX "pengajuanlembur_id_karyawan_idx" ON "pengajuanlembur"("id_karyawan");

-- CreateIndex
CREATE INDEX "pengajuanlembur_id_atasan_idx" ON "pengajuanlembur"("id_atasan");

-- CreateIndex
CREATE INDEX "pengajuanlembur_tanggal_lembur_idx" ON "pengajuanlembur"("tanggal_lembur");

-- CreateIndex
CREATE INDEX "pengajuanlembur_status_persetujuan_idx" ON "pengajuanlembur"("status_persetujuan");

-- CreateIndex
CREATE UNIQUE INDEX "refblacklist_id_karyawan_key" ON "refblacklist"("id_karyawan");

-- CreateIndex
CREATE INDEX "refblacklist_id_karyawan_idx" ON "refblacklist"("id_karyawan");

-- CreateIndex
CREATE INDEX "refblacklist_nik_idx" ON "refblacklist"("nik");

-- CreateIndex
CREATE INDEX "wawancara_id_pewawancara_idx" ON "wawancara"("id_pewawancara");

-- CreateIndex
CREATE INDEX "wawancara_id_peserta_idx" ON "wawancara"("id_peserta");

-- CreateIndex
CREATE INDEX "wawancara_tanggal_wawancara_idx" ON "wawancara"("tanggal_wawancara");

-- CreateIndex
CREATE INDEX "wawancara_status_idx" ON "wawancara"("status");

-- CreateIndex
CREATE INDEX "wawancara_jenis_wawancara_idx" ON "wawancara"("jenis_wawancara");

-- CreateIndex
CREATE INDEX "refquestion_id_form_idx" ON "refquestion"("id_form");

-- CreateIndex
CREATE INDEX "refquestion_order_number_idx" ON "refquestion"("order_number");

-- CreateIndex
CREATE INDEX "refoption_id_question_idx" ON "refoption"("id_question");

-- CreateIndex
CREATE INDEX "answer_id_form_idx" ON "answer"("id_form");

-- CreateIndex
CREATE INDEX "answer_id_question_idx" ON "answer"("id_question");

-- CreateIndex
CREATE INDEX "answer_id_karyawan_idx" ON "answer"("id_karyawan");

-- CreateIndex
CREATE INDEX "answer_id_option_idx" ON "answer"("id_option");

-- AddForeignKey
ALTER TABLE "refjabatan" ADD CONSTRAINT "refjabatan_id_departemen_fkey" FOREIGN KEY ("id_departemen") REFERENCES "refdepartemen"("id_departemen") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refjabatan" ADD CONSTRAINT "refjabatan_id_atasan_fkey" FOREIGN KEY ("id_atasan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jabatan_permission" ADD CONSTRAINT "jabatan_permission_id_jabatan_fkey" FOREIGN KEY ("id_jabatan") REFERENCES "refjabatan"("id_jabatan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jabatan_permission" ADD CONSTRAINT "jabatan_permission_id_permission_fkey" FOREIGN KEY ("id_permission") REFERENCES "refpermission"("id_permission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refkaryawan" ADD CONSTRAINT "refkaryawan_id_jabatan_fkey" FOREIGN KEY ("id_jabatan") REFERENCES "refjabatan"("id_jabatan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_permission_override" ADD CONSTRAINT "karyawan_permission_override_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_permission_override" ADD CONSTRAINT "karyawan_permission_override_id_permission_fkey" FOREIGN KEY ("id_permission") REFERENCES "refpermission"("id_permission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_id_permission_fkey" FOREIGN KEY ("id_permission") REFERENCES "refpermission"("id_permission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawanjadwal" ADD CONSTRAINT "karyawanjadwal_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawanjadwal" ADD CONSTRAINT "karyawanjadwal_id_jadwal_fkey" FOREIGN KEY ("id_jadwal") REFERENCES "refjadwalkerja"("id_jadwal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presensi" ADD CONSTRAINT "presensi_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refsaldocuti" ADD CONSTRAINT "refsaldocuti_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuanizin" ADD CONSTRAINT "pengajuanizin_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuanizin" ADD CONSTRAINT "pengajuanizin_id_jenis_izin_fkey" FOREIGN KEY ("id_jenis_izin") REFERENCES "refjenisizin"("id_jenis_izin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuanizin" ADD CONSTRAINT "pengajuanizin_id_atasan_fkey" FOREIGN KEY ("id_atasan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuanlembur" ADD CONSTRAINT "pengajuanlembur_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuanlembur" ADD CONSTRAINT "pengajuanlembur_id_atasan_fkey" FOREIGN KEY ("id_atasan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refblacklist" ADD CONSTRAINT "refblacklist_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wawancara" ADD CONSTRAINT "wawancara_id_pewawancara_fkey" FOREIGN KEY ("id_pewawancara") REFERENCES "refkaryawan"("id_karyawan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wawancara" ADD CONSTRAINT "wawancara_id_peserta_fkey" FOREIGN KEY ("id_peserta") REFERENCES "refkaryawan"("id_karyawan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refquestion" ADD CONSTRAINT "refquestion_id_form_fkey" FOREIGN KEY ("id_form") REFERENCES "refForm"("id_form") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refoption" ADD CONSTRAINT "refoption_id_question_fkey" FOREIGN KEY ("id_question") REFERENCES "refquestion"("id_question") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_id_form_fkey" FOREIGN KEY ("id_form") REFERENCES "refForm"("id_form") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_id_question_fkey" FOREIGN KEY ("id_question") REFERENCES "refquestion"("id_question") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_id_option_fkey" FOREIGN KEY ("id_option") REFERENCES "refoption"("id_option") ON DELETE SET NULL ON UPDATE CASCADE;
