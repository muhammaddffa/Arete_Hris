/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import {
  CloudinaryService,
  CloudinaryUploadResult,
} from './cloudinary.service';
import { CloudinaryUploadResponseDto } from './dto/cloudinary-response.dto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private cloudinaryService: CloudinaryService) {}

  /**
   * Upload single file to Cloudinary
   */
  async uploadFile(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    // Validate file size
    this.cloudinaryService.validateFileSize(file, file.fieldname);

    // Upload to Cloudinary
    return this.cloudinaryService.uploadFile(file);
  }

  /**
   * Upload multiple files to Cloudinary
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
  ): Promise<CloudinaryUploadResult[]> {
    // Validate all files
    files.forEach((file) => {
      this.cloudinaryService.validateFileSize(file, file.fieldname);
    });

    // Upload all to Cloudinary
    return this.cloudinaryService.uploadMultipleFiles(files);
  }

  /**
   * Delete file from Cloudinary
   * @param publicIdOrUrl - Can be public_id or full Cloudinary URL
   */
  async deleteFile(publicIdOrUrl: string): Promise<boolean> {
    // Extract public_id if URL is provided
    const publicId = publicIdOrUrl.includes('cloudinary.com')
      ? this.cloudinaryService.extractPublicId(publicIdOrUrl)
      : publicIdOrUrl;

    if (!publicId) {
      this.logger.warn(`Invalid Cloudinary URL or public_id: ${publicIdOrUrl}`);
      return false;
    }

    return this.cloudinaryService.deleteFile(publicId);
  }

  /**
   * Delete multiple files from Cloudinary
   */
  async deleteMultipleFiles(publicIdsOrUrls: string[]): Promise<{
    success: string[];
    failed: string[];
  }> {
    const publicIds = publicIdsOrUrls
      .map((item) =>
        item.includes('cloudinary.com')
          ? this.cloudinaryService.extractPublicId(item)
          : item,
      )
      .filter(Boolean) as string[];

    return this.cloudinaryService.deleteMultipleFiles(publicIds);
  }

  /**
   * Get optimized image URL
   */
  getOptimizedImageUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number | 'auto';
    },
  ): string {
    return this.cloudinaryService.getOptimizedImageUrl(publicId, options);
  }

  /**
   * Format Cloudinary response for API
   */
  formatCloudinaryResponse(
    file: Express.Multer.File,
    cloudinaryResult: CloudinaryUploadResult,
  ): CloudinaryUploadResponseDto {
    return {
      fieldname: file.fieldname,
      originalname: file.originalname,
      url: cloudinaryResult.url,
      secureUrl: cloudinaryResult.secureUrl,
      publicId: cloudinaryResult.publicId,
      format: cloudinaryResult.format,
      bytes: cloudinaryResult.bytes,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      resourceType: cloudinaryResult.resourceType,
    };
  }
}
