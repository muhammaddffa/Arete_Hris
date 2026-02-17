import { Module } from '@nestjs/common';
import { PengajuanLemburService } from './pengajuan-lembur.service';
import { PengajuanLemburController } from './pengajuan-lembur.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PengajuanLemburController],
  providers: [PengajuanLemburService],
  exports: [PengajuanLemburService],
})
export class PengajuanLemburModule {}
