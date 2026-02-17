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
  ApiBearerAuth,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';

@ApiTags('Blacklist')
@Controller('blacklist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  @Post()
  @RequirePermission('manage_blacklist', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah karyawan ke blacklist' })
  @ApiResponse({ status: 201, type: BlacklistResponseDto })
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

  @Get()
  @RequirePermission('manage_blacklist', PERMISSION.READ)
  @ApiOperation({ summary: 'Get semua blacklist dengan pagination' })
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
  @ApiResponse({ status: 200, type: PaginatedBlacklistResponseDto })
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

  @Get('stats/summary')
  @RequirePermission('manage_blacklist', PERMISSION.READ)
  @ApiOperation({ summary: 'Get statistik blacklist' })
  async getStats() {
    const data = await this.blacklistService.getStats();
    return ResponseUtil.success(data, 'Statistik blacklist berhasil diambil');
  }

  @Get('check/:idKaryawan')
  @RequirePermission('manage_blacklist', PERMISSION.READ)
  @ApiOperation({ summary: 'Cek apakah karyawan di blacklist' })
  @ApiParam({ name: 'idKaryawan', description: 'Karyawan ID (UUID)' })
  async checkBlacklist(@Param('idKaryawan', ParseUUIDPipe) idKaryawan: string) {
    const isBlacklisted = await this.blacklistService.isBlacklisted(idKaryawan);
    return ResponseUtil.success(
      { isBlacklisted },
      isBlacklisted
        ? 'Karyawan ada di blacklist'
        : 'Karyawan tidak di blacklist',
    );
  }

  @Get('check-nik/:nik')
  @RequirePermission('manage_blacklist', PERMISSION.READ)
  @ApiOperation({ summary: 'Cek apakah NIK di blacklist' })
  @ApiParam({ name: 'nik', example: '3201012345678901' })
  async checkByNik(@Param('nik') nik: string) {
    const isBlacklisted = await this.blacklistService.checkByNik(nik);
    return ResponseUtil.success(
      { isBlacklisted },
      isBlacklisted ? 'NIK ada di blacklist' : 'NIK tidak di blacklist',
    );
  }

  @Get(':id')
  @RequirePermission('manage_blacklist', PERMISSION.READ)
  @ApiOperation({ summary: 'Get blacklist by ID' })
  @ApiParam({ name: 'id', description: 'Blacklist ID (UUID)' })
  @ApiResponse({ status: 200, type: BlacklistResponseDto })
  @ApiResponse({ status: 404, description: 'Blacklist tidak ditemukan' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.blacklistService.findOne(id);
    return ResponseUtil.success(data, 'Data blacklist berhasil diambil');
  }

  @Patch(':id')
  @RequirePermission('manage_blacklist', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Update blacklist entry' })
  @ApiParam({ name: 'id', description: 'Blacklist ID (UUID)' })
  @ApiResponse({ status: 200, type: BlacklistResponseDto })
  @ApiResponse({ status: 404, description: 'Blacklist tidak ditemukan' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateBlacklistSchema))
    updateBlacklistDto: UpdateBlacklistDto,
  ) {
    const data = await this.blacklistService.update(id, updateBlacklistDto);
    return ResponseUtil.success(data, 'Data blacklist berhasil diupdate');
  }

  @Delete(':id')
  @RequirePermission('manage_blacklist', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus dari blacklist' })
  @ApiParam({ name: 'id', description: 'Blacklist ID (UUID)' })
  @ApiResponse({ status: 404, description: 'Blacklist tidak ditemukan' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.blacklistService.remove(id);
    return ResponseUtil.success(data, 'Berhasil dihapus dari blacklist');
  }
}
