/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return callback(
      new BadRequestException(
        'Hanya file gambar yang diperbolehkan (jpg, jpeg, png, gif)',
      ),
      false,
    );
  }
  callback(null, true);
};

export const documentFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(pdf|doc|docx)$/i)) {
    return callback(
      new BadRequestException(
        'Hanya file dokumen yang diperbolehkan (pdf, doc, docx)',
      ),
      false,
    );
  }
  callback(null, true);
};

export const allFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/i)) {
    return callback(
      new BadRequestException('Format file tidak didukung'),
      false,
    );
  }
  callback(null, true);
};

// Multer config for memory storage (required for Cloudinary)
export const multerCloudinaryConfig: MulterOptions = {
  storage: undefined, // Use memory storage (default)
  fileFilter: allFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
};
