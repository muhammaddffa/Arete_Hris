import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JenisIzinService } from './jenis-izin.service';
import { JenisIzinController } from './jenis-izin.controller';

@Module({
  imports: [PrismaModule],
  controllers: [JenisIzinController],
  providers: [JenisIzinService],
})
export class JenisIzinModule {}
