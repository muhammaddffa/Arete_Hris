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
} from '@nestjs/swagger';
import { BlacklistService } from './blacklist.service';
import {
  CreateBlacklistDto,
  UpdateBlacklistDto,
  FilterBlacklistDto,
  BlacklistResponseDto,
  PaginatedBlacklistResponseDto,
} from './dto/blacklist.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateBlacklistSchema,
  UpdateBlacklistSchema,
  FilterBlacklistSchema,
} from './blacklist.validation';

@ApiTags('Blacklist')
@Controller('blacklist')
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  // ============================================
  // CREATE BLACKLIST
  // ============================================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add karyawan to blacklist' })
  @ApiResponse({
    status: 201,
    description: 'Karyawan berhasil ditambahkan ke blacklist',
    type: BlacklistResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Karyawan sudah di blacklist' })
  async create(
    @Body(new ZodValidationPipe(CreateBlacklistSchema))
    createBlacklistDto: CreateBlacklistDto,
  ) {
    const data = await this.blacklistService.create(createBlacklistDto);
    return ResponseUtil.created(
      data,
      'Karyawan berhasil ditambahkan ke blacklist',
    );
  }

  // ============================================
  // GET ALL BLACKLIST
  // ============================================
  @Get()
  @ApiOperation({ summary: 'Get all blacklisted employees with pagination' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['nama', 'nik', 'createdAt'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'List of blacklisted employees',
    type: PaginatedBlacklistResponseDto,
  })
  async findAll(
    @Query(new ZodValidationPipe(FilterBlacklistSchema))
    filterDto: FilterBlacklistDto,
  ) {
    const result = await this.blacklistService.findAll(filterDto);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      'Data blacklist berhasil diambil',
    );
  }

  // ============================================
  // GET BLACKLIST BY ID
  // ============================================
  @Get(':id')
  @ApiOperation({ summary: 'Get blacklist by ID' })
  @ApiParam({
    name: 'id',
    description: 'Blacklist ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Blacklist found',
    type: BlacklistResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Blacklist not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.blacklistService.findOne(id);
    return ResponseUtil.success(data, 'Data blacklist berhasil diambil');
  }

  // ============================================
  // CHECK IF KARYAWAN IS BLACKLISTED
  // ============================================
  @Get('check/:idKaryawan')
  @ApiOperation({ summary: 'Check if karyawan is blacklisted' })
  @ApiParam({
    name: 'idKaryawan',
    description: 'Karyawan ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Blacklist check result',
    schema: {
      type: 'object',
      properties: {
        isBlacklisted: { type: 'boolean' },
      },
    },
  })
  async checkBlacklist(@Param('idKaryawan', ParseUUIDPipe) idKaryawan: string) {
    const isBlacklisted = await this.blacklistService.isBlacklisted(idKaryawan);
    return ResponseUtil.success(
      { isBlacklisted },
      isBlacklisted
        ? 'Karyawan ada di blacklist'
        : 'Karyawan tidak di blacklist',
    );
  }

  // ============================================
  // CHECK BY NIK
  // ============================================
  @Get('check-nik/:nik')
  @ApiOperation({ summary: 'Check if NIK is blacklisted' })
  @ApiParam({
    name: 'nik',
    description: 'NIK',
    example: '3201012345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'NIK check result',
  })
  async checkByNik(@Param('nik') nik: string) {
    const isBlacklisted = await this.blacklistService.checkByNik(nik);
    return ResponseUtil.success(
      { isBlacklisted },
      isBlacklisted ? 'NIK ada di blacklist' : 'NIK tidak di blacklist',
    );
  }

  // ============================================
  // UPDATE BLACKLIST
  // ============================================
  @Patch(':id')
  @ApiOperation({ summary: 'Update blacklist entry' })
  @ApiParam({
    name: 'id',
    description: 'Blacklist ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Blacklist updated',
    type: BlacklistResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Blacklist not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateBlacklistSchema))
    updateBlacklistDto: UpdateBlacklistDto,
  ) {
    const data = await this.blacklistService.update(id, updateBlacklistDto);
    return ResponseUtil.success(data, 'Data blacklist berhasil diupdate');
  }

  // ============================================
  // DELETE BLACKLIST
  // ============================================
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove from blacklist' })
  @ApiParam({
    name: 'id',
    description: 'Blacklist ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Removed from blacklist',
  })
  @ApiResponse({ status: 404, description: 'Blacklist not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.blacklistService.remove(id);
    return ResponseUtil.success(data, 'Berhasil dihapus dari blacklist');
  }

  // ============================================
  // GET STATS
  // ============================================
  @Get('stats/summary')
  @ApiOperation({ summary: 'Get blacklist statistics' })
  @ApiResponse({
    status: 200,
    description: 'Blacklist statistics',
  })
  async getStats() {
    const data = await this.blacklistService.getStats();
    return ResponseUtil.success(data, 'Statistik blacklist berhasil diambil');
  }
}
