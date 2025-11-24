// src/jabatan/jabatan.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ApiQuery,
} from '@nestjs/swagger';
import { JabatanService } from './jabatan.service';
import {
  CreateJabatanDto,
  UpdateJabatanDto,
  QueryJabatanDto,
  JabatanResponseDto,
} from './dto/jabatan.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@ApiTags('Jabatan')
@Controller('jabatan')
export class JabatanController {
  constructor(private readonly jabatanService: JabatanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new jabatan' })
  @ApiResponse({
    status: 201,
    description: 'Jabatan berhasil dibuat',
    type: JabatanResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createJabatanDto: CreateJabatanDto) {
    const data = await this.jabatanService.create(createJabatanDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.JABATAN.CREATED);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jabatan with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of jabatan',
    type: [JabatanResponseDto],
  })
  async findAll(@Query() query: QueryJabatanDto) {
    const result = await this.jabatanService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.JABATAN.LIST,
    );
  }

  @Get('departemen/:idDepartemen')
  @ApiOperation({ summary: 'Get active jabatan by departemen' })
  @ApiParam({
    name: 'idDepartemen',
    description: 'Departemen ID (UUID)',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'List of jabatan in departemen',
    type: [JabatanResponseDto],
  })
  async getByDepartemen(
    @Param('idDepartemen', ParseUUIDPipe) idDepartemen: string,
  ) {
    const data = await this.jabatanService.getByDepartemen(idDepartemen);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.LIST);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get jabatan by ID' })
  @ApiParam({
    name: 'id',
    description: 'Jabatan ID (UUID)',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Jabatan found',
    type: JabatanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Jabatan not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.jabatanService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.FOUND);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get jabatan statistics' })
  @ApiParam({
    name: 'id',
    description: 'Jabatan ID (UUID)',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description:
      'Jabatan statistics including total karyawan aktif and non-aktif',
  })
  @ApiResponse({ status: 404, description: 'Jabatan not found' })
  async getJabatanStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.jabatanService.getJabatanStats(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.FOUND);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update jabatan' })
  @ApiParam({
    name: 'id',
    description: 'Jabatan ID (UUID)',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Jabatan berhasil diupdate',
    type: JabatanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Jabatan not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJabatanDto: UpdateJabatanDto,
  ) {
    const data = await this.jabatanService.update(id, updateJabatanDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.UPDATED);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete jabatan' })
  @ApiParam({
    name: 'id',
    description: 'Jabatan ID (UUID)',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Jabatan berhasil dihapus',
  })
  @ApiResponse({
    status: 404,
    description: 'Jabatan not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete jabatan with existing karyawan',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.jabatanService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.DELETED);
  }
}
