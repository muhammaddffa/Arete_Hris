/*
  Warnings:

  - You are about to drop the column `id_atasan` on the `refjabatan` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "refjabatan" DROP CONSTRAINT "refjabatan_id_atasan_fkey";

-- DropIndex
DROP INDEX "refjabatan_id_atasan_idx";

-- AlterTable
ALTER TABLE "refjabatan" DROP COLUMN "id_atasan";
