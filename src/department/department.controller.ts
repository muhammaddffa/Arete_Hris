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
  ApiQuery,
} from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  QueryDepartmentDto,
  DepartmentResponseDto,
  PaginatedDepartmentResponseDto,
  DepartmentWithStatsDto,
} from './dto/department.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@ApiTags('Departemen')
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new department' })
  @ApiResponse({
    status: 201,
    description: 'Department berhasil dibuat',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    const data = await this.departmentService.create(createDepartmentDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.DEPARTMENT.CREATED);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments with pagination and filters' })
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

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({
    name: 'id',
    description: 'Department ID (UUID)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
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

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get department statistics' })
  @ApiParam({
    name: 'id',
    description: 'Department ID (UUID)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
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
  @Patch(':id')
  @ApiOperation({ summary: 'Update department' })
  @ApiParam({
    name: 'id',
    description: 'Department ID (UUID)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Department berhasil diupdate',
    type: DepartmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const data = await this.departmentService.update(id, updateDepartmentDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.DEPARTMENT.UPDATED);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete department' })
  @ApiParam({
    name: 'id',
    description: 'Department ID (UUID)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
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
}
