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
    origin: process.env.CORS_ORIGIN || '*',
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
    .setDescription('API Documentation for HR IS')
    .setVersion('1.0')
    .addTag('Reference - Departemen')
    .addBearerAuth() // Siap untuk authentication nanti
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
