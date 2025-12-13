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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
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
// import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Wawancara')
@Controller('wawancara')
export class WawancaraController {
  constructor(private readonly wawancaraService: WawancaraService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule interview (HRD or User)' })
  @ApiResponse({
    status: 201,
    description: 'Interview scheduled successfully',
    type: WawancaraResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Schedule conflict' })
  async create(
    @Body(new ZodValidationPipe(CreateWawancaraSchema))
    createWawancaraDto: CreateWawancaraDto,
  ) {
    const data = await this.wawancaraService.create(createWawancaraDto);
    return ResponseUtil.created(data, 'Wawancara berhasil dijadwalkan');
  }

  @Get()
  @ApiOperation({ summary: 'Get all interviews with filters and pagination' })
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
  @ApiResponse({
    status: 200,
    description: 'List of interviews',
    type: PaginatedWawancaraResponseDto,
  })
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

  @Get(':id')
  @ApiOperation({ summary: 'Get interview by ID' })
  @ApiParam({
    name: 'id',
    description: 'Wawancara ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Interview found',
    type: WawancaraResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.wawancaraService.findOne(id);
    return ResponseUtil.success(data, 'Data wawancara berhasil diambil');
  }

  @Get('pewawancara/:idPewawancara')
  @ApiOperation({ summary: 'Get interviews by interviewer' })
  @ApiParam({ name: 'idPewawancara', type: String })
  @ApiQuery({ name: 'status', required: false, enum: StatusWawancara })
  @ApiResponse({
    status: 200,
    description: 'List of interviews by interviewer',
  })
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
  @ApiOperation({ summary: 'Get interviews by candidate' })
  @ApiParam({ name: 'idPeserta', type: String })
  @ApiResponse({
    status: 200,
    description: 'List of interviews by candidate',
  })
  async getByPeserta(@Param('idPeserta', ParseUUIDPipe) idPeserta: string) {
    const data = await this.wawancaraService.getByPeserta(idPeserta);
    return ResponseUtil.success(
      data,
      'Data wawancara peserta berhasil diambil',
    );
  }

  @Get('upcoming/list')
  @ApiOperation({ summary: 'Get upcoming scheduled interviews' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'List of upcoming interviews',
  })
  async getUpcoming(@Query('limit') limit?: number) {
    const data = await this.wawancaraService.getUpcoming(limit);
    return ResponseUtil.success(data, 'Wawancara mendatang berhasil diambil');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update interview' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Interview updated',
    type: WawancaraResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateWawancaraSchema))
    updateWawancaraDto: UpdateWawancaraDto,
  ) {
    const data = await this.wawancaraService.update(id, updateWawancaraDto);
    return ResponseUtil.success(data, 'Data wawancara berhasil diupdate');
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete interview with result' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CompleteWawancaraDto })
  @ApiResponse({
    status: 200,
    description: 'Interview completed',
  })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(CompleteWawancaraSchema))
    completeDto: CompleteWawancaraDto,
  ) {
    const data = await this.wawancaraService.complete(id, completeDto);
    return ResponseUtil.success(data, 'Wawancara berhasil diselesaikan');
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel interview' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        alasan: { type: 'string', example: 'Candidate tidak bisa hadir' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Interview cancelled',
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('alasan') alasan?: string,
  ) {
    const data = await this.wawancaraService.cancel(id, alasan);
    return ResponseUtil.success(data, 'Wawancara berhasil dibatalkan');
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule interview' })
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
  @ApiResponse({
    status: 200,
    description: 'Interview rescheduled',
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete interview' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Interview deleted',
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.wawancaraService.remove(id);
    return ResponseUtil.success(data, 'Data wawancara berhasil dihapus');
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get interview statistics' })
  @ApiResponse({
    status: 200,
    description: 'Interview statistics',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byStatus: { type: 'object' },
        byJenis: { type: 'object' },
      },
    },
  })
  async getStats() {
    const data = await this.wawancaraService.getStats();
    return ResponseUtil.success(data, 'Statistik wawancara berhasil diambil');
  }
}
