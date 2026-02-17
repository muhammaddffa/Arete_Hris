import { Module } from '@nestjs/common';
import { PengajuanIzinService } from './pengajuan-izin.service';
import { PengajuanIzinController } from './pengajuan-izin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SaldoCutiModule } from '../saldocuti/saldo-cuti.module';
import { UploadModule } from '../upload/upload.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, SaldoCutiModule, UploadModule, AuthModule],
  controllers: [PengajuanIzinController],
  providers: [PengajuanIzinService],
  exports: [PengajuanIzinService],
})
export class PengajuanIzinModule {}
