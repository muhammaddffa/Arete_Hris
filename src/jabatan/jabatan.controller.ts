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
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Jabatan')
@Controller('jabatan')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JabatanController {
  constructor(private readonly jabatanService: JabatanService) {}

  // CREATE - Hanya HRD & Superadmin
  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(PermissionsGuard)
  // @RequirePermissions('manage_jabatan')
  @ApiOperation({ summary: 'Create jabatan (HRD only)' })
  async create(@Body() createJabatanDto: CreateJabatanDto) {
    const data = await this.jabatanService.create(createJabatanDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.JABATAN.CREATED);
  }

  // GET ALL - Semua yang login bisa lihat
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all jabatan' })
  async findAll(@Query() query: QueryJabatanDto) {
    const result = await this.jabatanService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.JABATAN.LIST,
    );
  }

  // GET BY DEPARTEMEN - Semua yang login bisa lihat
  @Get('departemen/:idDepartemen')
  @ApiOperation({ summary: 'Get jabatan by departemen' })
  async getByDepartemen(
    @Param('idDepartemen', ParseUUIDPipe) idDepartemen: string,
  ) {
    const data = await this.jabatanService.getByDepartemen(idDepartemen);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.LIST);
  }

  // GET STATS - Hanya HRD & Manager
  @Get(':id/stats')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_all_karyawan')
  @ApiOperation({ summary: 'Get jabatan statistics (HRD & Manager)' })
  async getJabatanStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.jabatanService.getJabatanStats(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.FOUND);
  }

  // GET ONE - Semua yang login bisa lihat
  @Get(':id')
  @ApiOperation({ summary: 'Get jabatan by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.jabatanService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.FOUND);
  }

  // UPDATE - Hanya HRD & Superadmin
  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_jabatan')
  @ApiOperation({ summary: 'Update jabatan (HRD only)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJabatanDto: UpdateJabatanDto,
  ) {
    const data = await this.jabatanService.update(id, updateJabatanDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.UPDATED);
  }

  // DELETE - Hanya HRD & Superadmin
  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  // @UseGuards(PermissionsGuard)
  // @RequirePermissions('manage_jabatan')
  @ApiOperation({ summary: 'Delete jabatan (HRD only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.jabatanService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.JABATAN.DELETED);
  }
}
