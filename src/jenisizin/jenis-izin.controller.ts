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
import { JenisIzinService } from './jenis-izin.service';
import { CreateJenisIzinDto, UpdateJenisIzinDto } from './dto/jenis-izin.dto';
import { createResponse } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@ApiTags('Jenis Izin')
@Controller('jenis-izin')
export class JenisIzinController {
  constructor(private readonly jenisIzinService: JenisIzinService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat jenis izin baru' })
  @ApiResponse({ status: 201, description: 'Jenis izin berhasil dibuat' })
  @ApiResponse({ status: 409, description: 'Kode izin sudah digunakan' })
  async create(@Body() createDto: CreateJenisIzinDto) {
    const data = await this.jenisIzinService.create(createDto);
    return createResponse(
      HttpStatus.CREATED,
      RESPONSE_MESSAGES.JENISIZIN.CREATED,
      data,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua jenis izin' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Daftar jenis izin' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const result = await this.jenisIzinService.findAll(
      parseInt(page),
      parseInt(limit),
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JENISIZIN.LIST,
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get jenis izin by ID' })
  @ApiParam({ name: 'id', description: 'ID Jenis Izin (INT)' })
  @ApiResponse({ status: 200, description: 'Detail jenis izin' })
  @ApiResponse({ status: 404, description: 'Jenis izin tidak ditemukan' })
  async findOne(@Param('id') id: string) {
    const data = await this.jenisIzinService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JENISIZIN.FOUND,
      data,
    );
  }

  @Get('kode/:kodeIzin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get jenis izin by kode' })
  @ApiParam({ name: 'kodeIzin', description: 'Kode Izin' })
  @ApiResponse({ status: 200, description: 'Detail jenis izin' })
  @ApiResponse({ status: 404, description: 'Jenis izin tidak ditemukan' })
  async findByKode(@Param('kodeIzin') kodeIzin: string) {
    const data = await this.jenisIzinService.findByKode(kodeIzin);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JENISIZIN.FOUND,
      data,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update jenis izin' })
  @ApiParam({ name: 'id', description: 'ID Jenis Izin (INT)' })
  @ApiResponse({ status: 200, description: 'Jenis izin berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Jenis izin tidak ditemukan' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateJenisIzinDto) {
    const data = await this.jenisIzinService.update(id, updateDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JENISIZIN.UPDATED,
      data,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus jenis izin' })
  @ApiParam({ name: 'id', description: 'ID Jenis Izin (INT)' })
  @ApiResponse({ status: 200, description: 'Jenis izin berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Jenis izin tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'Jenis izin sedang digunakan' })
  async remove(@Param('id') id: string) {
    await this.jenisIzinService.remove(id);
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.JENISIZIN.DELETED);
  }
}
