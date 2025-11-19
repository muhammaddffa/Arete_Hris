/*
  Warnings:

  - The primary key for the `refpermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id_permission` column on the `refpermission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `refrole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id_role` column on the `refrole` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `role_permission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id_role_default` on the `refdepartemen` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_role` on the `role_permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_permission` on the `role_permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_role` on the `user_role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "refdepartemen" DROP CONSTRAINT "refdepartemen_id_role_default_fkey";

-- DropForeignKey
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_id_permission_fkey";

-- DropForeignKey
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_id_role_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_id_role_fkey";

-- AlterTable
ALTER TABLE "refdepartemen" DROP COLUMN "id_role_default",
ADD COLUMN     "id_role_default" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "refpermission" DROP CONSTRAINT "refpermission_pkey",
DROP COLUMN "id_permission",
ADD COLUMN     "id_permission" SERIAL NOT NULL,
ADD CONSTRAINT "refpermission_pkey" PRIMARY KEY ("id_permission");

-- AlterTable
ALTER TABLE "refrole" DROP CONSTRAINT "refrole_pkey",
DROP COLUMN "id_role",
ADD COLUMN     "id_role" SERIAL NOT NULL,
ADD CONSTRAINT "refrole_pkey" PRIMARY KEY ("id_role");

-- AlterTable
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_pkey",
DROP COLUMN "id_role",
ADD COLUMN     "id_role" INTEGER NOT NULL,
DROP COLUMN "id_permission",
ADD COLUMN     "id_permission" INTEGER NOT NULL,
ADD CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id_role", "id_permission");

-- AlterTable
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_pkey",
DROP COLUMN "id_role",
ADD COLUMN     "id_role" INTEGER NOT NULL,
ADD CONSTRAINT "user_role_pkey" PRIMARY KEY ("id_user", "id_role");

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "refrole"("id_role") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_id_permission_fkey" FOREIGN KEY ("id_permission") REFERENCES "refpermission"("id_permission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refdepartemen" ADD CONSTRAINT "refdepartemen_id_role_default_fkey" FOREIGN KEY ("id_role_default") REFERENCES "refrole"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "refrole"("id_role") ON DELETE CASCADE ON UPDATE CASCADE;
