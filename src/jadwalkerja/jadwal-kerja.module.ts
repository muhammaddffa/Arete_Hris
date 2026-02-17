import { Module } from '@nestjs/common';
import { JadwalKerjaService } from './jadwal-kerja.service';
import { JadwalKerjaController } from './jadwal-kerja.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [JadwalKerjaController],
  providers: [JadwalKerjaService],
  exports: [JadwalKerjaService],
})
export class JadwalKerjaModule {}
