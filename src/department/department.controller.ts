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
  DepartmentResponseDto,
} from './dto/department.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@ApiTags('Department')
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await this.departmentService.create(createDepartmentDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.DEPARTMENT.CREATED);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiQuery({
    name: 'includeRelations',
    required: false,
    type: Boolean,
    description: 'Include role default dan count jabatan',
  })
  @ApiResponse({
    status: 200,
    description: 'List of departments',
    type: [DepartmentResponseDto],
  })
  async findAll(@Query('includeRelations') includeRelations?: string) {
    const include = includeRelations === 'true';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await this.departmentService.findAll(include);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.DEPARTMENT.LIST);
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await this.departmentService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.DEPARTMENT.FOUND);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get department statistics' })
  @ApiParam({
    name: 'id',
    description: 'Department ID (UUID)',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description:
      'Department statistics including total jabatan and karyawan aktif',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentStats(@Param('id', ParseUUIDPipe) id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await this.departmentService.getDepartmentStats(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.DEPARTMENT.FOUND);
  }

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
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await this.departmentService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.DEPARTMENT.DELETED);
  }
}
