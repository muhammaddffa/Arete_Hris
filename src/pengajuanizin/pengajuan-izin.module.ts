import { Module } from '@nestjs/common';
import { PengajuanIzinService } from './pengajuan-izin.service';
import { PengajuanIzinController } from './pengajuan-izin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SaldoCutiModule } from '../saldocuti/saldo.cuti.module';

@Module({
  imports: [PrismaModule, SaldoCutiModule],
  controllers: [PengajuanIzinController],
  providers: [PengajuanIzinService],
  exports: [PengajuanIzinService],
})
export class PengajuanIzinModule {}
