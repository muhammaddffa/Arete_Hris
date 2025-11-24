import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { unlink, access } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { UploadResponseDto } from './upload.config';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  /**
   * Delete a single file
   */
  async deleteFile(filepath: string): Promise<boolean> {
    try {
      // Handle both relative and absolute paths
      const fullPath = filepath.startsWith('/')
        ? filepath
        : join(process.cwd(), filepath);

      // Check if file exists
      if (existsSync(fullPath)) {
        await unlink(fullPath);
        this.logger.log(`File deleted successfully: ${filepath}`);
        return true;
      }

      this.logger.warn(`File not found: ${filepath}`);
      return false;
    } catch (error) {
      this.logger.error(`Error deleting file: ${filepath}`, error);
      return false;
    }
  }

  async deleteMultipleFiles(filepaths: string[]): Promise<{
    success: string[];
    failed: string[];
  }> {
    const success: string[] = [];
    const failed: string[] = [];

    await Promise.all(
      filepaths.map(async (filepath) => {
        const deleted = await this.deleteFile(filepath);
        if (deleted) {
          success.push(filepath);
        } else {
          failed.push(filepath);
        }
      }),
    );

    this.logger.log(
      `Deleted ${success.length}/${filepaths.length} files successfully`,
    );

    return { success, failed };
  }

  /**
   * Validate file size based on field name
   */
  validateFileSize(file: Express.Multer.File, fieldname: string): void {
    const limits: Record<string, number> = {
      pasfoto: 2 * 1024 * 1024, // 2MB
      photo: 2 * 1024 * 1024, // 2MB
      cv: 10 * 1024 * 1024, // 10MB
      nik: 5 * 1024 * 1024, // 5MB
      nik_file: 5 * 1024 * 1024, // 5MB
      npwp: 5 * 1024 * 1024, // 5MB
      npwp_file: 5 * 1024 * 1024, // 5MB
      skck: 5 * 1024 * 1024, // 5MB
      suratKesehatan: 5 * 1024 * 1024, // 5MB
      default: 10 * 1024 * 1024, // 10MB
    };

    const maxSize = limits[fieldname] || limits.default;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File ${fieldname} terlalu besar. Maksimal ${maxSize / (1024 * 1024)}MB`,
      );
    }
  }

  /**
   * Format file response for API
   */
  formatFileResponse(file: Express.Multer.File): UploadResponseDto {
    return {
      fieldname: file.fieldname,
      originalname: file.originalname,
      filename: file.filename,
      path: file.path.replace(/\\/g, '/'), // Normalize path for Windows
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Check if file exists
   */
  async fileExists(filepath: string): Promise<boolean> {
    try {
      const fullPath = filepath.startsWith('/')
        ? filepath
        : join(process.cwd(), filepath);

      await access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file URL (for serving static files)
   */
  getFileUrl(filepath: string, baseUrl = ''): string {
    // Remove 'uploads/' prefix if exists for consistent URL
    const cleanPath = filepath.replace(/^\.?\/uploads\//, '');
    return `${baseUrl}/uploads/${cleanPath}`;
  }
}
