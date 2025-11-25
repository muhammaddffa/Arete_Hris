/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
// src/upload/upload.controller.ts (UPDATED FOR CLOUDINARY)

import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Delete,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { CloudinaryService } from './cloudinary.service';
import { ResponseUtil } from '../common/utils/response.util';
import {
  imageFileFilter,
  documentFileFilter,
  allFileFilter,
} from './multer-cloudinary.config';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ============================================
  // SINGLE FILE UPLOAD TO CLOUDINARY
  // ============================================
  @Post('single')
  @ApiOperation({ summary: 'Upload single file to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: allFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const result = await this.uploadService.uploadFile(file);
    const response = this.uploadService.formatCloudinaryResponse(file, result);

    return ResponseUtil.success(
      response,
      'File berhasil diupload ke Cloudinary',
    );
  }

  // ============================================
  // MULTIPLE FILES UPLOAD TO CLOUDINARY
  // ============================================
  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files to Cloudinary (max 5)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      fileFilter: allFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const results = await this.uploadService.uploadMultipleFiles(files);
    const responses = files.map((file, index) =>
      this.uploadService.formatCloudinaryResponse(file, results[index]),
    );

    return ResponseUtil.success(
      { files: responses },
      `${files.length} file berhasil diupload ke Cloudinary`,
    );
  }

  // ============================================
  // KARYAWAN DOCUMENTS UPLOAD TO CLOUDINARY
  // ============================================
  @Post('karyawan-documents')
  @ApiOperation({ summary: 'Upload karyawan documents to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pasfoto: {
          type: 'string',
          format: 'binary',
          description: 'Photo (max 2MB)',
        },
        nik: {
          type: 'string',
          format: 'binary',
          description: 'NIK Document (max 5MB)',
        },
        npwp: {
          type: 'string',
          format: 'binary',
          description: 'NPWP Document (max 5MB)',
        },
        skck: {
          type: 'string',
          format: 'binary',
          description: 'SKCK Document (max 5MB)',
        },
        suratKesehatan: {
          type: 'string',
          format: 'binary',
          description: 'Health Certificate (max 5MB)',
        },
        cv: {
          type: 'string',
          format: 'binary',
          description: 'CV/Resume (max 10MB)',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pasfoto', maxCount: 1 },
        { name: 'nik', maxCount: 1 },
        { name: 'npwp', maxCount: 1 },
        { name: 'skck', maxCount: 1 },
        { name: 'suratKesehatan', maxCount: 1 },
        { name: 'cv', maxCount: 1 },
      ],
      {
        fileFilter: allFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  async uploadKaryawanDocuments(
    @UploadedFiles()
    files: {
      pasfoto?: Express.Multer.File[];
      nik?: Express.Multer.File[];
      npwp?: Express.Multer.File[];
      skck?: Express.Multer.File[];
      suratKesehatan?: Express.Multer.File[];
      cv?: Express.Multer.File[];
    },
  ) {
    if (!files || Object.keys(files).length === 0) {
      throw new BadRequestException('Tidak ada file yang diupload');
    }

    const response: any = {};

    // Upload each file to Cloudinary
    for (const [fieldname, fileArray] of Object.entries(files)) {
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];

        // Validate file size
        this.cloudinaryService.validateFileSize(file, fieldname);

        // Upload to Cloudinary
        const cloudinaryResult = await this.cloudinaryService.uploadFile(file);

        response[fieldname] = this.uploadService.formatCloudinaryResponse(
          file,
          cloudinaryResult,
        );
      }
    }

    return ResponseUtil.success(
      response,
      'Dokumen karyawan berhasil diupload ke Cloudinary',
    );
  }

  // ============================================
  // PHOTO UPLOAD TO CLOUDINARY
  // ============================================
  @Post('photo')
  @ApiOperation({ summary: 'Upload photo to Cloudinary - max 2MB' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: imageFileFilter,
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Photo tidak ditemukan');
    }

    const result = await this.uploadService.uploadFile(file);
    const response = this.uploadService.formatCloudinaryResponse(file, result);

    return ResponseUtil.success(
      response,
      'Photo berhasil diupload ke Cloudinary',
    );
  }

  // ============================================
  // DELETE FILE FROM CLOUDINARY
  // ============================================
  @Delete('file')
  @ApiOperation({ summary: 'Delete file from Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['publicId'],
      properties: {
        publicId: {
          type: 'string',
          example: 'hr-system/photos/abc123',
          description: 'Cloudinary public_id or full URL',
        },
      },
    },
  })
  async deleteFile(@Body('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Public ID tidak boleh kosong');
    }

    const deleted = await this.uploadService.deleteFile(publicId);

    if (deleted) {
      return ResponseUtil.success(
        null,
        'File berhasil dihapus dari Cloudinary',
      );
    } else {
      throw new BadRequestException('File tidak ditemukan atau gagal dihapus');
    }
  }

  // ============================================
  // GET OPTIMIZED IMAGE URL
  // ============================================
  @Get('optimize/:publicId')
  @ApiOperation({ summary: 'Get optimized image URL' })
  @ApiParam({
    name: 'publicId',
    description: 'Cloudinary public_id (without extension)',
    example: 'hr-system/photos/abc123',
  })
  async getOptimizedUrl(@Param('publicId') publicId: string) {
    const optimizedUrl = this.uploadService.getOptimizedImageUrl(publicId, {
      width: 400,
      height: 400,
      quality: 'auto',
    });

    return ResponseUtil.success(
      { url: optimizedUrl },
      'Optimized URL generated',
    );
  }
}
