import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JabatanPermissionService } from './jabatan-permission.service';
import {
  AssignPermissionDto,
  BulkAssignPermissionsDto,
  UpdatePermissionLevelDto,
  FilterJabatanPermissionDto,
} from './dto/jabatan-permission.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';

@ApiTags('Jabatan Permission Management')
@Controller('jabatan-permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JabatanPermissionController {
  constructor(
    private readonly jabatanPermissionService: JabatanPermissionService,
  ) {}

  // ===============================================
  // GET ALL AVAILABLE PERMISSIONS
  // ===============================================
  @Get('available')
  @RequirePermission('manage_jabatan', PERMISSION.READ)
  @ApiOperation({ summary: 'Get all available permissions in system' })
  async getAvailablePermissions() {
    const data = await this.jabatanPermissionService.getAvailablePermissions();
    return ResponseUtil.success(data, 'Daftar permission tersedia');
  }

  // ===============================================
  // GET PERMISSION MATRIX
  // ===============================================
  @Get('matrix')
  @RequirePermission('manage_jabatan', PERMISSION.READ)
  @ApiOperation({ summary: 'Get permission matrix (all jabatans)' })
  @ApiQuery({ name: 'idDepartemen', required: false })
  async getPermissionMatrix(@Query() filterDto: FilterJabatanPermissionDto) {
    const data =
      await this.jabatanPermissionService.getPermissionMatrix(filterDto);
    return ResponseUtil.success(data, 'Permission matrix berhasil diambil');
  }

  // ===============================================
  // GET JABATAN PERMISSIONS
  // ===============================================
  @Get('jabatan/:idJabatan')
  @RequirePermission('manage_jabatan', PERMISSION.READ)
  @ApiOperation({ summary: 'Get all permissions for specific jabatan' })
  @ApiParam({ name: 'idJabatan', description: 'Jabatan ID (UUID)' })
  async getJabatanPermissions(
    @Param('idJabatan', ParseUUIDPipe) idJabatan: string,
  ) {
    const data =
      await this.jabatanPermissionService.getJabatanPermissions(idJabatan);
    return ResponseUtil.success(data, 'Permissions jabatan berhasil diambil');
  }

  // ===============================================
  // ASSIGN SINGLE PERMISSION
  // ===============================================
  @Post('jabatan/:idJabatan/assign')
  @RequirePermission('manage_jabatan', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign single permission to jabatan' })
  @ApiParam({ name: 'idJabatan', description: 'Jabatan ID (UUID)' })
  async assignPermission(
    @Param('idJabatan', ParseUUIDPipe) idJabatan: string,
    @Body() assignDto: AssignPermissionDto,
  ) {
    const data = await this.jabatanPermissionService.assignPermission(
      idJabatan,
      assignDto,
    );
    return ResponseUtil.created(data, 'Permission berhasil di-assign');
  }

  // ===============================================
  // BULK ASSIGN PERMISSIONS
  // ===============================================
  @Post('jabatan/:idJabatan/bulk-assign')
  @RequirePermission('manage_jabatan', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk assign permissions to jabatan (replace all)' })
  @ApiParam({ name: 'idJabatan', description: 'Jabatan ID (UUID)' })
  async bulkAssignPermissions(
    @Param('idJabatan', ParseUUIDPipe) idJabatan: string,
    @Body() bulkDto: BulkAssignPermissionsDto,
  ) {
    const data = await this.jabatanPermissionService.bulkAssignPermissions(
      idJabatan,
      bulkDto,
    );
    return ResponseUtil.created(data, 'Bulk assign berhasil');
  }

  // ===============================================
  // UPDATE PERMISSION LEVEL
  // ===============================================
  @Patch('jabatan/:idJabatan/permission/:idPermission')
  @RequirePermission('manage_jabatan', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Update permission level for jabatan' })
  @ApiParam({ name: 'idJabatan', description: 'Jabatan ID (UUID)' })
  @ApiParam({ name: 'idPermission', description: 'Permission ID (UUID)' })
  async updatePermissionLevel(
    @Param('idJabatan', ParseUUIDPipe) idJabatan: string,
    @Param('idPermission', ParseUUIDPipe) idPermission: string,
    @Body() updateDto: UpdatePermissionLevelDto,
  ) {
    const data = await this.jabatanPermissionService.updatePermissionLevel(
      idJabatan,
      idPermission,
      updateDto,
    );
    return ResponseUtil.success(data, 'Permission level berhasil diupdate');
  }

  // ===============================================
  // REMOVE PERMISSION
  // ===============================================
  @Delete('jabatan/:idJabatan/permission/:idPermission')
  @RequirePermission('manage_jabatan', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove permission from jabatan' })
  @ApiParam({ name: 'idJabatan', description: 'Jabatan ID (UUID)' })
  @ApiParam({ name: 'idPermission', description: 'Permission ID (UUID)' })
  async removePermission(
    @Param('idJabatan', ParseUUIDPipe) idJabatan: string,
    @Param('idPermission', ParseUUIDPipe) idPermission: string,
  ) {
    const data = await this.jabatanPermissionService.removePermission(
      idJabatan,
      idPermission,
    );
    return ResponseUtil.success(data, 'Permission berhasil dihapus');
  }

  // ===============================================
  // COMPARE TWO JABATANS
  // ===============================================
  @Get('compare/:idJabatan1/:idJabatan2')
  @RequirePermission('manage_jabatan', PERMISSION.READ)
  @ApiOperation({ summary: 'Compare permissions between two jabatans' })
  @ApiParam({ name: 'idJabatan1', description: 'First Jabatan ID (UUID)' })
  @ApiParam({ name: 'idJabatan2', description: 'Second Jabatan ID (UUID)' })
  async compareJabatans(
    @Param('idJabatan1', ParseUUIDPipe) idJabatan1: string,
    @Param('idJabatan2', ParseUUIDPipe) idJabatan2: string,
  ) {
    const data = await this.jabatanPermissionService.compareJabatans(
      idJabatan1,
      idJabatan2,
    );
    return ResponseUtil.success(data, 'Perbandingan berhasil diambil');
  }

  // ===============================================
  // CLONE PERMISSIONS
  // ===============================================
  @Post('clone')
  @RequirePermission('manage_jabatan', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clone permissions from one jabatan to another' })
  @ApiQuery({ name: 'from', description: 'Source Jabatan ID (UUID)' })
  @ApiQuery({ name: 'to', description: 'Target Jabatan ID (UUID)' })
  async clonePermissions(
    @Query('from', ParseUUIDPipe) fromJabatan: string,
    @Query('to', ParseUUIDPipe) toJabatan: string,
  ) {
    const data = await this.jabatanPermissionService.clonePermissions(
      fromJabatan,
      toJabatan,
    );
    return ResponseUtil.created(data, 'Clone permissions berhasil');
  }
}
