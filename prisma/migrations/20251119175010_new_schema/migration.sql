/*
  Warnings:

  - The primary key for the `refdepartemen` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `refjabatan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id_atasan` column on the `refjabatan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `refkaryawan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `refpermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `refrole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `role_permission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id_karyawan` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id_departemen` on the `refdepartemen` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_role_default` on the `refdepartemen` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_jabatan` on the `refjabatan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_departemen` on the `refjabatan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_karyawan` on the `refkaryawan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_jabatan` on the `refkaryawan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_permission` on the `refpermission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_role` on the `refrole` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_role` on the `role_permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_permission` on the `role_permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_user` on the `user_role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_role` on the `user_role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_user` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "refdepartemen" DROP CONSTRAINT "refdepartemen_id_role_default_fkey";

-- DropForeignKey
ALTER TABLE "refjabatan" DROP CONSTRAINT "refjabatan_id_atasan_fkey";

-- DropForeignKey
ALTER TABLE "refjabatan" DROP CONSTRAINT "refjabatan_id_departemen_fkey";

-- DropForeignKey
ALTER TABLE "refkaryawan" DROP CONSTRAINT "refkaryawan_id_jabatan_fkey";

-- DropForeignKey
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_id_permission_fkey";

-- DropForeignKey
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_id_role_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_id_role_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_id_user_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_id_karyawan_fkey";

-- AlterTable
ALTER TABLE "refdepartemen" DROP CONSTRAINT "refdepartemen_pkey",
DROP COLUMN "id_departemen",
ADD COLUMN     "id_departemen" UUID NOT NULL,
DROP COLUMN "id_role_default",
ADD COLUMN     "id_role_default" UUID NOT NULL,
ADD CONSTRAINT "refdepartemen_pkey" PRIMARY KEY ("id_departemen");

-- AlterTable
ALTER TABLE "refjabatan" DROP CONSTRAINT "refjabatan_pkey",
DROP COLUMN "id_jabatan",
ADD COLUMN     "id_jabatan" UUID NOT NULL,
DROP COLUMN "id_departemen",
ADD COLUMN     "id_departemen" UUID NOT NULL,
DROP COLUMN "id_atasan",
ADD COLUMN     "id_atasan" UUID,
ADD CONSTRAINT "refjabatan_pkey" PRIMARY KEY ("id_jabatan");

-- AlterTable
ALTER TABLE "refkaryawan" DROP CONSTRAINT "refkaryawan_pkey",
DROP COLUMN "id_karyawan",
ADD COLUMN     "id_karyawan" UUID NOT NULL,
DROP COLUMN "id_jabatan",
ADD COLUMN     "id_jabatan" UUID NOT NULL,
ADD CONSTRAINT "refkaryawan_pkey" PRIMARY KEY ("id_karyawan");

-- AlterTable
ALTER TABLE "refpermission" DROP CONSTRAINT "refpermission_pkey",
DROP COLUMN "id_permission",
ADD COLUMN     "id_permission" UUID NOT NULL,
ADD CONSTRAINT "refpermission_pkey" PRIMARY KEY ("id_permission");

-- AlterTable
ALTER TABLE "refrole" DROP CONSTRAINT "refrole_pkey",
DROP COLUMN "id_role",
ADD COLUMN     "id_role" UUID NOT NULL,
ADD CONSTRAINT "refrole_pkey" PRIMARY KEY ("id_role");

-- AlterTable
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_pkey",
DROP COLUMN "id_role",
ADD COLUMN     "id_role" UUID NOT NULL,
DROP COLUMN "id_permission",
ADD COLUMN     "id_permission" UUID NOT NULL,
ADD CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id_role", "id_permission");

-- AlterTable
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_pkey",
DROP COLUMN "id_user",
ADD COLUMN     "id_user" UUID NOT NULL,
DROP COLUMN "id_role",
ADD COLUMN     "id_role" UUID NOT NULL,
ADD CONSTRAINT "user_role_pkey" PRIMARY KEY ("id_user", "id_role");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id_user",
ADD COLUMN     "id_user" UUID NOT NULL,
DROP COLUMN "id_karyawan",
ADD COLUMN     "id_karyawan" UUID,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id_user");

-- CreateIndex
CREATE INDEX "refjabatan_id_departemen_idx" ON "refjabatan"("id_departemen");

-- CreateIndex
CREATE INDEX "refjabatan_id_atasan_idx" ON "refjabatan"("id_atasan");

-- CreateIndex
CREATE INDEX "refkaryawan_id_jabatan_idx" ON "refkaryawan"("id_jabatan");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_karyawan_key" ON "users"("id_karyawan");

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
