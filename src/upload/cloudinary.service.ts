/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resourceType: string;
  folder: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    // Initialize Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'hris-arete',
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: `${folder}/${this.getFolderByFieldname(file.fieldname)}`,
        resource_type: 'auto' as const,
        transformation: this.getTransformationByFieldname(file.fieldname),
        tags: [file.fieldname, folder],
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            this.logger.error('Cloudinary upload error:', error);
            return reject(
              new BadRequestException('Failed to upload file to Cloudinary'),
            );
          }

          if (!result) {
            return reject(
              new BadRequestException('Upload result is undefined'),
            );
          }

          this.logger.log(`File uploaded successfully: ${result.public_id}`);

          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            resourceType: result.resource_type,
            folder: uploadOptions.folder,
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'hr-system',
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        this.logger.log(`File deleted successfully: ${publicId}`);
        return true;
      }

      this.logger.warn(`File not found or already deleted: ${publicId}`);
      return false;
    } catch (error) {
      this.logger.error(
        `Error deleting file from Cloudinary: ${publicId}`,
        error,
      );
      return false;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(publicIds: string[]): Promise<{
    success: string[];
    failed: string[];
  }> {
    const results = await Promise.all(
      publicIds.map(async (publicId) => ({
        publicId,
        deleted: await this.deleteFile(publicId),
      })),
    );

    const success = results.filter((r) => r.deleted).map((r) => r.publicId);
    const failed = results.filter((r) => !r.deleted).map((r) => r.publicId);

    this.logger.log(
      `Deleted ${success.length}/${publicIds.length} files from Cloudinary`,
    );

    return { success, failed };
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedImageUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
      quality?: number | 'auto';
      format?: string;
    },
  ): string {
    return cloudinary.url(publicId, {
      transformation: [
        {
          width: options?.width,
          height: options?.height,
          crop: options?.crop || 'fill',
          quality: options?.quality || 'auto',
          format: options?.format || 'auto',
        },
      ],
      secure: true,
    });
  }

  /**
   * Get folder name based on file field
   */
  private getFolderByFieldname(fieldname: string): string {
    const folderMap: Record<string, string> = {
      pasfoto: 'photos',
      photo: 'photos',
      cv: 'cv',
      nik: 'documents',
      nik_file: 'documents',
      npwp: 'documents',
      npwp_file: 'documents',
      skck: 'documents',
      suratKesehatan: 'documents',
    };

    return folderMap[fieldname] || 'others';
  }

  /**
   * Get transformation settings based on file type
   */
  private getTransformationByFieldname(fieldname: string): any[] {
    // Photo transformations (compress & optimize)
    if (['pasfoto', 'photo'].includes(fieldname)) {
      return [
        {
          width: 800,
          height: 800,
          crop: 'limit',
          quality: 'auto:good',
          format: 'auto',
        },
      ];
    }

    // Document transformations (keep original but optimize)
    if (
      [
        'cv',
        'nik',
        'nik_file',
        'npwp',
        'npwp_file',
        'skck',
        'suratKesehatan',
      ].includes(fieldname)
    ) {
      return [
        {
          quality: 'auto:good',
          format: 'auto',
        },
      ];
    }

    return [];
  }

  /**
   * Validate file size before upload
   */
  validateFileSize(file: Express.Multer.File, fieldname: string): void {
    const limits: Record<string, number> = {
      pasfoto: 2 * 1024 * 1024, // 2MB
      photo: 2 * 1024 * 1024,
      cv: 10 * 1024 * 1024, // 10MB
      nik: 5 * 1024 * 1024, // 5MB
      nik_file: 5 * 1024 * 1024,
      npwp: 5 * 1024 * 1024,
      npwp_file: 5 * 1024 * 1024,
      skck: 5 * 1024 * 1024,
      suratKesehatan: 5 * 1024 * 1024,
      default: 10 * 1024 * 1024,
    };

    const maxSize = limits[fieldname] || limits.default;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File ${fieldname} terlalu besar. Maksimal ${maxSize / (1024 * 1024)}MB`,
      );
    }
  }

  /**
   * Extract public_id from Cloudinary URL
   */
  extractPublicId(url: string): string | null {
    try {
      // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
      const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
      return matches ? matches[1] : null;
    } catch {
      return null;
    }
  }
}
