// src/permission/permission.controller.ts

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
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  FilterPermissionDto,
} from './dto/permission.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';

@ApiTags('Permission CRUD')
@Controller('permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // ============================================================
  // GET ALL — dengan pagination & search
  // ============================================================
  @Get()
  @RequirePermission('manage_permission', PERMISSION.READ)
  @ApiOperation({ summary: 'Get semua permission (paginated)' })
  async findAll(@Query() filterDto: FilterPermissionDto) {
    const result = await this.permissionService.findAll(filterDto);
    return ResponseUtil.success(
      result.data,
      'Daftar permission berhasil diambil',
      result.meta,
    );
  }

  // ============================================================
  // GET ONE
  // ============================================================
  @Get(':id')
  @RequirePermission('manage_permission', PERMISSION.READ)
  @ApiOperation({ summary: 'Get detail permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID (integer)' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.permissionService.findOne(id);
    return ResponseUtil.success(data, 'Detail permission berhasil diambil');
  }

  // ============================================================
  // CREATE
  // ============================================================
  @Post()
  @RequirePermission('manage_permission', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat permission baru' })
  async create(@Body() createDto: CreatePermissionDto) {
    const data = await this.permissionService.create(createDto);
    return ResponseUtil.created(
      data,
      `Permission '${data.namaPermission}' berhasil dibuat`,
    );
  }

  // ============================================================
  // UPDATE
  // ============================================================
  @Patch(':id')
  @RequirePermission('manage_permission', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Update permission' })
  @ApiParam({ name: 'id', description: 'Permission ID (integer)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePermissionDto,
  ) {
    const data = await this.permissionService.update(id, updateDto);
    return ResponseUtil.success(data, `Permission berhasil diupdate`);
  }

  // ============================================================
  // DELETE
  // ============================================================
  @Delete(':id')
  @RequirePermission('manage_permission', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus permission' })
  @ApiParam({ name: 'id', description: 'Permission ID (integer)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.permissionService.remove(id);
    return ResponseUtil.success(
      data,
      `Permission '${data.namaPermission}' berhasil dihapus`,
    );
  }
}
