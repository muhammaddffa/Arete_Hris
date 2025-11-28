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
import { SaldoCutiService } from './saldo-cuti.service';
import { CreateSaldoCutiDto, UpdateSaldoCutiDto } from './dto/saldo-cuti.dto';
import { createResponse } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@ApiTags('Saldo Cuti')
@Controller('saldo-cuti')
export class SaldoCutiController {
  constructor(private readonly saldoCutiService: SaldoCutiService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat saldo cuti baru' })
  @ApiResponse({ status: 201, description: 'Saldo cuti berhasil dibuat' })
  @ApiResponse({
    status: 409,
    description: 'Saldo cuti untuk tahun ini sudah ada',
  })
  async create(@Body() createDto: CreateSaldoCutiDto) {
    const data = await this.saldoCutiService.create(createDto);
    return createResponse(
      HttpStatus.CREATED,
      RESPONSE_MESSAGES.SALDOCUTI.CREATED,
      data,
    );
  }

  @Post('auto-create/:tahun')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Auto-create saldo cuti untuk semua karyawan aktif',
  })
  @ApiParam({ name: 'tahun', description: 'Tahun saldo cuti', example: 2025 })
  @ApiResponse({
    status: 201,
    description: 'Saldo cuti tahunan berhasil dibuat',
  })
  async autoCreateYearlySaldo(@Param('tahun') tahun: string) {
    const data = await this.saldoCutiService.autoCreateYearlySaldo(
      parseInt(tahun),
    );
    return createResponse(
      HttpStatus.CREATED,
      RESPONSE_MESSAGES.SALDOCUTI.AUTO_CREATED,
      { created: data.length, saldoList: data },
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua saldo cuti' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'idKaryawan',
    required: false,
    description: 'Filter by karyawan',
  })
  @ApiQuery({
    name: 'tahun',
    required: false,
    example: 2025,
    description: 'Filter by tahun',
  })
  @ApiResponse({ status: 200, description: 'Daftar saldo cuti' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('idKaryawan') idKaryawan?: string,
    @Query('tahun') tahun?: string,
  ) {
    const result = await this.saldoCutiService.findAll(
      parseInt(page),
      parseInt(limit),
      idKaryawan,
      tahun ? parseInt(tahun) : undefined,
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.SALDOCUTI.LIST,
      result.data,
      result.meta,
    );
  }

  @Get('karyawan/:idKaryawan/tahun/:tahun')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get saldo cuti by karyawan dan tahun' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
  @ApiParam({ name: 'tahun', description: 'Tahun', example: 2025 })
  @ApiResponse({ status: 200, description: 'Detail saldo cuti' })
  @ApiResponse({ status: 404, description: 'Saldo cuti tidak ditemukan' })
  async findByKaryawanAndYear(
    @Param('idKaryawan') idKaryawan: string,
    @Param('tahun') tahun: string,
  ) {
    const data = await this.saldoCutiService.findByKaryawanAndYear(
      idKaryawan,
      parseInt(tahun),
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.SALDOCUTI.FOUND,
      data,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get saldo cuti by ID' })
  @ApiParam({ name: 'id', description: 'ID Saldo Cuti (UUID)' })
  @ApiResponse({ status: 200, description: 'Detail saldo cuti' })
  @ApiResponse({ status: 404, description: 'Saldo cuti tidak ditemukan' })
  async findOne(@Param('id') id: string) {
    const data = await this.saldoCutiService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.SALDOCUTI.FOUND,
      data,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update saldo cuti' })
  @ApiParam({ name: 'id', description: 'ID Saldo Cuti (UUID)' })
  @ApiResponse({ status: 200, description: 'Saldo cuti berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Saldo cuti tidak ditemukan' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateSaldoCutiDto) {
    const data = await this.saldoCutiService.update(id, updateDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.SALDOCUTI.UPDATED,
      data,
    );
  }

  @Post('deduct')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kurangi saldo cuti (internal use)' })
  @ApiResponse({ status: 200, description: 'Saldo cuti berhasil dikurangi' })
  async deductSaldo(
    @Body() body: { idKaryawan: string; tahun: number; jumlahHari: number },
  ) {
    const data = await this.saldoCutiService.deductSaldo(
      body.idKaryawan,
      body.tahun,
      body.jumlahHari,
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.SALDOCUTI.DEDUCTED,
      data,
    );
  }

  @Post('restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kembalikan saldo cuti (internal use)' })
  @ApiResponse({ status: 200, description: 'Saldo cuti berhasil dikembalikan' })
  async restoreSaldo(
    @Body() body: { idKaryawan: string; tahun: number; jumlahHari: number },
  ) {
    const data = await this.saldoCutiService.restoreSaldo(
      body.idKaryawan,
      body.tahun,
      body.jumlahHari,
    );
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.SALDOCUTI.RESTORED,
      data,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus saldo cuti' })
  @ApiParam({ name: 'id', description: 'ID Saldo Cuti (UUID)' })
  @ApiResponse({ status: 200, description: 'Saldo cuti berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Saldo cuti tidak ditemukan' })
  async remove(@Param('id') id: string) {
    await this.saldoCutiService.remove(id);
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.SALDOCUTI.DELETED);
  }
}
