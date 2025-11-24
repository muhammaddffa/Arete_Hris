/*
  Warnings:

  - A unique constraint covering the columns `[nama_departemen]` on the table `refdepartemen` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "refjabatan" ADD COLUMN     "id_atasan" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "refdepartemen_nama_departemen_key" ON "refdepartemen"("nama_departemen");

-- CreateIndex
CREATE INDEX "refdepartemen_id_role_default_idx" ON "refdepartemen"("id_role_default");

-- CreateIndex
CREATE INDEX "refjabatan_id_atasan_idx" ON "refjabatan"("id_atasan");

-- CreateIndex
CREATE INDEX "refkaryawan_status_keaktifan_idx" ON "refkaryawan"("status_keaktifan");

-- AddForeignKey
ALTER TABLE "refjabatan" ADD CONSTRAINT "refjabatan_id_atasan_fkey" FOREIGN KEY ("id_atasan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE SET NULL ON UPDATE CASCADE;
