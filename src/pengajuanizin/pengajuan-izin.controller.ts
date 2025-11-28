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
import { PengajuanIzinService } from './pengajuan-izin.service';
import {
  CreatePengajuanIzinDto,
  UpdatePengajuanIzinDto,
  StatusPersetujuan,
} from './dto/pengajuan-izin.dto';
import { createResponse } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@ApiTags('Pengajuan Izin')
@Controller('pengajuan-izin')
export class PengajuanIzinController {
  constructor(private readonly pengajuanIzinService: PengajuanIzinService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat pengajuan izin baru' })
  @ApiResponse({ status: 201, description: 'Pengajuan izin berhasil dibuat' })
  async create(@Body() createDto: CreatePengajuanIzinDto) {
    const data = await this.pengajuanIzinService.create(createDto);
    return createResponse(
      HttpStatus.CREATED,
      RESPONSE_MESSAGES.PENGAJUANIZIN.CREATED,
      data,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua pengajuan izin' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'idKaryawan', required: false })
  @ApiQuery({ name: 'idAtasan', required: false })
  @ApiQuery({ name: 'status', required: false, enum: StatusPersetujuan })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Daftar pengajuan izin' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('idKaryawan') idKaryawan?: string,
    @Query('idAtasan') idAtasan?: string,
    @Query('status') status?: StatusPersetujuan,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.pengajuanIzinService.findAll(
      parseInt(page),
      parseInt(limit),
      { idKaryawan, idAtasan, status, startDate, endDate },
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.LIST,
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get pengajuan izin by ID' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiResponse({ status: 200, description: 'Detail pengajuan izin' })
  async findOne(@Param('id') id: string) {
    const data = await this.pengajuanIzinService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.FOUND,
      data,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update pengajuan izin' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiResponse({ status: 200, description: 'Pengajuan izin berhasil diupdate' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePengajuanIzinDto,
  ) {
    const data = await this.pengajuanIzinService.update(id, updateDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.UPDATED,
      data,
    );
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve pengajuan izin' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Pengajuan izin berhasil disetujui',
  })
  async approve(
    @Param('id') id: string,
    @Body() body: { idAtasan: string; catatanAtasan?: string },
  ) {
    const data = await this.pengajuanIzinService.approve(
      id,
      body.idAtasan,
      body.catatanAtasan,
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.APPROVED,
      data,
    );
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject pengajuan izin' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiResponse({ status: 200, description: 'Pengajuan izin berhasil ditolak' })
  async reject(
    @Param('id') id: string,
    @Body() body: { idAtasan: string; catatanAtasan: string },
  ) {
    const data = await this.pengajuanIzinService.reject(
      id,
      body.idAtasan,
      body.catatanAtasan,
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.REJECTED,
      data,
    );
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel pengajuan izin (by karyawan)' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Pengajuan izin berhasil dibatalkan',
  })
  async cancel(@Param('id') id: string) {
    const data = await this.pengajuanIzinService.cancel(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.CANCELLED,
      data,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus pengajuan izin' })
  @ApiParam({ name: 'id', description: 'ID Pengajuan Izin (UUID)' })
  @ApiResponse({ status: 200, description: 'Pengajuan izin berhasil dihapus' })
  async remove(@Param('id') id: string) {
    await this.pengajuanIzinService.remove(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.PENGAJUANIZIN.DELETED,
    );
  }
}
