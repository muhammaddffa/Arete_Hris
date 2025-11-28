/*
  Warnings:

  - The primary key for the `refjenisizin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deskripsi` on the `refjenisizin` table. All the data in the column will be lost.
  - Changed the type of `id_jenis_izin` on the `pengajuanizin` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_jenis_izin` on the `refjenisizin` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "pengajuanizin" DROP CONSTRAINT "pengajuanizin_id_jenis_izin_fkey";

-- AlterTable
ALTER TABLE "pengajuanizin" DROP COLUMN "id_jenis_izin",
ADD COLUMN     "id_jenis_izin" UUID NOT NULL;

-- AlterTable
ALTER TABLE "refjenisizin" DROP CONSTRAINT "refjenisizin_pkey",
DROP COLUMN "deskripsi",
DROP COLUMN "id_jenis_izin",
ADD COLUMN     "id_jenis_izin" UUID NOT NULL,
ADD CONSTRAINT "refjenisizin_pkey" PRIMARY KEY ("id_jenis_izin");

-- CreateIndex
CREATE INDEX "pengajuanizin_id_jenis_izin_idx" ON "pengajuanizin"("id_jenis_izin");

-- AddForeignKey
ALTER TABLE "pengajuanizin" ADD CONSTRAINT "pengajuanizin_id_jenis_izin_fkey" FOREIGN KEY ("id_jenis_izin") REFERENCES "refjenisizin"("id_jenis_izin") ON DELETE RESTRICT ON UPDATE CASCADE;
