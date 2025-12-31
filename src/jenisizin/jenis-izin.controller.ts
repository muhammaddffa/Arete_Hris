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
import { JenisIzinService } from './jenis-izin.service';
import { CreateJenisIzinDto, UpdateJenisIzinDto } from './dto/jenis-izin.dto';
import { createResponse } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('Jenis Izin')
@Controller('jenis-izin')
@UseGuards(JwtAuthGuard) // ✅ Semua endpoint harus login
@ApiBearerAuth()
export class JenisIzinController {
  constructor(private readonly jenisIzinService: JenisIzinService) {}

  // CREATE - Hanya HRD
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_izin')
  @ApiOperation({ summary: 'Buat jenis izin (HRD only)' })
  async create(@Body() createDto: CreateJenisIzinDto) {
    const data = await this.jenisIzinService.create(createDto);
    return createResponse(
      HttpStatus.CREATED,
      RESPONSE_MESSAGES.JENISIZIN.CREATED,
      data,
    );
  }

  // GET ALL - Semua yang login (untuk pilih jenis izin saat request)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua jenis izin' })
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

  // GET BY ID - Semua yang login
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get jenis izin by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.jenisIzinService.findOne(id);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JENISIZIN.FOUND,
      data,
    );
  }

  // UPDATE - Hanya HRD
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_izin')
  @ApiOperation({ summary: 'Update jenis izin (HRD only)' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateJenisIzinDto) {
    const data = await this.jenisIzinService.update(id, updateDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JENISIZIN.UPDATED,
      data,
    );
  }

  // DELETE - Hanya HRD
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_izin')
  @ApiOperation({ summary: 'Hapus jenis izin (HRD only)' })
  async remove(@Param('id') id: string) {
    await this.jenisIzinService.remove(id);
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.JENISIZIN.DELETED);
  }
}
