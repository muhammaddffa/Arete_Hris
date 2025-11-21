// src/jabatan/jabatan.module.ts
import { Module } from '@nestjs/common';
import { JabatanService } from './jabatan.service';
import { JabatanController } from './jabatan.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JabatanController],
  providers: [JabatanService],
  exports: [JabatanService],
})
export class JabatanModule {}
