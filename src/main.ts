/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function setupUploadDirectories() {
  const uploadDirs = [
    'uploads',
    'uploads/photos',
    'uploads/cv',
    'uploads/documents',
    'uploads/others',
  ];

  console.log('\n📁 Setting up upload directories...');

  for (const dir of uploadDirs) {
    const dirPath = join(process.cwd(), dir);
    try {
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
        console.log(`  ✓ Created: ${dir}`);
      } else {
        console.log(`  ✓ Exists: ${dir}`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to create: ${dir}`, error);
    }
  }
  console.log('');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'ngrok-skip-browser-warning',
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use((req: any, res: any, next: any) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      console.log('\n🔍 RAW REQUEST CHECK:');
      console.log('- Readable:', req.readable);
      console.log('- ReadableEnded:', req.readableEnded);
      console.log(
        '- Body already parsed?:',
        Object.keys(req.body || {}).length > 0,
      );
    }
    next();
  });

  app.setGlobalPrefix('api');

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('HR Information System API')
    .setDescription(
      'Complete API Documentation for HR Information System\n\n' +
        'Features:\n' +
        '• Employee Management (Karyawan)\n' +
        '• Department & Position Management\n' +
        '• Blacklist Management\n' +
        '• Interview Management (HRD & User)\n' +
        '• File Upload with Cloudinary\n',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Departemen', 'Department management endpoints')
    .addTag('Jabatan', 'Position management endpoints')
    .addTag('Karyawan', 'Employee management endpoints')
    .addTag('Blacklist', 'Blacklist management endpoints')
    .addTag('Wawancara', 'Interview management endpoints (HRD & User)')
    .addTag('Upload', 'File upload to Cloudinary')
    .addTag('Jadwal Kerja', 'Work schedule management endpoints')
    .addTag('Jadwal Karyawan', 'Employee schedule management endpoints')
    .addTag('Presensi', 'Attendance management endpoints')
    .addTag('Jenis Izin', 'Leave type management endpoints')
    .addTag('Saldo Cuti', 'Leave balance management endpoints')
    .addTag('Pengajuan Izin', 'Leave application management endpoints')
    .addTag('Perizinan', 'Permission management endpoints')
    .addTag('Pengumuman', 'Announcement management endpoints')
    .addTag('Form', 'Dynamic form management endpoints')
    .addTag('Question', 'Dynamic question management endpoints')
    .addTag('Option', 'Dynamic option management endpoints')
    .addTag('Answer', 'Dynamic answer management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port);

  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`File upload: Cloudinary enabled`);
  console.log(`CORS enabled with enableCors()\n`);
}
bootstrap();
