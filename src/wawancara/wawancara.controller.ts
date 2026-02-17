/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WawancaraService } from './wawancara.service';
import {
  CreateWawancaraDto,
  UpdateWawancaraDto,
  FilterWawancaraDto,
  CompleteWawancaraDto,
  WawancaraResponseDto,
  PaginatedWawancaraResponseDto,
} from './dto/wawancara.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateWawancaraSchema,
  UpdateWawancaraSchema,
  FilterWawancaraSchema,
  CompleteWawancaraSchema,
} from './wawancara.validation';
import {
  StatusWawancara,
  JenisWawancara,
} from '../model/blacklist-wawancara.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';

@ApiTags('Wawancara')
@Controller('wawancara')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WawancaraController {
  constructor(private readonly wawancaraService: WawancaraService) {}

  @Post()
  @RequirePermission('manage_wawancara', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Jadwalkan wawancara baru' })
  @ApiResponse({ status: 201, type: WawancaraResponseDto })
  @ApiResponse({ status: 409, description: 'Schedule conflict' })
  async create(
    @Body(new ZodValidationPipe(CreateWawancaraSchema))
    createWawancaraDto: CreateWawancaraDto,
  ) {
    const data = await this.wawancaraService.create(createWawancaraDto);
    return ResponseUtil.created(data, 'Wawancara berhasil dijadwalkan');
  }

  @Get()
  @RequirePermission('manage_wawancara', PERMISSION.READ)
  @ApiOperation({ summary: 'Get semua wawancara dengan filter' })
  @ApiQuery({ name: 'status', required: false, enum: StatusWawancara })
  @ApiQuery({ name: 'jenisWawancara', required: false, enum: JenisWawancara })
  @ApiQuery({ name: 'idPewawancara', required: false, type: String })
  @ApiQuery({ name: 'idPeserta', required: false, type: String })
  @ApiQuery({ name: 'tanggalMulai', required: false, type: String })
  @ApiQuery({ name: 'tanggalAkhir', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['tanggalWawancara', 'createdAt'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, type: PaginatedWawancaraResponseDto })
  async findAll(
    @Query(new ZodValidationPipe(FilterWawancaraSchema))
    filterDto: FilterWawancaraDto,
  ) {
    const result = await this.wawancaraService.findAll(filterDto);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      'Data wawancara berhasil diambil',
    );
  }

  @Get('stats/summary')
  @RequirePermission('manage_wawancara', PERMISSION.READ)
  @ApiOperation({ summary: 'Get statistik wawancara' })
  async getStats() {
    const data = await this.wawancaraService.getStats();
    return ResponseUtil.success(data, 'Statistik wawancara berhasil diambil');
  }

  @Get('upcoming/list')
  @RequirePermission('manage_wawancara', PERMISSION.READ)
  @ApiOperation({ summary: 'Get wawancara yang akan datang' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getUpcoming(@Query('limit') limit?: number) {
    const data = await this.wawancaraService.getUpcoming(limit);
    return ResponseUtil.success(data, 'Wawancara mendatang berhasil diambil');
  }

  @Get('pewawancara/:idPewawancara')
  @RequirePermission('manage_wawancara', PERMISSION.READ)
  @ApiOperation({ summary: 'Get wawancara by pewawancara' })
  @ApiParam({ name: 'idPewawancara', type: String })
  @ApiQuery({ name: 'status', required: false, enum: StatusWawancara })
  async getByPewawancara(
    @Param('idPewawancara', ParseUUIDPipe) idPewawancara: string,
    @Query('status') status?: StatusWawancara,
  ) {
    const data = await this.wawancaraService.getByPewawancara(
      idPewawancara,
      status,
    );
    return ResponseUtil.success(
      data,
      'Data wawancara pewawancara berhasil diambil',
    );
  }

  @Get('peserta/:idPeserta')
  @RequirePermission('manage_wawancara', PERMISSION.READ)
  @ApiOperation({ summary: 'Get wawancara by peserta' })
  @ApiParam({ name: 'idPeserta', type: String })
  async getByPeserta(@Param('idPeserta', ParseUUIDPipe) idPeserta: string) {
    const data = await this.wawancaraService.getByPeserta(idPeserta);
    return ResponseUtil.success(
      data,
      'Data wawancara peserta berhasil diambil',
    );
  }

  @Get(':id')
  @RequirePermission('manage_wawancara', PERMISSION.READ)
  @ApiOperation({ summary: 'Get wawancara by ID' })
  @ApiParam({ name: 'id', description: 'Wawancara ID (UUID)' })
  @ApiResponse({ status: 200, type: WawancaraResponseDto })
  @ApiResponse({ status: 404, description: 'Wawancara tidak ditemukan' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.wawancaraService.findOne(id);
    return ResponseUtil.success(data, 'Data wawancara berhasil diambil');
  }

  @Patch(':id')
  @RequirePermission('manage_wawancara', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Update wawancara' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: WawancaraResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateWawancaraSchema))
    updateWawancaraDto: UpdateWawancaraDto,
  ) {
    const data = await this.wawancaraService.update(id, updateWawancaraDto);
    return ResponseUtil.success(data, 'Data wawancara berhasil diupdate');
  }

  @Post(':id/complete')
  @RequirePermission('manage_wawancara', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Selesaikan wawancara dengan hasil' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CompleteWawancaraDto })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(CompleteWawancaraSchema))
    completeDto: CompleteWawancaraDto,
  ) {
    const data = await this.wawancaraService.complete(id, completeDto);
    return ResponseUtil.success(data, 'Wawancara berhasil diselesaikan');
  }

  @Post(':id/cancel')
  @RequirePermission('manage_wawancara', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Batalkan wawancara' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        alasan: { type: 'string', example: 'Candidate tidak bisa hadir' },
      },
    },
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('alasan') alasan?: string,
  ) {
    const data = await this.wawancaraService.cancel(id, alasan);
    return ResponseUtil.success(data, 'Wawancara berhasil dibatalkan');
  }

  @Post(':id/reschedule')
  @RequirePermission('manage_wawancara', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Jadwalkan ulang wawancara' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tanggalBaru', 'jamBaru'],
      properties: {
        tanggalBaru: { type: 'string', example: '2024-12-30' },
        jamBaru: { type: 'string', example: '10:00' },
        alasan: { type: 'string', example: 'Permintaan candidate' },
      },
    },
  })
  async reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('tanggalBaru') tanggalBaru: string,
    @Body('jamBaru') jamBaru: string,
    @Body('alasan') alasan?: string,
  ) {
    const data = await this.wawancaraService.reschedule(
      id,
      tanggalBaru,
      jamBaru,
      alasan,
    );
    return ResponseUtil.success(data, 'Wawancara berhasil dijadwalkan ulang');
  }

  @Delete(':id')
  @RequirePermission('manage_wawancara', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus wawancara' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.wawancaraService.remove(id);
    return ResponseUtil.success(data, 'Data wawancara berhasil dihapus');
  }
}
