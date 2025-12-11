-- CreateTable
CREATE TABLE "permission_audit_log" (
    "id_log" UUID NOT NULL,
    "id_karyawan" UUID NOT NULL,
    "id_permission" INTEGER NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "type_permission" BOOLEAN,
    "granted_by" UUID NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_audit_log_pkey" PRIMARY KEY ("id_log")
);

-- CreateIndex
CREATE INDEX "permission_audit_log_id_karyawan_idx" ON "permission_audit_log"("id_karyawan");

-- CreateIndex
CREATE INDEX "permission_audit_log_granted_by_idx" ON "permission_audit_log"("granted_by");

-- CreateIndex
CREATE INDEX "permission_audit_log_action_idx" ON "permission_audit_log"("action");

-- CreateIndex
CREATE INDEX "permission_audit_log_created_at_idx" ON "permission_audit_log"("created_at");

-- AddForeignKey
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_id_permission_fkey" FOREIGN KEY ("id_permission") REFERENCES "refpermission"("id_permission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "refkaryawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;
