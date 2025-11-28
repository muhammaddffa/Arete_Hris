import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
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
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:5173', // Ganti dengan URL frontend React Anda
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
