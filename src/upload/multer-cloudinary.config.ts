/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const imageFileFilter = (req: any, file: any, callback: any) => {
  console.log('🎯 IMAGE FILTER CALLED:', file.originalname);
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
  console.log('🎯 DOCUMENT FILTER CALLED:', file.originalname);
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
  console.log('🎯 ALL FILE FILTER CALLED:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  }); // ⬅️ TAMBAHKAN

  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/i)) {
    console.log('❌ File rejected:', file.originalname);
    return callback(
      new BadRequestException('Format file tidak didukung'),
      false,
    );
  }

  console.log('✅ File accepted:', file.originalname);
  callback(null, true);
};

// Multer config for memory storage (required for Cloudinary)
export const multerCloudinaryConfig: MulterOptions = {
  storage: undefined,
  fileFilter: allFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
};
