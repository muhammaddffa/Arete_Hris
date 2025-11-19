-- CreateEnum
CREATE TYPE "StatusKaryawan" AS ENUM ('aktif', 'rejected', 'candidate', 'resign');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "StatusPernikahan" AS ENUM ('belum_menikah', 'menikah', 'cerai');

-- CreateTable
CREATE TABLE "refdepartemen" (
    "id_departemen" SERIAL NOT NULL,
    "nama_departemen" VARCHAR(100) NOT NULL,
    "id_role_default" INTEGER NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refdepartemen_pkey" PRIMARY KEY ("id_departemen")
);

-- CreateTable
CREATE TABLE "refjabatan" (
    "id_jabatan" SERIAL NOT NULL,
    "nama_jabatan" VARCHAR(100) NOT NULL,
    "id_departemen" INTEGER NOT NULL,
    "id_atasan" INTEGER,
    "deskripsi_jabatan" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refjabatan_pkey" PRIMARY KEY ("id_jabatan")
);

-- CreateTable
CREATE TABLE "refrole" (
    "id_role" SERIAL NOT NULL,
    "nama_role" VARCHAR(50) NOT NULL,
    "deskripsi" TEXT,
    "level" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refrole_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "refpermission" (
    "id_permission" SERIAL NOT NULL,
    "nama_permission" VARCHAR(50) NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refpermission_pkey" PRIMARY KEY ("id_permission")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id_role" INTEGER NOT NULL,
    "id_permission" INTEGER NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id_role","id_permission")
);

-- CreateTable
CREATE TABLE "refkaryawan" (
    "id_karyawan" SERIAL NOT NULL,
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
    "id_jabatan" INTEGER NOT NULL,
    "nama_bank" VARCHAR(50),
    "nomor_rekening" VARCHAR(50),
    "status_keaktifan" BOOLEAN NOT NULL DEFAULT true,
    "tanggal_masuk" DATE NOT NULL,
    "tanggal_resign" DATE,
    "status" "StatusKaryawan" NOT NULL DEFAULT 'candidate',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refkaryawan_pkey" PRIMARY KEY ("id_karyawan")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "id_karyawan" INTEGER,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "use_department_role" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "reset_token" VARCHAR(100),
    "reset_token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id_user" INTEGER NOT NULL,
    "id_role" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id_user","id_role")
);

-- CreateIndex
CREATE INDEX "refjabatan_id_departemen_idx" ON "refjabatan"("id_departemen");

-- CreateIndex
CREATE INDEX "refjabatan_id_atasan_idx" ON "refjabatan"("id_atasan");

-- CreateIndex
CREATE UNIQUE INDEX "refrole_nama_role_key" ON "refrole"("nama_role");

-- CreateIndex
CREATE UNIQUE INDEX "refpermission_nama_permission_key" ON "refpermission"("nama_permission");

-- CreateIndex
CREATE UNIQUE INDEX "refkaryawan_nik_key" ON "refkaryawan"("nik");

-- CreateIndex
CREATE INDEX "refkaryawan_id_jabatan_idx" ON "refkaryawan"("id_jabatan");

-- CreateIndex
CREATE INDEX "refkaryawan_nik_idx" ON "refkaryawan"("nik");

-- CreateIndex
CREATE INDEX "refkaryawan_status_idx" ON "refkaryawan"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_karyawan_key" ON "users"("id_karyawan");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_id_karyawan_idx" ON "users"("id_karyawan");

-- AddForeignKey
ALTER TABLE "refdepartemen" ADD CONSTRAINT "refdepartemen_id_role_default_fkey" FOREIGN KEY ("id_role_default") REFERENCES "refrole"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refjabatan" ADD CONSTRAINT "refjabatan_id_departemen_fkey" FOREIGN KEY ("id_departemen") REFERENCES "refdepartemen"("id_departemen") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refjabatan" ADD CONSTRAINT "refjabatan_id_atasan_fkey" FOREIGN KEY ("id_atasan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "refrole"("id_role") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_id_permission_fkey" FOREIGN KEY ("id_permission") REFERENCES "refpermission"("id_permission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refkaryawan" ADD CONSTRAINT "refkaryawan_id_jabatan_fkey" FOREIGN KEY ("id_jabatan") REFERENCES "refjabatan"("id_jabatan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "refrole"("id_role") ON DELETE CASCADE ON UPDATE CASCADE;
