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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JadwalKerjaService } from './jadwal-kerja.service';
import {
  CreateJadwalKerjaDto,
  QueryJadwalDto,
  UpdateJadwalKerjaDto,
} from './dto/jadwal-kerja.dto';
import { createResponse, ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';

@ApiTags('Jadwal Kerja')
@Controller('jadwal-kerja')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JadwalKerjaController {
  constructor(private readonly jadwalKerjaService: JadwalKerjaService) {}

  @Post()
  @RequirePermission('manage_jadwal_kerja', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat jadwal kerja baru' })
  async create(@Body() createDto: CreateJadwalKerjaDto) {
    const data = await this.jadwalKerjaService.create(createDto);
    return createResponse(
      HttpStatus.CREATED,
      RESPONSE_MESSAGES.JADWALKERJA.CREATED,
      data,
    );
  }

  @Get()
  @RequirePermission('manage_jadwal_kerja', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua jadwal kerja' })
  async findAll(@Query() query: QueryJadwalDto) {
    const result = await this.jadwalKerjaService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.JADWALKERJA.LIST,
    );
  }

  @Get('statistics')
  @RequirePermission('manage_jadwal_kerja', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get statistik jadwal kerja' })
  async getStatistics() {
    const data = await this.jadwalKerjaService.getStatistics();
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JADWALKERJA.STATISTICS,
      data,
    );
  }

  @Get(':id')
  @RequirePermission('manage_jadwal_kerja', PERMISSION.READ)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get jadwal kerja by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.jadwalKerjaService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JADWALKERJA.FOUND,
      data,
    );
  }

  @Patch(':id')
  @RequirePermission('manage_jadwal_kerja', PERMISSION.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update jadwal kerja' })
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
  @RequirePermission('manage_jadwal_kerja', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus jadwal kerja' })
  async remove(@Param('id') id: string) {
    await this.jadwalKerjaService.remove(id);
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.JADWALKERJA.DELETED);
  }
}
