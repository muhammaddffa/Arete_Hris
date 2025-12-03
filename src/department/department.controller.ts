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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { Permissions } from 'src/auth/decorators/permissions.decorator';
// import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Departemen')
@Controller('department')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Roles(2)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new department' })
  @ApiResponse({
    status: 201,
    description: 'Department berhasil dibuat',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Department name already exists' })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    const data = await this.departmentService.create(createDepartmentDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.DEPARTMENT.CREATED);
  }

  @Get()
  @Roles(2)
  @ApiOperation({
    summary: 'Get all departments with pagination, search, and filters',
    description: 'Search by name, filter by role, with pagination support',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by nama departemen',
  })
  @ApiQuery({
    name: 'idRoleDefault',
    required: false,
    type: Number,
    description: 'Filter by role ID',
  })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['namaDepartemen', 'idRoleDefault', 'createdAt'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'List of departments with pagination',
    type: PaginatedDepartmentResponseDto,
  })
  async findAll(@Query() query: QueryDepartmentDto) {
    const result = await this.departmentService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.DEPARTMENT.LIST,
    );
  }

  @Get('autocomplete')
  @ApiOperation({
    summary: 'Autocomplete department name',
    description: 'Get suggestions for department search (min 2 chars)',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query (min 2 chars)',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiResponse({ status: 200, description: 'Autocomplete suggestions' })
  async autocomplete(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    const results = await this.departmentService.autocomplete(query, limit);
    return ResponseUtil.success(results, 'Autocomplete results');
  }

  // ==========================================
  // NEW: GET ALL STATS
  // ==========================================
  @Get('stats/summary')
  @ApiOperation({ summary: 'Get all departments statistics summary' })
  @ApiResponse({
    status: 200,
    description: 'Statistics summary',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 10 },
        byRole: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: {
                type: 'object',
                properties: {
                  idRole: { type: 'number' },
                  namaRole: { type: 'string' },
                },
              },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getAllStats() {
    const data = await this.departmentService.getAllStats();
    return ResponseUtil.success(data, 'Statistik departemen berhasil diambil');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({
    name: 'id',
    description: 'Department ID (UUID)',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Department found',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.departmentService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.DEPARTMENT.FOUND);
  }

  // ==========================================
  // GET STATS
  // ==========================================
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get department statistics' })
  @ApiParam({
    name: 'id',
    description: 'Department ID (UUID)',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Department statistics',
    type: DepartmentWithStatsDto,
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.departmentService.getDepartmentStats(id);
    return ResponseUtil.success(data, 'Statistik departemen berhasil diambil');
  }

  // ==========================================
  // NEW: CHECK DUPLICATE NAME
  // ==========================================
  @Get('check/duplicate')
  @ApiOperation({ summary: 'Check if department name already exists' })
  @ApiQuery({
    name: 'name',
    required: true,
    description: 'Department name to check',
  })
  @ApiQuery({
    name: 'excludeId',
    required: false,
    description: 'Exclude this ID from check (for updates)',
  })
  @ApiResponse({
    status: 200,
    description: 'Duplicate check result',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean' },
        name: { type: 'string' },
      },
    },
  })
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

  // ==========================================
  // UPDATE
  // ==========================================
  @Patch(':id')
  @ApiOperation({ summary: 'Update department' })
  @ApiParam({
    name: 'id',
    description: 'Department ID (UUID)',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Department berhasil diupdate',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Department name already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const data = await this.departmentService.update(id, updateDepartmentDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.DEPARTMENT.UPDATED);
  }

  // ==========================================
  // DELETE
  // ==========================================
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete department' })
  @ApiParam({
    name: 'id',
    description: 'Department ID (UUID)',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Department berhasil dihapus',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete department with existing jabatan',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.departmentService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.DEPARTMENT.DELETED);
  }

  // ==========================================
  // NEW: BULK DELETE
  // ==========================================
  @Delete('bulk/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete departments' })
  @ApiResponse({
    status: 200,
    description: 'Departments deleted successfully',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'number' },
        ids: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Some departments cannot be deleted',
  })
  async bulkDelete(@Body() dto: BulkDeleteDepartmentDto) {
    const result = await this.departmentService.bulkDelete(dto);
    return ResponseUtil.success(
      result,
      `${result.deleted} departemen berhasil dihapus`,
    );
  }
}
