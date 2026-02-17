import { Module } from '@nestjs/common';
import { JabatanService } from './jabatan.service';
import { JabatanController } from './jabatan.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [JabatanController],
  providers: [JabatanService],
  exports: [JabatanService],
})
export class JabatanModule {}
