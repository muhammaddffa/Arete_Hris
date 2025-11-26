-- CreateEnum
CREATE TYPE "StatusWawancara" AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');

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
    "lokasi" VARCHAR(255),
    "catatan" TEXT,
    "hasil" TEXT,
    "status" "StatusWawancara" NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wawancara_pkey" PRIMARY KEY ("id_wawancara")
);

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

-- AddForeignKey
ALTER TABLE "refblacklist" ADD CONSTRAINT "refblacklist_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wawancara" ADD CONSTRAINT "wawancara_id_pewawancara_fkey" FOREIGN KEY ("id_pewawancara") REFERENCES "refkaryawan"("id_karyawan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wawancara" ADD CONSTRAINT "wawancara_id_peserta_fkey" FOREIGN KEY ("id_peserta") REFERENCES "refkaryawan"("id_karyawan") ON DELETE RESTRICT ON UPDATE CASCADE;
