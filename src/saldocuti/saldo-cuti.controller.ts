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
import { SaldoCutiService } from './saldo-cuti.service';
import { CreateSaldoCutiDto, UpdateSaldoCutiDto } from './dto/saldo-cuti.dto';
import { createResponse } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';

@ApiTags('Saldo Cuti')
@Controller('saldo-cuti')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SaldoCutiController {
  constructor(private readonly saldoCutiService: SaldoCutiService) {}

  @Post()
  @RequirePermission('manage_saldo_cuti', PERMISSION.CREATE)
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
  @RequirePermission('manage_saldo_cuti', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Auto-create saldo cuti untuk semua karyawan aktif',
  })
  @ApiParam({ name: 'tahun', description: 'Tahun saldo cuti', example: 2025 })
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

  @Post('deduct')
  @RequirePermission('manage_saldo_cuti', PERMISSION.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kurangi saldo cuti' })
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
  @RequirePermission('manage_saldo_cuti', PERMISSION.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kembalikan saldo cuti' })
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

  @Get()
  @RequirePermission('manage_saldo_cuti', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua saldo cuti' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'idKaryawan', required: false })
  @ApiQuery({ name: 'tahun', required: false, example: 2025 })
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
  @RequirePermission('manage_saldo_cuti', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get saldo cuti by karyawan dan tahun' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
  @ApiParam({ name: 'tahun', description: 'Tahun', example: 2025 })
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
  @RequirePermission('manage_saldo_cuti', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get saldo cuti by ID' })
  @ApiParam({ name: 'id', description: 'ID Saldo Cuti (UUID)' })
  async findOne(@Param('id') id: string) {
    const data = await this.saldoCutiService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.SALDOCUTI.FOUND,
      data,
    );
  }

  @Patch(':id')
  @RequirePermission('manage_saldo_cuti', PERMISSION.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update saldo cuti' })
  @ApiParam({ name: 'id', description: 'ID Saldo Cuti (UUID)' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateSaldoCutiDto) {
    const data = await this.saldoCutiService.update(id, updateDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.SALDOCUTI.UPDATED,
      data,
    );
  }

  @Delete(':id')
  @RequirePermission('manage_saldo_cuti', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus saldo cuti' })
  @ApiParam({ name: 'id', description: 'ID Saldo Cuti (UUID)' })
  async remove(@Param('id') id: string) {
    await this.saldoCutiService.remove(id);
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.SALDOCUTI.DELETED);
  }
}
