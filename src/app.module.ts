// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentModule } from './department/department.module';
import { JabatanModule } from './jabatan/jabatan.module';
import { KaryawanModule } from './karyawan/karyawan.module';
import { UploadModule } from './upload/upload.module';
import { BlacklistModule } from './blacklist/blacklist.module';
import { WawancaraModule } from './wawancara/wawancara.module';
import { JadwalKerjaModule } from './jadwalkerja/jadwal-kerja.module';
import { KaryawanJadwalModule } from './jadwalkaryawan/karyawan-jadwal.module';
import { PresensiModule } from './presensi/presensi.module';
import { JenisIzinModule } from './jenisizin/jenis-izin.module';
import { SaldoCutiModule } from './saldocuti/saldo-cuti.module';
import { PengajuanIzinModule } from './pengajuanizin/pengajuan-izin.module';
import { PengajuanLemburModule } from './pengajuanlembur/pengajuan-lembur.module';
import { FormModule } from './form/form.module';
import { QuestionModule } from './question/question.module';
import { OptionModule } from './option/option.module';
import { AnswerModule } from './answer/answer.module';
import { JabatanPermissionModule } from './jabatan-permission/jabatan-permission.module';
import { PermissionModule } from './permission/permission.module';
// RoleModule dihapus — tidak ada lagi tabel role

@Module({
  imports: [
    // Static file serving
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        setHeaders: (res) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          res.set('Cache-Control', 'public, max-age=31536000');
        },
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Core
    PrismaModule,
    AuthModule,

    // Feature modules
    DepartmentModule,
    JabatanModule,
    KaryawanModule,
    UploadModule,
    BlacklistModule,
    WawancaraModule,
    JadwalKerjaModule,
    KaryawanJadwalModule,
    PresensiModule,
    JenisIzinModule,
    SaldoCutiModule,
    PengajuanIzinModule,
    PengajuanLemburModule,
    FormModule,
    QuestionModule,
    OptionModule,
    AnswerModule,
    PermissionModule,
    JabatanPermissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
