import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { KaryawanJadwalController } from './karyawan-jadwal.controller';
import { KaryawanJadwalService } from './karyawan-jadwal.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [KaryawanJadwalController],
  providers: [KaryawanJadwalService],
  exports: [KaryawanJadwalService],
})
export class KaryawanJadwalModule {}
