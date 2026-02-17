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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JabatanService } from './jabatan.service';
import {
  CreateJabatanDto,
  UpdateJabatanDto,
  QueryJabatanDto,
} from './dto/jabatan.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';

@ApiTags('Jabatan')
@Controller('jabatan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JabatanController {
  constructor(private readonly jabatanService: JabatanService) {}

  @Post()
  @RequirePermission('manage_jabatan', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat jabatan baru' })
  async create(@Body() createJabatanDto: CreateJabatanDto) {
    const data = await this.jabatanService.create(createJabatanDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.JABATAN.CREATED);
  }

  @Get()
  @RequirePermission('manage_jabatan', PERMISSION.READ)
  @ApiOperation({ summary: 'Get semua jabatan' })
  async findAll(@Query() query: QueryJabatanDto) {
    const result = await this.jabatanService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.JABATAN.LIST,
    );
  }

  @Get('departemen/:idDepartemen')
  @RequirePermission('manage_jabatan', PERMISSION.READ)
  @ApiOperation({ summary: 'Get jabatan by departemen' })
  async getByDepartemen(
    @Param('idDepartemen', ParseUUIDPipe) idDepartemen: string,
  ) {
    const data = await this.jabatanService.getByDepartemen(idDepartemen);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.LIST);
  }

  @Get(':id/stats')
  @RequirePermission('manage_jabatan', PERMISSION.READ)
  @ApiOperation({ summary: 'Get statistik jabatan' })
  async getJabatanStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.jabatanService.getJabatanStats(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.FOUND);
  }

  @Get(':id')
  @RequirePermission('manage_jabatan', PERMISSION.READ)
  @ApiOperation({ summary: 'Get jabatan by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.jabatanService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.FOUND);
  }

  @Patch(':id')
  @RequirePermission('manage_jabatan', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Update jabatan' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJabatanDto: UpdateJabatanDto,
  ) {
    const data = await this.jabatanService.update(id, updateJabatanDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.UPDATED);
  }

  @Delete(':id')
  @RequirePermission('manage_jabatan', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete jabatan' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.jabatanService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.DELETED);
  }
}
