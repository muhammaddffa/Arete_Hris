import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFiles,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { KaryawanService } from './karyawan.service';
import { CreateKaryawanDto, UpdateKaryawanDto, FilterKaryawanDto } from './dto';
import { ResponseUtil } from '../common/utils/response.util';
import { UploadService } from '../upload/upload.service';
import { storage, allFileFilter } from '../upload/upload.config';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateKaryawanSchema,
  UpdateKaryawanSchema,
  FilterKaryawanSchema,
  ResignKaryawanSchema,
} from './karyawan.validation';

@ApiTags('Karyawan')
@Controller('karyawan')
export class KaryawanController {
  constructor(
    private readonly karyawanService: KaryawanService,
    private readonly uploadService: UploadService,
  ) {}

  // ============================================
  // CREATE KARYAWAN WITH FILE UPLOAD
  // ============================================
  @Post()
  @ApiOperation({ summary: 'Create karyawan with document uploads' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Karyawan berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'NIK or Email already exists' })
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
        nama: {
          type: 'string',
          example: 'John Doe',
          minLength: 3,
          maxLength: 100,
        },
        tempatLahir: { type: 'string', example: 'Jakarta', minLength: 3 },
        tanggalLahir: { type: 'string', format: 'date', example: '1995-05-15' },
        jenisKelamin: { type: 'string', enum: ['L', 'P'], example: 'L' },
        statusPernikahan: {
          type: 'string',
          enum: ['belum_menikah', 'menikah', 'cerai'],
          example: 'belum_menikah',
        },
        agama: { type: 'string', example: 'Islam', maxLength: 20 },
        noHpPribadi: { type: 'string', example: '081234567890' },
        idJabatan: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        tanggalMasuk: { type: 'string', format: 'date', example: '2024-01-01' },
        nik: {
          type: 'string',
          example: '3201012345678901',
          pattern: '^\\d{16}$',
        },
        npwp: { type: 'string', example: '12.345.678.9-012.345' },
        email: { type: 'string', example: 'john@example.com' },
        alamat: { type: 'string', maxLength: 500 },
        namaBank: { type: 'string', example: 'BCA', maxLength: 50 },
        nomorRekening: { type: 'string', example: '1234567890', maxLength: 50 },
        statusKeaktifan: { type: 'boolean', default: true },
        tanggalResign: { type: 'string', format: 'date' },
        status: {
          type: 'string',
          enum: ['aktif', 'candidate', 'rejected', 'resign'],
          default: 'candidate',
        },
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
        storage,
        fileFilter: allFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  async create(
    @Body(new ZodValidationPipe(CreateKaryawanSchema))
    createKaryawanDto: CreateKaryawanDto,
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
    try {
      // Add file paths to DTO
      if (files?.pasfoto?.[0]) {
        createKaryawanDto.pasfoto = files.pasfoto[0].path;
      }
      if (files?.skck?.[0]) {
        createKaryawanDto.skck = files.skck[0].path;
      }
      if (files?.suratKesehatan?.[0]) {
        createKaryawanDto.suratKesehatan = files.suratKesehatan[0].path;
      }
      if (files?.cv?.[0]) {
        createKaryawanDto.cv = files.cv[0].path;
      }

      const data = await this.karyawanService.create(createKaryawanDto);
      return ResponseUtil.created(data, 'Karyawan berhasil dibuat');
    } catch (error) {
      // Rollback: delete uploaded files if creation fails
      const uploadedFiles = Object.values(files || {})
        .flat()
        .filter(Boolean)
        .map((f) => f.path);

      if (uploadedFiles.length > 0) {
        await this.uploadService.deleteMultipleFiles(uploadedFiles);
      }

      throw error;
    }
  }

  // ============================================
  // GET ALL KARYAWAN WITH FILTERS
  // ============================================
  @Get()
  @ApiOperation({ summary: 'Get all karyawan with filters and pagination' })
  @ApiResponse({ status: 200, description: 'List of karyawan' })
  async findAll(
    @Query(new ZodValidationPipe(FilterKaryawanSchema))
    filterDto: FilterKaryawanDto,
  ) {
    const result = await this.karyawanService.findAll(filterDto);
    return ResponseUtil.success(result, 'Data karyawan berhasil diambil');
  }

  // ============================================
  // GET KARYAWAN BY ID
  // ============================================
  @Get(':id')
  @ApiOperation({ summary: 'Get karyawan by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Karyawan found' })
  @ApiResponse({ status: 404, description: 'Karyawan not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeUser') includeUser?: string,
  ) {
    const data = await this.karyawanService.findOne(id, includeUser === 'true');
    return ResponseUtil.success(data, 'Data karyawan berhasil diambil');
  }

