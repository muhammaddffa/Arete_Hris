import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PresensiController } from './presensi.controller';
import { PresensiService } from './presensi.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PresensiController],
  providers: [PresensiService],
  exports: [PresensiService],
})
export class PresensiModule {}
