/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseUtil } from '../common/utils/response.util';
import { CloudinaryService } from '../upload/cloudinary.service';
import { allFileFilter } from '../upload/multer-cloudinary.config';

@ApiTags('Karyawan')
@Controller('karyawan')
@ApiBearerAuth()
export class KaryawanController {
  constructor(
    private karyawanService: KaryawanService,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * POST /karyawan
   * Create karyawan baru (status: candidate)
   * Required permission: 'create_karyawan'
   */
  @Post()
  @ApiOperation({ summary: 'Create karyawan (candidate)' })
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('create_karyawan')
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

    console.log('📁 Files received:', {
      pasfoto: files?.pasfoto?.[0]?.originalname,
      skck: files?.skck?.[0]?.originalname,
      suratKesehatan: files?.suratKesehatan?.[0]?.originalname,
      cv: files?.cv?.[0]?.originalname,
    });

    console.log('📝 Body (DTO):', createKaryawanDto);

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

  /**
   * GET /karyawan
   * Get all karyawan with filters
   * Required permission: 'view_karyawan' or 'view_all_karyawan'
   */
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('view_karyawan')
  @ApiOperation({ summary: 'Get all karyawan' })
  async findAll(@Query() filterDto: any) {
    const result = await this.karyawanService.findAll(filterDto);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      'Data karyawan berhasil diambil',
    );
  }

  /**
   * GET /karyawan/:id
   * Get karyawan by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get karyawan by ID' })
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

  /**
   * PATCH /karyawan/:id
   * Update karyawan
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('update_karyawan')
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
    @CurrentUser() user: any,
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('delete_karyawan')
  @ApiOperation({ summary: 'Delete karyawan' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.karyawanService.findOneRaw(id);
    const data = await this.karyawanService.remove(id);
    return ResponseUtil.success(data, 'Karyawan berhasil dihapus');
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('approve_candidate')
  @ApiOperation({ summary: 'Approve candidate' })
  async approveCandidate(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.approveCandidate(id);
    return ResponseUtil.success(data, 'Candidate berhasil di-approve');
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('reject_candidate')
  @ApiOperation({ summary: 'Reject candidate' })
  async rejectCandidate(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.rejectCandidate(id);
    return ResponseUtil.success(data, 'Candidate berhasil di-reject');
  }

  @Post(':id/resign')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('resign_karyawan')
  @ApiOperation({ summary: 'Resign karyawan' })
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

  @Post(':id/roles/assign')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage_roles')
  @ApiOperation({ summary: 'Assign custom roles to karyawan' })
  async assignCustomRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { roleIds: number[] },
  ) {
    const data = await this.karyawanService.assignCustomRole(id, body.roleIds);
    return ResponseUtil.success(data, 'Custom role berhasil di-assign');
  }

  @Post(':id/roles/reset')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage_roles')
  @ApiOperation({ summary: 'Reset roles to jabatan default' })
  async resetToJabatanRole(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.resetToJabatanRole(id);
    return ResponseUtil.success(data, 'Role berhasil direset');
  }

  @Post(':id/permissions/add')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage_permissions')
  @ApiOperation({ summary: 'Add permission override to karyawan' })
  async addPermissionOverride(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { idPermission: number; deskripsi?: string },
    @CurrentUser() user: any,
  ) {
    const data = await this.karyawanService.addPermissionOverride(
      id,
      body.idPermission,
      body.deskripsi,
      user.idKaryawan,
    );
    return ResponseUtil.success(data, 'Permission berhasil ditambahkan');
  }

  @Post(':id/permissions/remove')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage_permissions')
  @ApiOperation({ summary: 'Remove permission from karyawan' })
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
    return ResponseUtil.success(data, 'Permission berhasil dihapus');
  }

  @Delete(':id/permissions/:permissionId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage_permissions')
  @ApiOperation({ summary: 'Delete permission override' })
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get effective permissions for karyawan' })
  async getEffectivePermissions(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.getEffectivePermissions(id);
    return ResponseUtil.success(data, 'Effective permissions berhasil diambil');
  }

  @Get(':id/permissions/audit-logs')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('view_permissions')
  @ApiOperation({ summary: 'Get permission audit logs for karyawan' })
  async getPermissionAuditLogs(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.karyawanService.getPermissionAuditLogs(id);
    return ResponseUtil.success(data, 'Audit logs berhasil diambil');
  }

  @Get('permissions/audit-logs/all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage_permissions')
  @ApiOperation({ summary: 'Get all permission audit logs' })
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
