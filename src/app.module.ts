// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DepartmentModule } from './department/department.module';
import { JabatanModule } from './jabatan/jabatan.module';
import { KaryawanModule } from './karyawan/karyawan.module';
import { UploadModule } from './upload/upload.module';
import { BlacklistModule } from './blacklist/blacklist.module';
import { WawancaraModule } from './wawancara/wawancara.module';
import { JadwalKerjaModule } from './jadwalkerja/jadwal-kerja.module';
import { KaryawanJadwalModule } from './jadwalkaryawan/karyawan-jadwal.module';
import { PresensiModule } from './presensi/presensi.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false, // Disable directory listing
        // Optional: Add cache control for better performance
        setHeaders: (res) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
        },
      },
    }),

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // folder uploads
      serveRoot: '/uploads',
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    DepartmentModule,
    UploadModule,
    JabatanModule,
    KaryawanModule,
    BlacklistModule,
    WawancaraModule,
    JadwalKerjaModule,
    KaryawanJadwalModule,
    PresensiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
