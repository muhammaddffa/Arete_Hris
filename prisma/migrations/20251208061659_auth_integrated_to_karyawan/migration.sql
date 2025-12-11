/*
  Warnings:

  - You are about to drop the column `id_role_default` on the `refdepartemen` table. All the data in the column will be lost.
  - You are about to drop the `user_role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `refkaryawan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_role_default` to the `refjabatan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "refdepartemen" DROP CONSTRAINT "refdepartemen_id_role_default_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_id_role_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_id_user_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_id_karyawan_fkey";

-- DropIndex
DROP INDEX "refdepartemen_id_role_default_idx";

-- AlterTable
ALTER TABLE "refdepartemen" DROP COLUMN "id_role_default";

-- AlterTable
ALTER TABLE "refjabatan" ADD COLUMN     "id_role_default" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "refkaryawan" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "locked_until" TIMESTAMP(3),
ADD COLUMN     "login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "password_hash" VARCHAR(255),
ADD COLUMN     "reset_token" VARCHAR(100),
ADD COLUMN     "reset_token_expires" TIMESTAMP(3),
ADD COLUMN     "use_jabatan_role" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "username" VARCHAR(50);

-- DropTable
DROP TABLE "user_role";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "karyawan_role" (
    "id_karyawan" UUID NOT NULL,
    "id_role" INTEGER NOT NULL,

    CONSTRAINT "karyawan_role_pkey" PRIMARY KEY ("id_karyawan","id_role")
);

-- CreateTable
CREATE TABLE "karyawan_permission_override" (
    "id_karyawan" UUID NOT NULL,
    "id_permission" INTEGER NOT NULL,
    "type_permission" BOOLEAN NOT NULL,
    "deskripsi" TEXT,

    CONSTRAINT "karyawan_permission_override_pkey" PRIMARY KEY ("id_karyawan","id_permission")
);

-- CreateIndex
CREATE INDEX "refjabatan_id_role_default_idx" ON "refjabatan"("id_role_default");

-- CreateIndex
CREATE UNIQUE INDEX "refkaryawan_username_key" ON "refkaryawan"("username");

-- CreateIndex
CREATE INDEX "refkaryawan_username_idx" ON "refkaryawan"("username");

-- AddForeignKey
ALTER TABLE "refjabatan" ADD CONSTRAINT "refjabatan_id_role_default_fkey" FOREIGN KEY ("id_role_default") REFERENCES "refrole"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_role" ADD CONSTRAINT "karyawan_role_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_role" ADD CONSTRAINT "karyawan_role_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "refrole"("id_role") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_permission_override" ADD CONSTRAINT "karyawan_permission_override_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan_permission_override" ADD CONSTRAINT "karyawan_permission_override_id_permission_fkey" FOREIGN KEY ("id_permission") REFERENCES "refpermission"("id_permission") ON DELETE CASCADE ON UPDATE CASCADE;
