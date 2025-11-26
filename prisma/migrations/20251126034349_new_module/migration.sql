-- CreateEnum
CREATE TYPE "StatusKehadiran" AS ENUM ('hadir', 'izin', 'sakit', 'alpa', 'cuti', 'libur', 'dinas_luar');

-- CreateEnum
CREATE TYPE "SumberPresensi" AS ENUM ('manual', 'biometric', 'mobile_app', 'web_app', 'qr_code');

-- CreateEnum
CREATE TYPE "StatusPersetujuan" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateTable
CREATE TABLE "refjadwalkerja" (
    "id_jadwal" UUID NOT NULL,
    "kode_jadwal" VARCHAR(20) NOT NULL,
    "nama_jadwal" VARCHAR(100) NOT NULL,
    "jam_masuk" VARCHAR(5) NOT NULL,
    "jam_pulang" VARCHAR(5) NOT NULL,
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
    "id_jenis_izin" SERIAL NOT NULL,
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
    "id_jenis_izin" INTEGER NOT NULL,
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
