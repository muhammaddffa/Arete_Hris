/*
  Warnings:

  - A unique constraint covering the columns `[nama_jabatan,id_departemen]` on the table `refjabatan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "refjabatan_nama_jabatan_id_departemen_key" ON "refjabatan"("nama_jabatan", "id_departemen");
