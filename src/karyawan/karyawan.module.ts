import { Module } from '@nestjs/common';
import { KaryawanController } from './karyawan.controller';
import { KaryawanService } from './karyawan.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from 'src/upload/cloudinary.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [KaryawanController],
  providers: [KaryawanService, CloudinaryService],
  exports: [KaryawanService],
})
export class KaryawanModule {}
