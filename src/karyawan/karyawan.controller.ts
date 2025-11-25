/* eslint-disable @typescript-eslint/no-unused-vars */
// src/karyawan/karyawan.controller.ts (UPDATED FOR CLOUDINARY)

import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UploadedFiles,
  UseInterceptors,
  ParseUUIDPipe,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { KaryawanService } from './karyawan.service';
import { CreateKaryawanDto, UpdateKaryawanDto, FilterKaryawanDto } from './dto';
import { ResponseUtil } from '../common/utils/response.util';
import { UploadService } from '../upload/upload.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { allFileFilter } from '../upload/multer-cloudinary.config';

@ApiTags('Karyawan')
@Controller('karyawan')
export class KaryawanController {
  constructor(
    private readonly karyawanService: KaryawanService,
    private readonly uploadService: UploadService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ============================================
  // CREATE KARYAWAN WITH CLOUDINARY UPLOAD
  // ============================================
  @Post()
  @ApiOperation({
    summary: 'Create karyawan with document uploads to Cloudinary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'nama',
        'tempatLahir',
        'tanggalLahir',
        'jenisKelamin',
        'statusPernikahan',
        'agama',
        'noHpPribadi',
        'idJabatan',
        'tanggalMasuk',
      ],
      properties: {
        // Required text fields
        nama: { type: 'string', example: 'John Doe', minLength: 3 },
        tempatLahir: { type: 'string', example: 'Jakarta' },
        tanggalLahir: { type: 'string', format: 'date', example: '1995-05-15' },
        jenisKelamin: { type: 'string', enum: ['L', 'P'] },
        statusPernikahan: {
          type: 'string',
          enum: ['belum_menikah', 'menikah', 'cerai'],
        },
        agama: { type: 'string', example: 'Islam' },
        noHpPribadi: { type: 'string', example: '081234567890' },
        idJabatan: { type: 'string', format: 'uuid' },
        tanggalMasuk: { type: 'string', format: 'date' },

        // Optional text fields
        nik: { type: 'string', pattern: '^\\d{16}$' },
        npwp: { type: 'string' },
        email: { type: 'string' },
        alamat: { type: 'string' },
        namaBank: { type: 'string' },
        nomorRekening: { type: 'string' },
        statusKeaktifan: { type: 'boolean' },
        status: {
          type: 'string',
          enum: ['aktif', 'candidate', 'rejected', 'resign'],
        },

        // File uploads
        pasfoto: { type: 'string', format: 'binary' },
        nik_file: { type: 'string', format: 'binary' },
        npwp_file: { type: 'string', format: 'binary' },
        skck: { type: 'string', format: 'binary' },
        suratKesehatan: { type: 'string', format: 'binary' },
        cv: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pasfoto', maxCount: 1 },
        { name: 'nik_file', maxCount: 1 },
        { name: 'npwp_file', maxCount: 1 },
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
  async create(
    @Body() createKaryawanDto: CreateKaryawanDto,
    @UploadedFiles()
    files: {
      pasfoto?: Express.Multer.File[];
      nik_file?: Express.Multer.File[];
      npwp_file?: Express.Multer.File[];
      skck?: Express.Multer.File[];
      suratKesehatan?: Express.Multer.File[];
      cv?: Express.Multer.File[];
    },
  ) {
    const uploadedFiles: string[] = []; // Track uploaded files for rollback

    try {
      // Upload files to Cloudinary and add URLs to DTO
      if (files?.pasfoto?.[0]) {
        const result = await this.cloudinaryService.uploadFile(
          files.pasfoto[0],
        );
        createKaryawanDto.pasfoto = result.secureUrl;
        uploadedFiles.push(result.publicId);
      }

      if (files?.skck?.[0]) {
        const result = await this.cloudinaryService.uploadFile(files.skck[0]);
        createKaryawanDto.skck = result.secureUrl;
        uploadedFiles.push(result.publicId);
      }

      if (files?.suratKesehatan?.[0]) {
        const result = await this.cloudinaryService.uploadFile(
          files.suratKesehatan[0],
        );
        createKaryawanDto.suratKesehatan = result.secureUrl;
        uploadedFiles.push(result.publicId);
      }

      if (files?.cv?.[0]) {
        const result = await this.cloudinaryService.uploadFile(files.cv[0]);
        createKaryawanDto.cv = result.secureUrl;
        uploadedFiles.push(result.publicId);
      }

      // Create karyawan in database
      const data = await this.karyawanService.create(createKaryawanDto);
      return ResponseUtil.created(data, 'Karyawan berhasil dibuat');
    } catch (error) {
      // ROLLBACK: Delete uploaded files from Cloudinary if creation fails
      if (uploadedFiles.length > 0) {
        await this.cloudinaryService.deleteMultipleFiles(uploadedFiles);
      }
      throw error;
    }
  }

  // ============================================
  // GET ALL KARYAWAN
  // ============================================
  @Get()
  @ApiOperation({ summary: 'Get all karyawan with filters and pagination' })
  async findAll(@Query() filterDto: FilterKaryawanDto) {
    const result = await this.karyawanService.findAll(filterDto);
    return ResponseUtil.success(result, 'Data karyawan berhasil diambil');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get karyawan by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeUser') includeUser?: string,
  ) {
    const data = await this.karyawanService.findOne(id, includeUser === 'true');
    return ResponseUtil.success(data, 'Data karyawan berhasil diambil');
  }

  // ============================================
  // UPDATE KARYAWAN WITH CLOUDINARY UPLOAD
  // ============================================
  @Patch(':id')
  @ApiOperation({
    summary: 'Update karyawan with optional document uploads to Cloudinary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // All text fields optional for update
        nik: { type: 'string' },
        nama: { type: 'string' },
        email: { type: 'string' },
        noHpPribadi: { type: 'string' },
        alamat: { type: 'string' },
        idJabatan: { type: 'string', format: 'uuid' },

        // File uploads (will replace existing)
        pasfoto: { type: 'string', format: 'binary' },
        skck: { type: 'string', format: 'binary' },
        suratKesehatan: { type: 'string', format: 'binary' },
        cv: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pasfoto', maxCount: 1 },
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
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateKaryawanDto: UpdateKaryawanDto,
    @UploadedFiles()
    files: {
      pasfoto?: Express.Multer.File[];
      skck?: Express.Multer.File[];
      suratKesehatan?: Express.Multer.File[];
      cv?: Express.Multer.File[];
    },
  ) {
    // Get existing karyawan to get old Cloudinary URLs
    const existing = await this.karyawanService.findOneRaw(id);
    const oldPublicIds: string[] = [];

    // Handle file replacements
    if (files?.pasfoto?.[0]) {
      if (existing.pasfoto) {
        const publicId = this.cloudinaryService.extractPublicId(
          existing.pasfoto,
        );
        if (publicId) oldPublicIds.push(publicId);
      }
      const result = await this.cloudinaryService.uploadFile(files.pasfoto[0]);
      updateKaryawanDto.pasfoto = result.secureUrl;
    }

    if (files?.skck?.[0]) {
      if (existing.skck) {
        const publicId = this.cloudinaryService.extractPublicId(existing.skck);
        if (publicId) oldPublicIds.push(publicId);
      }
      const result = await this.cloudinaryService.uploadFile(files.skck[0]);
      updateKaryawanDto.skck = result.secureUrl;
    }

    if (files?.suratKesehatan?.[0]) {
      if (existing.suratKesehatan) {
        const publicId = this.cloudinaryService.extractPublicId(
          existing.suratKesehatan,
        );
        if (publicId) oldPublicIds.push(publicId);
      }
      const result = await this.cloudinaryService.uploadFile(
        files.suratKesehatan[0],
      );
      updateKaryawanDto.suratKesehatan = result.secureUrl;
    }

    if (files?.cv?.[0]) {
      if (existing.cv) {
        const publicId = this.cloudinaryService.extractPublicId(existing.cv);
        if (publicId) oldPublicIds.push(publicId);
      }
      const result = await this.cloudinaryService.uploadFile(files.cv[0]);
      updateKaryawanDto.cv = result.secureUrl;
    }

    // Update karyawan in database
    const data = await this.karyawanService.update(id, updateKaryawanDto);

    // Delete old files from Cloudinary after successful update
    if (oldPublicIds.length > 0) {
      await this.cloudinaryService.deleteMultipleFiles(oldPublicIds);
    }

    return ResponseUtil.success(data, 'Karyawan berhasil diupdate');
  }

  // ============================================
  // DELETE KARYAWAN (with Cloudinary cleanup)
  // ============================================
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete karyawan (soft delete) and cleanup Cloudinary files',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    // Get karyawan files before delete
    const existing = await this.karyawanService.findOneRaw(id);

    // Soft delete
    const data = await this.karyawanService.remove(id);

    return ResponseUtil.success(data, 'Karyawan berhasil dihapus');
  }

  // ============================================
  // APPROVE CANDIDATE
  // ============================================
  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve candidate to become active karyawan' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async approveCandidate(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.approveCandidate(id);
    return ResponseUtil.success(data, 'Candidate berhasil di-approve');
  }

  // ============================================
  // REJECT CANDIDATE
  // ============================================
  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject candidate' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async rejectCandidate(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.rejectCandidate(id);
    return ResponseUtil.success(data, 'Candidate berhasil di-reject');
  }

  // ============================================
  // RESIGN KARYAWAN
  // ============================================
  @Post(':id/resign')
  @ApiOperation({ summary: 'Resign active karyawan' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tanggalResign: { type: 'string', format: 'date' },
      },
    },
  })
  async resignKaryawan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { tanggalResign?: string },
  ) {
    const data = await this.karyawanService.resignKaryawan(
      id,
      body.tanggalResign ? new Date(body.tanggalResign) : undefined,
    );
    return ResponseUtil.success(data, 'Karyawan berhasil resign');
  }

  // ... other endpoints (stats, team, etc.)
}
