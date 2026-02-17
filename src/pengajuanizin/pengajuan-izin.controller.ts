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
  UseGuards,
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
  ApiBearerAuth,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';

@ApiTags('Pengajuan Izin')
@Controller('pengajuan-izin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PengajuanIzinController {
  constructor(
    private readonly pengajuanIzinService: PengajuanIzinService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @RequirePermission('submit_izin', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat pengajuan izin baru' })
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
  async create(
    @Body() createDto: CreatePengajuanIzinDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let uploadedPublicId: string | null = null;

    try {
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
      if (uploadedPublicId) {
        await this.cloudinaryService.deleteFile(uploadedPublicId);
      }
      throw error;
    }
  }

  @Get()
  @RequirePermission('submit_izin', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua pengajuan izin' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'idKaryawan', required: false })
  @ApiQuery({ name: 'idAtasan', required: false })
  @ApiQuery({ name: 'status', required: false, enum: StatusPersetujuan })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-12-31' })
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

  @Get(':id')
  @RequirePermission('submit_izin', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get detail pengajuan izin by ID' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.pengajuanIzinService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.FOUND,
      data,
    );
  }

  @Patch(':id')
  @RequirePermission('submit_izin', PERMISSION.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update pengajuan izin' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @UseInterceptors(
    FileInterceptor('bukti', {
      fileFilter: allFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePengajuanIzinDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const existing = await this.pengajuanIzinService.findOneRaw(id);
    const oldPublicIds: string[] = [];

    if (file) {
      if (existing.pathBukti) {
        const publicId = this.cloudinaryService.extractPublicId(
          existing.pathBukti,
        );
        if (publicId) oldPublicIds.push(publicId);
      }
      const result = await this.cloudinaryService.uploadFile(file);
      updateDto.pathBukti = result.secureUrl;
    }

    const data = await this.pengajuanIzinService.update(id, updateDto);

    if (oldPublicIds.length > 0) {
      await this.cloudinaryService.deleteMultipleFiles(oldPublicIds);
    }

    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.UPDATED,
      data,
    );
  }

  @Post(':id/approve')
  @RequirePermission('approve_izin', PERMISSION.CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve pengajuan izin' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
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

  @Post(':id/reject')
  @RequirePermission('approve_izin', PERMISSION.CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject pengajuan izin' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
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

  @Post(':id/cancel')
  @RequirePermission('submit_izin', PERMISSION.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel pengajuan izin' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.pengajuanIzinService.cancel(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.CANCELLED,
      data,
    );
  }

  @Delete(':id')
  @RequirePermission('submit_izin', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus pengajuan izin' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const existingData = await this.pengajuanIzinService.findOneRaw(id);

    if (existingData.pathBukti) {
      const publicId = this.cloudinaryService.extractPublicId(
        existingData.pathBukti,
      );
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
    }

    await this.pengajuanIzinService.remove(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.DELETED,
    );
  }
}
