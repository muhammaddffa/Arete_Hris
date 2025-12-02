/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { ResponseUtil } from 'src/common/utils/response.util';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Karyawan Jadwal')
@Controller('karyawan-jadwal')
@UseGuards(JwtAuthGuard) // ✅ Semua endpoint harus login
@ApiBearerAuth()
export class KaryawanJadwalController {
  constructor(private readonly karyawanJadwalService: KaryawanJadwalService) {}

  // CREATE - Hanya HRD
  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_jadwal_kerja')
  @ApiOperation({ summary: 'Assign jadwal ke karyawan (HRD only)' })
  create(@Body() createDto: CreateKaryawanJadwalDto) {
    return this.karyawanJadwalService.create(createDto);
  }

  // GET ALL - HRD & Manager
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_all_karyawan')
  @ApiOperation({ summary: 'Get semua karyawan jadwal (HRD & Manager)' })
  async findAll(@Query() query: QueryKaryawanJadwalDto) {
    const result = await this.karyawanJadwalService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.KARYAWANJADWAL.LIST,
    );
  }

  // GET BY KARYAWAN - HRD, Manager, atau Karyawan sendiri
  @Get('karyawan/:idKaryawan')
  @ApiOperation({ summary: 'Get jadwal by karyawan' })
  async findByKaryawan(
    @Param('idKaryawan') idKaryawan: string,
    @CurrentUser() user: any,
  ) {
    // Validasi: User hanya bisa lihat jadwal sendiri kecuali HRD/Manager
    if (
      idKaryawan !== user.idKaryawan &&
      !user.permissions.includes('view_all_karyawan')
    ) {
      throw new ForbiddenException('Anda hanya bisa melihat jadwal sendiri');
    }
    return this.karyawanJadwalService.findByKaryawan(idKaryawan);
  }

  // GET ACTIVE - Semua yang login (untuk diri sendiri)
  @Get('karyawan/:idKaryawan/active')
  @ApiOperation({ summary: 'Get jadwal aktif karyawan' })
  async findActiveByKaryawan(
    @Param('idKaryawan') idKaryawan: string,
    @CurrentUser() user: any,
  ) {
    // Validasi ownership
    if (
      idKaryawan !== user.idKaryawan &&
      !user.permissions.includes('view_all_karyawan')
    ) {
      throw new ForbiddenException('Anda hanya bisa melihat jadwal sendiri');
    }
    return this.karyawanJadwalService.findActiveByKaryawan(idKaryawan);
  }

  // UPDATE - Hanya HRD
  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_jadwal_kerja')
  @ApiOperation({ summary: 'Update karyawan jadwal (HRD only)' })
  update(@Param('id') id: string, @Body() updateDto: UpdateKaryawanJadwalDto) {
    return this.karyawanJadwalService.update(id, updateDto);
  }

  // DELETE - Hanya HRD
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_jadwal_kerja')
  @ApiOperation({ summary: 'Hapus karyawan jadwal (HRD only)' })
  remove(@Param('id') id: string) {
    return this.karyawanJadwalService.remove(id);
  }
}
