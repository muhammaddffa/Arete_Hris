/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { PengajuanLemburService } from "./pengajuan-lembur.service";
import { PengajuanLemburController } from "./pengajuan-lembur.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PengajuanLemburController],
  providers: [PengajuanLemburService],
  exports: [PengajuanLemburService],
})
export class PengajuanLemburModule {}
