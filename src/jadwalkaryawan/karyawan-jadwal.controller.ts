/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KaryawanJadwalService } from './karyawan-jadwal.service';
import {
  CreateKaryawanJadwalDto,
  QueryKaryawanJadwalDto,
  UpdateKaryawanJadwalDto,
} from './dto/karyawan-jadwal.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Karyawan Jadwal')
@Controller('karyawan-jadwal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class KaryawanJadwalController {
  constructor(private readonly karyawanJadwalService: KaryawanJadwalService) {}

  @Post()
  @RequirePermission('manage_jadwal_kerja', PERMISSION.CREATE)
  @ApiOperation({ summary: 'Assign jadwal ke karyawan' })
  create(@Body() createDto: CreateKaryawanJadwalDto) {
    return this.karyawanJadwalService.create(createDto);
  }

  @Get()
  @RequirePermission('manage_jadwal_kerja', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua karyawan jadwal' })
  async findAll(@Query() query: QueryKaryawanJadwalDto) {
    const result = await this.karyawanJadwalService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.KARYAWANJADWAL.LIST,
    );
  }

  @Get('karyawan/:idKaryawan/active')
  @ApiOperation({ summary: 'Get jadwal aktif karyawan' })
  async findActiveByKaryawan(
    @Param('idKaryawan') idKaryawan: string,
    @CurrentUser() user: any,
  ) {
    // Boleh lihat sendiri ATAU punya permission manage_jadwal_kerja
    const ownData = idKaryawan === user.idKaryawan;
    const hasPermission =
      user.permissions?.['manage_jadwal_kerja'] !== undefined;

    if (!ownData && !hasPermission) {
      throw new ForbiddenException('Anda hanya bisa melihat jadwal sendiri');
    }

    return this.karyawanJadwalService.findActiveByKaryawan(idKaryawan);
  }

  @Get('karyawan/:idKaryawan')
  @ApiOperation({ summary: 'Get semua jadwal karyawan' })
  async findByKaryawan(
    @Param('idKaryawan') idKaryawan: string,
    @CurrentUser() user: any,
  ) {
    // Boleh lihat sendiri ATAU punya permission manage_jadwal_kerja
    const ownData = idKaryawan === user.idKaryawan;
    const hasPermission =
      user.permissions?.['manage_jadwal_kerja'] !== undefined;

    if (!ownData && !hasPermission) {
      throw new ForbiddenException('Anda hanya bisa melihat jadwal sendiri');
    }

    return this.karyawanJadwalService.findByKaryawan(idKaryawan);
  }

  @Patch(':id')
  @RequirePermission('manage_jadwal_kerja', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Update karyawan jadwal' })
  update(@Param('id') id: string, @Body() updateDto: UpdateKaryawanJadwalDto) {
    return this.karyawanJadwalService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermission('manage_jadwal_kerja', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus karyawan jadwal' })
  remove(@Param('id') id: string) {
    return this.karyawanJadwalService.remove(id);
  }
}
