import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { PengajuanIzinService } from './pengajuan-izin.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import {
  CreatePengajuanIzinDto,
  UpdatePengajuanIzinDto,
  StatusPersetujuan,
} from './dto/pengajuan-izin.dto';
import { createResponse } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { allFileFilter } from '../upload/multer-cloudinary.config';

@ApiTags('Pengajuan Izin')
@Controller('pengajuan-izin')
export class PengajuanIzinController {
  constructor(
    private readonly pengajuanIzinService: PengajuanIzinService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat pengajuan izin baru dengan file upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'idKaryawan',
        'idJenisIzin',
        'tanggalMulai',
        'tanggalSelesai',
        'jumlahHari',
        'keterangan',
      ],
      properties: {
        idKaryawan: { type: 'string', format: 'uuid' },
        idJenisIzin: { type: 'string', format: 'uuid' },
        tanggalMulai: { type: 'string', format: 'date', example: '2025-02-01' },
        tanggalSelesai: {
          type: 'string',
          format: 'date',
          example: '2025-02-03',
        },
        jumlahHari: { type: 'integer', example: 3, minimum: 1 },
        keterangan: { type: 'string', example: 'Keperluan keluarga' },
        idAtasan: { type: 'string', format: 'uuid', nullable: true },
        bukti: {
          type: 'string',
          format: 'binary',
          description: 'File bukti (optional) - Max 10MB',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('bukti', {
      fileFilter: allFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiResponse({ status: 201, description: 'Pengajuan izin berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validasi gagal' })
  async create(
    @Body() createDto: CreatePengajuanIzinDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let uploadedPublicId: string | null = null;

    try {
      // Upload file to Cloudinary if provided
      if (file) {
        const result = await this.cloudinaryService.uploadFile(file);
        createDto.pathBukti = result.secureUrl;
        uploadedPublicId = result.publicId;
      }

      const data = await this.pengajuanIzinService.create(createDto);
      return createResponse(
        HttpStatus.CREATED,
        RESPONSE_MESSAGES.PENGAJUANIZIN.CREATED,
        data,
      );
    } catch (error) {
      // ROLLBACK: Delete uploaded file if creation fails
      if (uploadedPublicId) {
        await this.cloudinaryService.deleteFile(uploadedPublicId);
      }
      throw error;
    }
  }

  // ============================================
  // GET ALL WITH FILTERS
  // ============================================
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get semua pengajuan izin dengan pagination dan filter',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'idKaryawan', required: false })
  @ApiQuery({ name: 'idAtasan', required: false })
  @ApiQuery({ name: 'status', required: false, enum: StatusPersetujuan })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Daftar pengajuan izin' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('idKaryawan') idKaryawan?: string,
    @Query('idAtasan') idAtasan?: string,
    @Query('status') status?: StatusPersetujuan,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.pengajuanIzinService.findAll(
      parseInt(page),
      parseInt(limit),
      { idKaryawan, idAtasan, status, startDate, endDate },
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.LIST,
      result.data,
      result.meta,
    );
  }

  // ============================================
  // GET ONE BY ID
  // ============================================
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get detail pengajuan izin by ID' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiResponse({ status: 200, description: 'Detail pengajuan izin' })
  @ApiResponse({ status: 404, description: 'Pengajuan izin tidak ditemukan' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.pengajuanIzinService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.FOUND,
      data,
    );
  }

  // ============================================
  // UPDATE WITH FILE UPLOAD
  // ============================================
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update pengajuan izin dengan/tanpa file upload' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idJenisIzin: { type: 'string', format: 'uuid', nullable: true },
        tanggalMulai: { type: 'string', format: 'date', nullable: true },
        tanggalSelesai: { type: 'string', format: 'date', nullable: true },
        jumlahHari: { type: 'integer', nullable: true },
        keterangan: { type: 'string', nullable: true },
        bukti: {
          type: 'string',
          format: 'binary',
          description: 'File bukti baru (optional) - akan replace file lama',
          nullable: true,
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('bukti', {
      fileFilter: allFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiResponse({ status: 200, description: 'Pengajuan izin berhasil diupdate' })
  @ApiResponse({
    status: 400,
    description: 'Pengajuan yang sudah disetujui/ditolak tidak dapat diupdate',
  })
  @ApiResponse({ status: 404, description: 'Pengajuan izin tidak ditemukan' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePengajuanIzinDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Get existing data to get old file URL
    const existing = await this.pengajuanIzinService.findOneRaw(id);
    const oldPublicIds: string[] = [];

    // Handle file replacement
    if (file) {
      // Extract and store old public_id for deletion
      if (existing.pathBukti) {
        const publicId = this.cloudinaryService.extractPublicId(
          existing.pathBukti,
        );
        if (publicId) oldPublicIds.push(publicId);
      }

      // Upload new file
      const result = await this.cloudinaryService.uploadFile(file);
      updateDto.pathBukti = result.secureUrl;
    }

    // Update in database
    const data = await this.pengajuanIzinService.update(id, updateDto);

    // Delete old files from Cloudinary after successful update
    if (oldPublicIds.length > 0) {
      await this.cloudinaryService.deleteMultipleFiles(oldPublicIds);
    }

    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.UPDATED,
      data,
    );
  }

  // ============================================
  // APPROVE
  // ============================================
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve pengajuan izin oleh atasan' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idAtasan: { type: 'string', format: 'uuid' },
        catatanAtasan: { type: 'string', nullable: true },
      },
      required: ['idAtasan'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Pengajuan izin berhasil disetujui',
  })
  @ApiResponse({
    status: 400,
    description: 'Hanya pengajuan dengan status pending yang dapat disetujui',
  })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { idAtasan: string; catatanAtasan?: string },
  ) {
    const data = await this.pengajuanIzinService.approve(
      id,
      body.idAtasan,
      body.catatanAtasan,
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.APPROVED,
      data,
    );
  }

  // ============================================
  // REJECT
  // ============================================
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject pengajuan izin oleh atasan' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idAtasan: { type: 'string', format: 'uuid' },
        catatanAtasan: { type: 'string' },
      },
      required: ['idAtasan', 'catatanAtasan'],
    },
  })
  @ApiResponse({ status: 200, description: 'Pengajuan izin berhasil ditolak' })
  @ApiResponse({
    status: 400,
    description: 'Hanya pengajuan dengan status pending yang dapat ditolak',
  })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { idAtasan: string; catatanAtasan: string },
  ) {
    const data = await this.pengajuanIzinService.reject(
      id,
      body.idAtasan,
      body.catatanAtasan,
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.REJECTED,
      data,
    );
  }

  // ============================================
  // CANCEL
  // ============================================
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel pengajuan izin (oleh karyawan)' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Pengajuan izin berhasil dibatalkan',
  })
  @ApiResponse({
    status: 400,
    description:
      'Pengajuan yang sudah ditolak atau dibatalkan tidak dapat dibatalkan lagi',
  })
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.pengajuanIzinService.cancel(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.CANCELLED,
      data,
    );
  }

  // ============================================
  // DELETE (with Cloudinary cleanup)
  // ============================================
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus pengajuan izin' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiResponse({ status: 200, description: 'Pengajuan izin berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Pengajuan izin tidak ditemukan' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    // Get data first to delete file from cloudinary
    const existingData = await this.pengajuanIzinService.findOneRaw(id);

    // Delete file from Cloudinary if exists
    if (existingData.pathBukti) {
      const publicId = this.cloudinaryService.extractPublicId(
        existingData.pathBukti,
      );
      if (publicId) {
        await this.cloudinaryService.deleteFile(publicId);
      }
    }

    await this.pengajuanIzinService.remove(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.DELETED,
    );
  }
}
