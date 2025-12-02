/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { PengajuanLemburService } from './pengajuan-lembur.service';
import {
  CreatePengajuanLemburDto,
  UpdatePengajuanLemburDto,
  StatusPersetujuan,
} from './dto/pengajuan-lembur.dto';
import { createResponse } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@ApiTags('Pengajuan Lembur')
@Controller('pengajuan-lembur')
export class PengajuanLemburController {
  constructor(
    private readonly pengajuanLemburService: PengajuanLemburService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat pengajuan lembur baru' })
  @ApiResponse({ status: 201, description: 'Pengajuan lembur berhasil dibuat' })
  async create(@Body() createDto: CreatePengajuanLemburDto) {
    const data = await this.pengajuanLemburService.create(createDto);
    return createResponse(
      HttpStatus.CREATED,
      RESPONSE_MESSAGES.PENGAJUANLEMBUR.CREATED,
      data,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua pengajuan lembur' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'idKaryawan', required: false })
  @ApiQuery({ name: 'idAtasan', required: false })
  @ApiQuery({ name: 'status', required: false, enum: StatusPersetujuan })
  @ApiQuery({ name: 'tanggalLembur', required: false, example: '2025-01-15' })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Daftar pengajuan lembur' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('idKaryawan') idKaryawan?: string,
    @Query('idAtasan') idAtasan?: string,
    @Query('status') status?: StatusPersetujuan,
    @Query('tanggalLembur') tanggalLembur?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.pengajuanLemburService.findAll(
      parseInt(page),
      parseInt(limit),
      { idKaryawan, idAtasan, status, tanggalLembur, startDate, endDate },
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANLEMBUR.LIST,
      result.data,
      result.meta,
    );
  }

  @Get('karyawan/:idKaryawan/total')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get total jam lembur by karyawan & period' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
  @ApiQuery({ name: 'month', required: true, example: 1 })
  @ApiQuery({ name: 'year', required: true, example: 2025 })
  @ApiResponse({ status: 200, description: 'Total jam lembur' })
  async getTotalJamLembur(
    @Param('idKaryawan') idKaryawan: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const data = await this.pengajuanLemburService.getTotalJamLembur(
      idKaryawan,
      parseInt(month),
      parseInt(year),
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANLEMBUR.TOTAL_JAM,
      data,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get pengajuan lembur by ID' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Lembur (UUID)' })
  @ApiResponse({ status: 200, description: 'Detail pengajuan lembur' })
  async findOne(@Param('id') id: string) {
    const data = await this.pengajuanLemburService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANLEMBUR.FOUND,
      data,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update pengajuan lembur' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Lembur (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Pengajuan lembur berhasil diupdate',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePengajuanLemburDto,
  ) {
    const data = await this.pengajuanLemburService.update(id, updateDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANLEMBUR.UPDATED,
      data,
    );
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve pengajuan lembur' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Lembur (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Pengajuan lembur berhasil disetujui',
  })
  async approve(
    @Param('id') id: string,
    @Body() body: { idAtasan: string; catatanAtasan?: string },
  ) {
    const data = await this.pengajuanLemburService.approve(
      id,
      body.idAtasan,
      body.catatanAtasan,
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANLEMBUR.APPROVED,
      data,
    );
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject pengajuan lembur' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Lembur (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Pengajuan lembur berhasil ditolak',
  })
  async reject(
    @Param('id') id: string,
    @Body() body: { idAtasan: string; catatanAtasan: string },
  ) {
    const data = await this.pengajuanLemburService.reject(
      id,
      body.idAtasan,
      body.catatanAtasan,
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANLEMBUR.REJECTED,
      data,
    );
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel pengajuan lembur (by karyawan)' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Lembur (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Pengajuan lembur berhasil dibatalkan',
  })
  async cancel(@Param('id') id: string) {
    const data = await this.pengajuanLemburService.cancel(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANLEMBUR.CANCELLED,
      data,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus pengajuan lembur' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Lembur (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Pengajuan lembur berhasil dihapus',
  })
  async remove(@Param('id') id: string) {
    await this.pengajuanLemburService.remove(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANLEMBUR.DELETED,
    );
  }
}
