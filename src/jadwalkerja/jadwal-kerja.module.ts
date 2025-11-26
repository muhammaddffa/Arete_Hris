/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { JadwalKerjaService } from "./jadwal-kerja.service";
import { JadwalKerjaController } from "./jadwal-kerja.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [JadwalKerjaController],
  providers: [JadwalKerjaService],
})
export class JadwalKerjaModule {}
