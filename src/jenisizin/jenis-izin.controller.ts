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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';

@ApiTags('Jenis Izin')
@Controller('jenis-izin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JenisIzinController {
  constructor(private readonly jenisIzinService: JenisIzinService) {}

  @Post()
  @RequirePermission('manage_izin', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat jenis izin baru' })
  async create(@Body() createDto: CreateJenisIzinDto) {
    const data = await this.jenisIzinService.create(createDto);
    return createResponse(
      HttpStatus.CREATED,
      RESPONSE_MESSAGES.JENISIZIN.CREATED,
      data,
    );
  }

  @Get()
  @RequirePermission('manage_izin', PERMISSION.READ)
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

  @Get(':id')
  @RequirePermission('manage_izin', PERMISSION.READ)
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

  @Patch(':id')
  @RequirePermission('manage_izin', PERMISSION.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update jenis izin' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateJenisIzinDto) {
    const data = await this.jenisIzinService.update(id, updateDto);
    return createResponse(
      HttpStatus.OK,
      RESPONSE_MESSAGES.JENISIZIN.UPDATED,
      data,
    );
  }

  @Delete(':id')
  @RequirePermission('manage_izin', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus jenis izin' })
  async remove(@Param('id') id: string) {
    await this.jenisIzinService.remove(id);
    return createResponse(HttpStatus.OK, RESPONSE_MESSAGES.JENISIZIN.DELETED);
  }
}
