import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { ResponseUtil } from '../common/utils/response.util';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * ⚠️ PENTING: Route spesifik harus di atas route dengan params!
   * Urutan route matters di NestJS
   */

  // 1. Route paling spesifik dulu
  @Get('level/:level')
  @Public()
  @ApiOperation({ summary: 'Get roles by level' })
  async findByLevel(@Param('level', ParseIntPipe) level: number) {
    const data = await this.roleService.findByLevel(level);
    return ResponseUtil.success(
      data,
      `Role dengan level ${level} berhasil diambil`,
    );
  }

  // 2. List all roles (tanpa params)
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all roles' })
  async findAll() {
    const data = await this.roleService.findAll();
    return ResponseUtil.success(data, 'Daftar role berhasil diambil');
  }

  // 3. Route dengan dynamic param terakhir
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get role by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.roleService.findOne(id);
    return ResponseUtil.success(data, 'Detail role berhasil diambil');
  }
}
