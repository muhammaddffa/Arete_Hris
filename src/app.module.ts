// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DepartmentModule } from './department/department.module';
import { JabatanModule } from './jabatan/jabatan.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    DepartmentModule,
    JabatanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
