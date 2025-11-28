import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KaryawanJadwalController } from './karyawan-jadwal.controller';
import { KaryawanJadwalService } from './karyawan-jadwal.service';

@Module({
  imports: [PrismaModule],
  controllers: [KaryawanJadwalController],
  providers: [KaryawanJadwalService],
})
export class KaryawanJadwalModule {}
