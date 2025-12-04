/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PresensiService } from './presensi.service';
import {
  CreatePresensiDto,
  UpdatePresensiDto,
  ClockInDto,
  ClockOutDto,
  StatusKehadiran,
} from './dto/presensi.dto';
import { createResponse } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Presensi')
@Controller('presensi')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PresensiController {
  constructor(private readonly presensiService: PresensiService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_presensi')
  @ApiOperation({ summary: 'Buat presensi manual (HRD only)' })
  @ApiResponse({ status: 201, description: 'Presensi berhasil dibuat' })
  async create(@Body() createDto: CreatePresensiDto) {
    const data = await this.presensiService.create(createDto);
    return createResponse(
      HttpStatus.CREATED,
      RESPONSE_MESSAGES.PRESENSI.CREATED,
      data,
    );
  }

  @Post('clock-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clock in karyawan' })
  @ApiResponse({ status: 201, description: 'Clock in berhasil' })
  async clockIn(@Body() clockInDto: ClockInDto, @CurrentUser() user: any) {
    if (clockInDto.idKaryawan !== user.idKaryawan) {
      return createResponse(
        HttpStatus.FORBIDDEN,
        'Anda hanya bisa clock in untuk diri sendiri',
      );
    }

    const data = await this.presensiService.clockIn(clockInDto);
    return createResponse(
      HttpStatus.CREATED,
      RESPONSE_MESSAGES.PRESENSI.CLOCK_IN_SUCCESS,
      data,
    );
  }

  @Post('clock-out/:idKaryawan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clock out karyawan' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
  @ApiResponse({ status: 200, description: 'Clock out berhasil' })
  async clockOut(
    @Param('idKaryawan') idKaryawan: string,
    @Body() clockOutDto: ClockOutDto,
    @CurrentUser() user: any,
  ) {
    if (idKaryawan !== user.idKaryawan) {
      return createResponse(
        HttpStatus.FORBIDDEN,
        'Anda hanya bisa clock out untuk diri sendiri',
      );
    }

    const data = await this.presensiService.clockOut(idKaryawan, clockOutDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PRESENSI.CLOCK_OUT_SUCCESS,
      data,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_all_presensi') // ✅ Hanya HRD & Manager
  @ApiOperation({ summary: 'Get semua presensi dengan filter (HRD & Manager)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-01-31' })
  @ApiQuery({ name: 'idKaryawan', required: false })
  @ApiQuery({ name: 'statusKehadiran', required: false, enum: StatusKehadiran })
  @ApiResponse({ status: 200, description: 'Daftar presensi' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('idKaryawan') idKaryawan?: string,
    @Query('statusKehadiran') statusKehadiran?: StatusKehadiran,
  ) {
    const result = await this.presensiService.findAll(
      parseInt(page),
      parseInt(limit),
      { startDate, endDate, idKaryawan, statusKehadiran },
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PRESENSI.LIST,
      result.data,
      result.meta,
    );
  }

  @Get('my-presensi')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_presensi')
  @ApiOperation({ summary: 'Get presensi sendiri' })
  @ApiQuery({ name: 'month', required: false, example: 1 })
  @ApiQuery({ name: 'year', required: false, example: 2025 })
  @ApiResponse({ status: 200, description: 'Presensi Anda' })
  async getMyPresensi(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const data = await this.presensiService.findByKaryawan(
      user.idKaryawan,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
    return createResponse(HttpStatus.OK, 'Presensi Anda', data);
  }

  @Get('my-presensi/summary')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_presensi')
  @ApiOperation({ summary: 'Get summary presensi sendiri' })
  @ApiQuery({ name: 'month', required: true, example: 1 })
  @ApiQuery({ name: 'year', required: true, example: 2025 })
  @ApiResponse({ status: 200, description: 'Summary presensi Anda' })
  async getMySummary(
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const data = await this.presensiService.getSummary(
      user.idKaryawan,
      parseInt(month),
      parseInt(year),
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PRESENSI.SUMMARY,
      data,
    );
  }

  // GET BY KARYAWAN (HRD & Manager)
  @Get('karyawan/:idKaryawan')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_all_presensi') // ✅ Hanya HRD & Manager
  @ApiOperation({ summary: 'Get presensi by karyawan (HRD & Manager)' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
  @ApiQuery({ name: 'month', required: false, example: 1 })
  @ApiQuery({ name: 'year', required: false, example: 2025 })
  @ApiResponse({ status: 200, description: 'Daftar presensi karyawan' })
  async findByKaryawan(
    @Param('idKaryawan') idKaryawan: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const data = await this.presensiService.findByKaryawan(
      idKaryawan,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.PRESENSI.LIST, data);
  }

  // GET SUMMARY BY KARYAWAN (HRD & Manager)
  @Get('karyawan/:idKaryawan/summary')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_all_presensi') // ✅ Hanya HRD & Manager
  @ApiOperation({ summary: 'Get summary presensi karyawan (HRD & Manager)' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
  @ApiQuery({ name: 'month', required: true, example: 1 })
  @ApiQuery({ name: 'year', required: true, example: 2025 })
  @ApiResponse({ status: 200, description: 'Summary presensi karyawan' })
  async getSummary(
    @Param('idKaryawan') idKaryawan: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const data = await this.presensiService.getSummary(
      idKaryawan,
      parseInt(month),
      parseInt(year),
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PRESENSI.SUMMARY,
      data,
    );
  }

  // GET DETAIL BY ID (HRD & Manager)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_all_presensi') // ✅ Hanya HRD & Manager
  @ApiOperation({ summary: 'Get presensi by ID (HRD & Manager)' })
  @ApiParam({ name: 'id', description: 'ID Presensi (UUID)' })
  @ApiResponse({ status: 200, description: 'Detail presensi' })
  async findOne(@Param('id') id: string) {
    const data = await this.presensiService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PRESENSI.FOUND,
      data,
    );
  }

  // UPDATE (HRD Only)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_presensi') // ✅ Hanya HRD
  @ApiOperation({ summary: 'Update presensi (HRD only)' })
  @ApiParam({ name: 'id', description: 'ID Presensi (UUID)' })
  @ApiResponse({ status: 200, description: 'Presensi berhasil diupdate' })
  async update(@Param('id') id: string, @Body() updateDto: UpdatePresensiDto) {
    const data = await this.presensiService.update(id, updateDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PRESENSI.UPDATED,
      data,
    );
  }

  // DELETE (HRD Only)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_presensi') // ✅ Hanya HRD
  @ApiOperation({ summary: 'Hapus presensi (HRD only)' })
  @ApiParam({ name: 'id', description: 'ID Presensi (UUID)' })
  @ApiResponse({ status: 200, description: 'Presensi berhasil dihapus' })
  async remove(@Param('id') id: string) {
    await this.presensiService.remove(id);
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.PRESENSI.DELETED);
  }
}
