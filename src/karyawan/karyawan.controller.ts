/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  UseGuards,
  Patch,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { KaryawanService } from './karyawan.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ResponseUtil } from '../common/utils/response.util';
import { CloudinaryService } from '../upload/cloudinary.service';
import { allFileFilter } from '../upload/multer-cloudinary.config';

@ApiTags('Karyawan')
@Controller('karyawan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class KaryawanController {
  constructor(
    private karyawanService: KaryawanService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ============================================================
  // KARYAWAN CRUD
  // ============================================================

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create karyawan baru (candidate)' })
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
  async create(
    @Req() req: any,
    @UploadedFiles()
    files: {
      pasfoto?: Express.Multer.File[];
      skck?: Express.Multer.File[];
      suratKesehatan?: Express.Multer.File[];
      cv?: Express.Multer.File[];
    },
  ) {
    const createKaryawanDto = req.body;
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
  @RequirePermission('view_karyawan', PERMISSION.READ)
  @ApiOperation({ summary: 'Get semua karyawan' })
  async findAll(@Query() filterDto: any) {
    const result = await this.karyawanService.findAll(filterDto);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      'Data karyawan berhasil diambil',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get karyawan by ID' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    // Boleh lihat data sendiri ATAU punya permission view_karyawan
    const ownData = id === user.idKaryawan;
    const hasPermission = user.permissions?.['view_karyawan'] !== undefined;

    if (!ownData && !hasPermission) {
      throw new ForbiddenException('Anda hanya bisa melihat data sendiri');
    }

    const data = await this.karyawanService.findOne(id);
    return ResponseUtil.success(data, 'Data karyawan berhasil diambil');
  }

  @Patch(':id')
  @RequirePermission('update_karyawan', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Update karyawan' })
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
    @Req() req: any,
    @UploadedFiles()
    files: {
      pasfoto?: Express.Multer.File[];
      skck?: Express.Multer.File[];
      suratKesehatan?: Express.Multer.File[];
      cv?: Express.Multer.File[];
    },
  ) {
    const updateKaryawanDto = req.body;
    const existing = await this.karyawanService.findOneRaw(id);
    const oldPublicIds: string[] = [];

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

    const data = await this.karyawanService.update(id, updateKaryawanDto);

    if (oldPublicIds.length > 0) {
      await this.cloudinaryService.deleteMultipleFiles(oldPublicIds);
    }

    return ResponseUtil.success(data, 'Karyawan berhasil diupdate');
  }

  @Delete(':id')
  @RequirePermission('delete_karyawan', PERMISSION.DELETE)
  @ApiOperation({ summary: 'Delete karyawan (soft delete)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.remove(id);
    return ResponseUtil.success(data, 'Karyawan berhasil dihapus');
  }

  // ============================================================
  // STATUS KARYAWAN
  // ============================================================

  @Post(':id/approve')
  @RequirePermission('approve_candidate', PERMISSION.CREATE)
  @ApiOperation({ summary: 'Approve candidate → aktifkan akun' })
  async approveCandidate(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.approveCandidate(id);
    return ResponseUtil.success(data, 'Candidate berhasil di-approve');
  }

  @Post(':id/reject')
  @RequirePermission('reject_candidate', PERMISSION.CREATE)
  @ApiOperation({ summary: 'Reject candidate' })
  async rejectCandidate(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.rejectCandidate(id);
    return ResponseUtil.success(data, 'Candidate berhasil di-reject');
  }

  @Post(':id/resign')
  @RequirePermission('resign_karyawan', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Proses resign karyawan' })
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

  // ============================================================
  // PERMISSION OVERRIDE
  // ============================================================

  @Post(':id/permissions/grant')
  @RequirePermission('manage_permission', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Grant permission override ke karyawan' })
  async addPermissionOverride(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: { idPermission: number; levelAkses: number; deskripsi?: string },
    @CurrentUser() user: any,
  ) {
    const data = await this.karyawanService.addPermissionOverride(
      id,
      body.idPermission,
      body.levelAkses,
      body.deskripsi,
      user.idKaryawan,
    );
    return ResponseUtil.success(data, 'Permission berhasil di-grant');
  }

  @Post(':id/permissions/revoke')
  @RequirePermission('manage_permission', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Revoke permission dari karyawan' })
  async removePermissionOverride(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { idPermission: number; deskripsi?: string },
    @CurrentUser() user: any,
  ) {
    const data = await this.karyawanService.removePermissionOverride(
      id,
      body.idPermission,
      body.deskripsi,
      user.idKaryawan,
    );
    return ResponseUtil.success(data, 'Permission berhasil di-revoke');
  }

  @Delete(':id/permissions/:permissionId')
  @RequirePermission('manage_permission', PERMISSION.DELETE)
  @ApiOperation({
    summary: 'Hapus permission override (kembali ke default jabatan)',
  })
  async deletePermissionOverride(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permissionId') permissionId: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.karyawanService.deletePermissionOverride(
      id,
      parseInt(permissionId),
      user.idKaryawan,
    );
    return ResponseUtil.success(data, 'Permission override berhasil dihapus');
  }

  @Get(':id/permissions/effective')
  @ApiOperation({ summary: 'Get effective permissions karyawan' })
  async getEffectivePermissions(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.getEffectivePermissions(id);
    return ResponseUtil.success(data, 'Effective permissions berhasil diambil');
  }

  @Get(':id/permissions/audit-logs')
  @RequirePermission('view_audit_log', PERMISSION.READ)
  @ApiOperation({ summary: 'Get permission audit logs karyawan' })
  async getPermissionAuditLogs(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.getPermissionAuditLogs(id);
    return ResponseUtil.success(data, 'Audit logs berhasil diambil');
  }

  @Get('permissions/audit-logs/all')
  @RequirePermission('view_audit_log', PERMISSION.READ)
  @ApiOperation({ summary: 'Get semua permission audit logs' })
  async getAllPermissionAuditLogs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('action') action?: string,
  ) {
    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (action) filters.action = action;

    const data = await this.karyawanService.getAllPermissionAuditLogs(filters);
    return ResponseUtil.success(data, 'Audit logs berhasil diambil');
  }
}
