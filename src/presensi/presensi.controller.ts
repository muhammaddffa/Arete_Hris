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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
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

@ApiTags('Presensi')
@Controller('presensi')
export class PresensiController {
  constructor(private readonly presensiService: PresensiService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat presensi baru (manual)' })
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
  async clockIn(@Body() clockInDto: ClockInDto) {
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
  ) {
    const data = await this.presensiService.clockOut(idKaryawan, clockOutDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PRESENSI.CLOCK_OUT_SUCCESS,
      data,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua presensi dengan filter' })
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

  @Get('karyawan/:idKaryawan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get presensi by karyawan' })
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

  @Get('karyawan/:idKaryawan/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get summary presensi karyawan' })
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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get presensi by ID' })
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

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update presensi' })
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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus presensi' })
  @ApiParam({ name: 'id', description: 'ID Presensi (UUID)' })
  @ApiResponse({ status: 200, description: 'Presensi berhasil dihapus' })
  async remove(@Param('id') id: string) {
    await this.presensiService.remove(id);
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.PRESENSI.DELETED);
  }
}
