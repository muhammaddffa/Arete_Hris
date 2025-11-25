-- CreateEnum
CREATE TYPE "JenisWawancara" AS ENUM ('hrd', 'user');

-- AlterTable
ALTER TABLE "wawancara" ADD COLUMN     "jenis_wawancara" "JenisWawancara" NOT NULL DEFAULT 'hrd',
ADD COLUMN     "link_online" VARCHAR(500),
ADD COLUMN     "nilai_hasil" INTEGER;

-- CreateIndex
CREATE INDEX "wawancara_jenis_wawancara_idx" ON "wawancara"("jenis_wawancara");
