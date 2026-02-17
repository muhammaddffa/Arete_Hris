import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JenisIzinService } from './jenis-izin.service';
import { JenisIzinController } from './jenis-izin.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [JenisIzinController],
  providers: [JenisIzinService],
  exports: [JenisIzinService],
})
export class JenisIzinModule {}
