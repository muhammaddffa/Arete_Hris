import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';

// ============================================
// AUTO CREATE DIRECTORY HELPER
// ============================================
function ensureDirectoryExists(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  }
}

// ============================================
// FILE TYPE VALIDATION
// ============================================
export const imageFileFilter = (req: any, file: any, callback: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return callback(
      new BadRequestException(
        'Hanya file gambar yang diperbolehkan (jpg, jpeg, png, gif)',
      ),
      false,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  callback(null, true);
};

export const documentFileFilter = (req: any, file: any, callback: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  if (!file.originalname.match(/\.(pdf|doc|docx)$/i)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return callback(
      new BadRequestException(
        'Hanya file dokumen yang diperbolehkan (pdf, doc, docx)',
      ),
      false,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  callback(null, true);
};

export const allFileFilter = (req: any, file: any, callback: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/i)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return callback(
      new BadRequestException('Format file tidak didukung'),
      false,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  callback(null, true);
};

// ============================================
// STORAGE CONFIGURATION
// ============================================
export const storage = diskStorage({
  destination: (req, file, callback) => {
    let uploadPath = './uploads/';

    // Organize by file type
    if (file.fieldname === 'pasfoto' || file.fieldname === 'photo') {
      uploadPath += 'photos';
    } else if (file.fieldname === 'cv') {
      uploadPath += 'cv';
    } else if (
      [
        'nik',
        'nik_file',
        'npwp',
        'npwp_file',
        'skck',
        'suratKesehatan',
      ].includes(file.fieldname)
    ) {
      uploadPath += 'documents';
    } else {
      uploadPath += 'others';
    }

    // Create directory if it doesn't exist
    ensureDirectoryExists(uploadPath);

    callback(null, uploadPath);
  },
  filename: (req, file, callback) => {
    // Generate unique filename: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    callback(null, filename);
  },
});

// ============================================
// FILE SIZE LIMITS (in bytes)
// ============================================
export const fileSizeLimit = {
  pasfoto: 2 * 1024 * 1024, // 2MB
  photo: 2 * 1024 * 1024, // 2MB
  documents: 5 * 1024 * 1024, // 5MB
  cv: 10 * 1024 * 1024, // 10MB
  default: 10 * 1024 * 1024, // 10MB
};

// ============================================
// DTO FOR RESPONSE
// ============================================
export class UploadResponseDto {
  fieldname: string;
  originalname: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}

export class MultipleUploadResponseDto {
  files: UploadResponseDto[];
}

// ============================================
// INITIALIZE UPLOAD DIRECTORIES ON IMPORT
// ============================================
const uploadDirs = [
  './uploads/photos',
  './uploads/cv',
  './uploads/documents',
  './uploads/others',
];

uploadDirs.forEach((dir) => {
  ensureDirectoryExists(dir);
});
