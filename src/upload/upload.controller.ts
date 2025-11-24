import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Delete,
  Body,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { storage, imageFileFilter, allFileFilter } from './upload.config';
import { ResponseUtil } from '../common/utils/response.util';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // ============================================
  // SINGLE FILE UPLOAD
  // ============================================
  @Post('single')
  @ApiOperation({ summary: 'Upload single file (any type)' })
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
      storage,
      fileFilter: allFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  // eslint-disable-next-line @typescript-eslint/require-await
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const response = this.uploadService.formatFileResponse(file);
    return ResponseUtil.success(response, 'File berhasil diupload');
  }

  // ============================================
  // MULTIPLE FILES UPLOAD (same field)
  // ============================================
  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files (max 5)' })
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
      storage,
      fileFilter: allFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  // eslint-disable-next-line @typescript-eslint/require-await
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const response = files.map((file) =>
      this.uploadService.formatFileResponse(file),
    );

    return ResponseUtil.success(
      { files: response },
      `${files.length} file berhasil diupload`,
    );
  }

  // ============================================
  // KARYAWAN DOCUMENTS UPLOAD (multiple fields)
  // ============================================
  @Post('karyawan-documents')
  @ApiOperation({ summary: 'Upload karyawan documents (NIK, NPWP, SKCK, etc)' })
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
        storage,
        fileFilter: allFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  // eslint-disable-next-line @typescript-eslint/require-await
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

    // Validate file sizes
    Object.entries(files).forEach(([fieldname, fileArray]) => {
      if (fileArray && fileArray.length > 0) {
        this.uploadService.validateFileSize(fileArray[0], fieldname);
      }
    });

    // Format response
    const response: any = {};
    Object.entries(files).forEach(([fieldname, fileArray]) => {
      if (fileArray && fileArray.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        response[fieldname] = this.uploadService.formatFileResponse(
          fileArray[0],
        );
      }
    });

    return ResponseUtil.success(response, 'Dokumen karyawan berhasil diupload');
  }

  // ============================================
  // PHOTO UPLOAD (pasfoto only)
  // ============================================
  @Post('photo')
  @ApiOperation({ summary: 'Upload photo (pasfoto) - max 2MB' })
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
      storage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  // eslint-disable-next-line @typescript-eslint/require-await
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Photo tidak ditemukan');
    }

    const response = this.uploadService.formatFileResponse(file);
    return ResponseUtil.success(response, 'Photo berhasil diupload');
  }

  // ============================================
  // DELETE FILE
  // ============================================
  @Delete('file')
  @ApiOperation({ summary: 'Delete uploaded file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filepath: {
          type: 'string',
          example: 'uploads/photos/pasfoto-1234567890.jpg',
        },
      },
    },
  })
  async deleteFile(@Body('filepath') filepath: string) {
    if (!filepath) {
      throw new BadRequestException('Filepath tidak boleh kosong');
    }

    const deleted = await this.uploadService.deleteFile(filepath);

    if (deleted) {
      return ResponseUtil.success(null, 'File berhasil dihapus');
    } else {
      throw new BadRequestException('File tidak ditemukan atau gagal dihapus');
    }
  }
}
