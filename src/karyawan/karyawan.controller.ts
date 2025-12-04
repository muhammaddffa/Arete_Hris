/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { KaryawanService } from './karyawan.service';
import { CreateKaryawanDto, UpdateKaryawanDto, FilterKaryawanDto } from './dto';
import { ResponseUtil } from '../common/utils/response.util';
import { UploadService } from '../upload/upload.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { allFileFilter } from '../upload/multer-cloudinary.config';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Karyawan')
@Controller('karyawan')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KaryawanController {
  constructor(
    private readonly karyawanService: KaryawanService,
    private readonly uploadService: UploadService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  // @RequirePermissions('create_karyawan')
  @Permissions('create_karyawan')
  @ApiOperation({
    summary: 'Create karyawan with document uploads to Cloudinary (HRD only)',
  })
  @ApiConsumes('multipart/form-data')
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
    const uploadedFiles: string[] = [];

    try {
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

      const data = await this.karyawanService.create(createKaryawanDto);
      return ResponseUtil.created(data, 'Karyawan berhasil dibuat');
    } catch (error) {
      if (uploadedFiles.length > 0) {
        await this.cloudinaryService.deleteMultipleFiles(uploadedFiles);
      }
      throw error;
    }
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('view_all_karyawan')
  @ApiOperation({ summary: 'Get all karyawan (HRD & Manager)' })
  async findAll(@Query() filterDto: FilterKaryawanDto) {
    const result = await this.karyawanService.findAll(filterDto);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      'Data karyawan berhasil diambil',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get karyawan by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeUser') includeUser?: string,
    @CurrentUser() user?: any,
  ) {
    if (
      id !== user.idKaryawan &&
      !user.permissions.includes('view_all_karyawan')
    ) {
      throw new ForbiddenException('Anda hanya bisa melihat data sendiri');
    }
    const data = await this.karyawanService.findOne(id, includeUser === 'true');
    return ResponseUtil.success(data, 'Data karyawan berhasil diambil');
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('edit_karyawan')
  @ApiOperation({ summary: 'Update karyawan with optional uploads (HRD only)' })
  @ApiConsumes('multipart/form-data')
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
    @CurrentUser() user: any,
  ) {
    if (
      !user.permissions.includes('manage_karyawan') &&
      id !== user.idKaryawan
    ) {
      throw new ForbiddenException('Anda hanya bisa update data sendiri');
    }

    const existing = await this.karyawanService.findOneRaw(id);
    const oldPublicIds: string[] = [];

    if (files?.pasfoto?.[0]) {
      if (existing.pasfoto)
        oldPublicIds.push(
          this.cloudinaryService.extractPublicId(existing.pasfoto)!,
        );
      const result = await this.cloudinaryService.uploadFile(files.pasfoto[0]);
      updateKaryawanDto.pasfoto = result.secureUrl;
    }

    if (files?.skck?.[0]) {
      if (existing.skck)
        oldPublicIds.push(
          this.cloudinaryService.extractPublicId(existing.skck)!,
        );
      const result = await this.cloudinaryService.uploadFile(files.skck[0]);
      updateKaryawanDto.skck = result.secureUrl;
    }

    if (files?.suratKesehatan?.[0]) {
      if (existing.suratKesehatan)
        oldPublicIds.push(
          this.cloudinaryService.extractPublicId(existing.suratKesehatan)!,
        );
      const result = await this.cloudinaryService.uploadFile(
        files.suratKesehatan[0],
      );
      updateKaryawanDto.suratKesehatan = result.secureUrl;
    }

    if (files?.cv?.[0]) {
      if (existing.cv)
        oldPublicIds.push(this.cloudinaryService.extractPublicId(existing.cv)!);
      const result = await this.cloudinaryService.uploadFile(files.cv[0]);
      updateKaryawanDto.cv = result.secureUrl;
    }

    const data = await this.karyawanService.update(id, updateKaryawanDto);

    if (oldPublicIds.length > 0) {
      await this.cloudinaryService.deleteMultipleFiles(oldPublicIds);
    }

    return ResponseUtil.success(data, 'Karyawan berhasil diupdate');
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('manage_karyawan')
  @ApiOperation({ summary: 'Delete karyawan (HRD only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const existing = await this.karyawanService.findOneRaw(id);
    const data = await this.karyawanService.remove(id);
    return ResponseUtil.success(data, 'Karyawan berhasil dihapus');
  }

  @Post(':id/approve')
  @UseGuards(PermissionsGuard)
  @Permissions('manage_karyawan')
  @ApiOperation({ summary: 'Approve candidate (HRD only)' })
  async approveCandidate(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.approveCandidate(id);
    return ResponseUtil.success(data, 'Candidate berhasil di-approve');
  }

  @Post(':id/reject')
  @UseGuards(PermissionsGuard)
  @Permissions('manage_karyawan')
  @ApiOperation({ summary: 'Reject candidate (HRD only)' })
  async rejectCandidate(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.rejectCandidate(id);
    return ResponseUtil.success(data, 'Candidate berhasil di-reject');
  }

  @Post(':id/resign')
  @UseGuards(PermissionsGuard)
  @Permissions('manage_karyawan')
  @ApiOperation({ summary: 'Resign karyawan (HRD only)' })
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
}
