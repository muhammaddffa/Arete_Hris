import { Module } from '@nestjs/common';
import { KaryawanService } from './karyawan.service';
import { KaryawanController } from './karyawan.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [KaryawanController],
  providers: [KaryawanService],
  exports: [KaryawanService],
})
export class KaryawanModule {}
