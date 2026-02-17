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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  QueryDepartmentDto,
  DepartmentResponseDto,
  PaginatedDepartmentResponseDto,
  DepartmentWithStatsDto,
  BulkDeleteDepartmentDto,
} from './dto/department.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';

@ApiTags('Departemen')
@Controller('department')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @RequirePermission('manage_department', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat departemen baru' })
  @ApiResponse({
    status: 201,
    description: 'Departemen berhasil dibuat',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Nama departemen sudah ada' })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    const data = await this.departmentService.create(createDepartmentDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.DEPARTMENT.CREATED);
  }

  @Get()
  @RequirePermission('manage_department', PERMISSION.READ)
  @ApiOperation({ summary: 'Get semua departemen' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['namaDepartemen', 'createdAt'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, type: PaginatedDepartmentResponseDto })
  async findAll(@Query() query: QueryDepartmentDto) {
    const result = await this.departmentService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.DEPARTMENT.LIST,
    );
  }

  @Get('autocomplete')
  @RequirePermission('manage_department', PERMISSION.READ)
  @ApiOperation({ summary: 'Autocomplete nama departemen (min 2 karakter)' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  async autocomplete(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    const results = await this.departmentService.autocomplete(query, limit);
    return ResponseUtil.success(results, 'Autocomplete results');
  }

  @Get('stats/summary')
  @RequirePermission('manage_department', PERMISSION.READ)
  @ApiOperation({ summary: 'Get statistik semua departemen' })
  async getAllStats() {
    const data = await this.departmentService.getAllStats();
    return ResponseUtil.success(data, 'Statistik departemen berhasil diambil');
  }

  @Get('check/duplicate')
  @RequirePermission('manage_department', PERMISSION.READ)
  @ApiOperation({ summary: 'Cek duplikasi nama departemen' })
  @ApiQuery({ name: 'name', required: true })
  @ApiQuery({ name: 'excludeId', required: false })
  async checkDuplicate(
    @Query('name') name: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const exists = await this.departmentService.checkDuplicate(name, excludeId);
    return ResponseUtil.success(
      { exists, name },
      exists ? 'Nama departemen sudah ada' : 'Nama departemen tersedia',
    );
  }

  @Get(':id')
  @RequirePermission('manage_department', PERMISSION.READ)
  @ApiOperation({ summary: 'Get departemen by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto })
  @ApiResponse({ status: 404, description: 'Departemen tidak ditemukan' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.departmentService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.DEPARTMENT.FOUND);
  }

  @Get(':id/stats')
  @RequirePermission('manage_department', PERMISSION.READ)
  @ApiOperation({ summary: 'Get statistik departemen' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: DepartmentWithStatsDto })
  async getDepartmentStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.departmentService.getDepartmentStats(id);
    return ResponseUtil.success(data, 'Statistik departemen berhasil diambil');
  }

  @Patch(':id')
  @RequirePermission('manage_department', PERMISSION.UPDATE)
  @ApiOperation({ summary: 'Update departemen' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto })
  @ApiResponse({ status: 404, description: 'Departemen tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'Nama departemen sudah ada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const data = await this.departmentService.update(id, updateDepartmentDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.DEPARTMENT.UPDATED);
  }

  @Delete('bulk/delete')
  @RequirePermission('manage_department', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete departemen' })
  async bulkDelete(@Body() dto: BulkDeleteDepartmentDto) {
    const result = await this.departmentService.bulkDelete(dto);
    return ResponseUtil.success(
      result,
      `${result.deleted} departemen berhasil dihapus`,
    );
  }

  @Delete(':id')
  @RequirePermission('manage_department', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete departemen' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 400,
    description: 'Tidak bisa hapus departemen yang masih punya jabatan',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.departmentService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.DEPARTMENT.DELETED);
  }
}
