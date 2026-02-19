import { Module } from '@nestjs/common';
import { JabatanPermissionController } from './jabatan-permission.controller';
import { JabatanPermissionService } from './jabatan-permission.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [JabatanPermissionController],
  providers: [JabatanPermissionService],
  exports: [JabatanPermissionService],
})
export class JabatanPermissionModule {}