  // ============================================
  // UPDATE KARYAWAN WITH FILE UPLOAD
  // ============================================
  @Patch(':id')
  @ApiOperation({ summary: 'Update karyawan with optional document uploads' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Karyawan successfully updated' })
  @ApiResponse({ status: 404, description: 'Karyawan not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nik: { type: 'string', pattern: '^\\d{16}$' },
        npwp: { type: 'string' },
        nama: { type: 'string', minLength: 3, maxLength: 100 },
        tempatLahir: { type: 'string', minLength: 3 },
        tanggalLahir: { type: 'string', format: 'date' },
        jenisKelamin: { type: 'string', enum: ['L', 'P'] },
        statusPernikahan: {
          type: 'string',
          enum: ['belum_menikah', 'menikah', 'cerai'],
        },
        agama: { type: 'string', maxLength: 20 },
        email: { type: 'string' },
        noHpPribadi: { type: 'string' },
        alamat: { type: 'string', maxLength: 500 },
        namaBank: { type: 'string', maxLength: 50 },
        nomorRekening: { type: 'string', maxLength: 50 },
        idJabatan: { type: 'string', format: 'uuid' },
        statusKeaktifan: { type: 'boolean' },
        tanggalMasuk: { type: 'string', format: 'date' },
        tanggalResign: { type: 'string', format: 'date' },
        status: {
          type: 'string',
          enum: ['aktif', 'candidate', 'rejected', 'resign'],
        },
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
        storage,
        fileFilter: allFileFilter,
        limits: { fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateKaryawanSchema))
    updateKaryawanDto: UpdateKaryawanDto,
    @UploadedFiles()
    files: {
      pasfoto?: Express.Multer.File[];
      skck?: Express.Multer.File[];
      suratKesehatan?: Express.Multer.File[];
      cv?: Express.Multer.File[];
    },
  ) {
    // Get existing karyawan file paths (RAW data without transform)
    const existing = await this.karyawanService.findOneRaw(id);
    const oldFiles: string[] = [];

    // Handle file replacements
    if (files?.pasfoto?.[0]) {
      if (existing.pasfoto) oldFiles.push(existing.pasfoto);
      updateKaryawanDto.pasfoto = files.pasfoto[0].path;
    }
    if (files?.skck?.[0]) {
      if (existing.skck) oldFiles.push(existing.skck);
      updateKaryawanDto.skck = files.skck[0].path;
    }
    if (files?.suratKesehatan?.[0]) {
      if (existing.suratKesehatan) oldFiles.push(existing.suratKesehatan);
      updateKaryawanDto.suratKesehatan = files.suratKesehatan[0].path;
    }
    if (files?.cv?.[0]) {
      if (existing.cv) oldFiles.push(existing.cv);
      updateKaryawanDto.cv = files.cv[0].path;
    }

    // Update karyawan
    const data = await this.karyawanService.update(id, updateKaryawanDto);

    // Delete old files after successful update
    if (oldFiles.length > 0) {
      await this.uploadService.deleteMultipleFiles(oldFiles);
    }

    return ResponseUtil.success(data, 'Karyawan berhasil diupdate');
  }

  // ============================================
  // DELETE KARYAWAN (SOFT DELETE)
  // ============================================
  @Delete(':id')
  @ApiOperation({ summary: 'Delete karyawan (soft delete)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Karyawan successfully deleted' })
  @ApiResponse({ status: 404, description: 'Karyawan not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.remove(id);
    return ResponseUtil.success(data, 'Karyawan berhasil dihapus');
  }

  // ============================================
  // APPROVE CANDIDATE
  // ============================================
  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve candidate to become active karyawan' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Candidate approved' })
  @ApiResponse({ status: 400, description: 'Only candidates can be approved' })
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
  @ApiResponse({ status: 200, description: 'Candidate rejected' })
  @ApiResponse({ status: 400, description: 'Only candidates can be rejected' })
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
        tanggalResign: {
          type: 'string',
          format: 'date',
          example: '2024-12-31',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Karyawan resigned' })
  @ApiResponse({ status: 400, description: 'Only active karyawan can resign' })
  async resignKaryawan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ResignKaryawanSchema))
    body: { tanggalResign?: string },
  ) {
    const data = await this.karyawanService.resignKaryawan(
      id,
      body.tanggalResign ? new Date(body.tanggalResign) : undefined,
    );
    return ResponseUtil.success(data, 'Karyawan berhasil resign');
  }

  // ============================================
  // GET KARYAWAN BY DEPARTEMEN
  // ============================================
  @Get('departemen/:idDepartemen')
  @ApiOperation({ summary: 'Get active karyawan by departemen' })
  @ApiParam({ name: 'idDepartemen', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of karyawan in departemen' })
  async getByDepartemen(
    @Param('idDepartemen', ParseUUIDPipe) idDepartemen: string,
  ) {
    const data = await this.karyawanService.getByDepartemen(idDepartemen);
    return ResponseUtil.success(data, 'Data karyawan berhasil diambil');
  }

  // ============================================
  // GET TEAM BY ATASAN
  // ============================================
  @Get('team/:idAtasan')
  @ApiOperation({ summary: 'Get team members by atasan ID' })
  @ApiParam({ name: 'idAtasan', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of team members' })
  async getTeamByAtasan(@Param('idAtasan', ParseUUIDPipe) idAtasan: string) {
    const data = await this.karyawanService.getTeamByAtasan(idAtasan);
    return ResponseUtil.success(data, 'Data team berhasil diambil');
  }

  // ============================================
  // GET KARYAWAN STATISTICS
  // ============================================
  @Get('stats/summary')
  @ApiOperation({ summary: 'Get karyawan statistics summary' })
  @ApiResponse({
    status: 200,
    description: 'Statistics summary',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        aktif: { type: 'number' },
        candidate: { type: 'number' },
        resign: { type: 'number' },
        rejected: { type: 'number' },
      },
    },
  })
  async getStats() {
    const data = await this.karyawanService.getStats();
    return ResponseUtil.success(data, 'Statistik karyawan berhasil diambil');
  }
}
