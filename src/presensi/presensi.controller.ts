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
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Presensi')
@Controller('presensi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PresensiController {
  constructor(private readonly presensiService: PresensiService) {}

  @Post()
  @RequirePermission('manage_presensi', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
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
  @RequirePermission('view_presensi', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clock in karyawan' })
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
  @RequirePermission('view_presensi', PERMISSION.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clock out karyawan' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
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
  @RequirePermission('manage_presensi', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua presensi (HRD & Manager)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-01-31' })
  @ApiQuery({ name: 'idKaryawan', required: false })
  @ApiQuery({ name: 'statusKehadiran', required: false, enum: StatusKehadiran })
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

  @Get('my-presensi/summary')
  @RequirePermission('view_presensi', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get summary presensi sendiri' })
  @ApiQuery({ name: 'month', required: true, example: 1 })
  @ApiQuery({ name: 'year', required: true, example: 2025 })
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

  @Get('my-presensi')
  @RequirePermission('view_presensi', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get presensi sendiri' })
  @ApiQuery({ name: 'month', required: false, example: 1 })
  @ApiQuery({ name: 'year', required: false, example: 2025 })
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

  @Get('karyawan/:idKaryawan/summary')
  @RequirePermission('manage_presensi', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get summary presensi karyawan (HRD & Manager)' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
  @ApiQuery({ name: 'month', required: true, example: 1 })
  @ApiQuery({ name: 'year', required: true, example: 2025 })
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

  @Get('karyawan/:idKaryawan')
  @RequirePermission('manage_presensi', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get presensi by karyawan (HRD & Manager)' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
  @ApiQuery({ name: 'month', required: false, example: 1 })
  @ApiQuery({ name: 'year', required: false, example: 2025 })
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

  @Get(':id')
  @RequirePermission('manage_presensi', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get presensi by ID (HRD & Manager)' })
  @ApiParam({ name: 'id', description: 'ID Presensi (UUID)' })
  async findOne(@Param('id') id: string) {
    const data = await this.presensiService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PRESENSI.FOUND,
      data,
    );
  }

  @Patch(':id')
  @RequirePermission('manage_presensi', PERMISSION.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update presensi (HRD only)' })
  @ApiParam({ name: 'id', description: 'ID Presensi (UUID)' })
  async update(@Param('id') id: string, @Body() updateDto: UpdatePresensiDto) {
    const data = await this.presensiService.update(id, updateDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PRESENSI.UPDATED,
      data,
    );
  }

  @Delete(':id')
  @RequirePermission('manage_presensi', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus presensi (HRD only)' })
  @ApiParam({ name: 'id', description: 'ID Presensi (UUID)' })
  async remove(@Param('id') id: string) {
    await this.presensiService.remove(id);
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.PRESENSI.DELETED);
  }
}
