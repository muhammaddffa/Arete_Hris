/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { JadwalKerjaService } from './jadwal-kerja.service';
import {
  CreateJadwalKerjaDto,
  QueryJadwalDto,
  UpdateJadwalKerjaDto,
} from './dto/jadwal-kerja.dto';
import { createResponse, ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@ApiTags('Jadwal Kerja')
@Controller('jadwal-kerja')
export class JadwalKerjaController {
  constructor(private readonly jadwalKerjaService: JadwalKerjaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat jadwal kerja baru' })
  @ApiResponse({ status: 201, description: 'Jadwal kerja berhasil dibuat' })
  @ApiResponse({ status: 409, description: 'Kode jadwal sudah digunakan' })
  async create(@Body() createDto: CreateJadwalKerjaDto) {
    const data = await this.jadwalKerjaService.create(createDto);
    return createResponse(
      HttpStatus.CREATED,
      RESPONSE_MESSAGES.JADWALKERJA.CREATED,
      data,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua jadwal kerja' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Daftar jadwal kerja' })
  async findAll(@Query() query: QueryJadwalDto) {
    const result = await this.jadwalKerjaService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.JADWALKERJA.LIST,
    );
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get statistik jadwal kerja' })
  @ApiResponse({ status: 200, description: 'Statistik jadwal kerja' })
  async getStatistics() {
    const data = await this.jadwalKerjaService.getStatistics();
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JADWALKERJA.STATISTICS,
      data,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get jadwal kerja by ID' })
  @ApiParam({ name: 'id', description: 'ID Jadwal Kerja (UUID)' })
  @ApiResponse({ status: 200, description: 'Detail jadwal kerja' })
  @ApiResponse({ status: 404, description: 'Jadwal kerja tidak ditemukan' })
  async findOne(@Param('id') id: string) {
    const data = await this.jadwalKerjaService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JADWALKERJA.FOUND,
      data,
    );
  }

  @Get('kode/:kodeJadwal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get jadwal kerja by kode' })
  @ApiParam({ name: 'kodeJadwal', description: 'Kode Jadwal' })
  @ApiResponse({ status: 200, description: 'Detail jadwal kerja' })
  @ApiResponse({ status: 404, description: 'Jadwal kerja tidak ditemukan' })
  async findByKode(@Param('kodeJadwal') kodeJadwal: string) {
    const data = await this.jadwalKerjaService.findByKode(kodeJadwal);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JADWALKERJA.FOUND,
      data,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update jadwal kerja' })
  @ApiParam({ name: 'id', description: 'ID Jadwal Kerja (UUID)' })
  @ApiResponse({ status: 200, description: 'Jadwal kerja berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Jadwal kerja tidak ditemukan' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateJadwalKerjaDto,
  ) {
    const data = await this.jadwalKerjaService.update(id, updateDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JADWALKERJA.UPDATED,
      data,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus jadwal kerja' })
  @ApiParam({ name: 'id', description: 'ID Jadwal Kerja (UUID)' })
  @ApiResponse({ status: 200, description: 'Jadwal kerja berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Jadwal kerja tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'Jadwal sedang digunakan' })
  async remove(@Param('id') id: string) {
    await this.jadwalKerjaService.remove(id);
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.JADWALKERJA.DELETED);
  }
}
