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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Jadwal Kerja')
@Controller('jadwal-kerja')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JadwalKerjaController {
  constructor(private readonly jadwalKerjaService: JadwalKerjaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_jadwal_kerja')
  @ApiOperation({ summary: 'Buat jadwal kerja (HRD only)' })
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
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_all_karyawan')
  @ApiOperation({ summary: 'Get statistik jadwal kerja (HRD & Manager)' })
  async getStatistics() {
    const data = await this.jadwalKerjaService.getStatistics();
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JADWALKERJA.STATISTICS,
      data,
    );
  }

  // GET BY ID - Semua yang login
  @Get(':id')
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

  // UPDATE - Hanya HRD
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_jadwal_kerja')
  @ApiOperation({ summary: 'Update jadwal kerja (HRD only)' })
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

  // DELETE - Hanya HRD
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_jadwal_kerja')
  @ApiOperation({ summary: 'Hapus jadwal kerja (HRD only)' })
  async remove(@Param('id') id: string) {
    await this.jadwalKerjaService.remove(id);
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.JADWALKERJA.DELETED);
  }
}
