/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  CreateUserAccountDto,
  LoginDto,
  ChangePasswordDto,
  AssignRoleDto,
  AdminResetPasswordDto,
} from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { ResponseUtil } from '../common/utils/response.util';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(JwtAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return ResponseUtil.success(result, 'Login berhasil');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.authService.getProfile(user.idUser);
    return ResponseUtil.success(profile, 'Profile berhasil diambil');
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout berhasil' })
  async logout() {
    return ResponseUtil.success(null, 'Logout berhasil');
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User changes their own password' })
  @ApiResponse({ status: 200, description: 'Password berhasil diubah' })
  @ApiResponse({ status: 400, description: 'Password lama tidak sesuai' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const result = await this.authService.changePassword(
      user.idUser,
      changePasswordDto,
    );
    return ResponseUtil.success(result, 'Password berhasil diubah');
  }

  // ==================== ADMIN ONLY ROUTES ====================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Post('create-account')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin creates user account for karyawan' })
  @ApiResponse({ status: 201, description: 'Akun user berhasil dibuat' })
  async createUserAccount(@Body() createUserDto: CreateUserAccountDto) {
    const result = await this.authService.createUserAccount(createUserDto);
    return ResponseUtil.created(
      result,
      'Akun user berhasil dibuat. Berikan temporary password ke karyawan.',
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Patch('assign-roles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin assigns custom roles to user' })
  @ApiResponse({ status: 200, description: 'Role berhasil diassign' })
  async assignRoles(@Body() assignRoleDto: AssignRoleDto) {
    const result = await this.authService.assignRoles(assignRoleDto);
    return ResponseUtil.success(result, 'Role berhasil diassign');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Patch('admin-reset-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin resets user password' })
  @ApiResponse({ status: 200, description: 'Password berhasil direset' })
  async adminResetPassword(@Body() resetDto: AdminResetPasswordDto) {
    const result = await this.authService.adminResetPassword(resetDto);
    return ResponseUtil.success(
      result,
      'Password berhasil direset. Berikan temporary password ke user.',
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Patch('toggle-user-status/:idUser')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin toggles user active/inactive status' })
  @ApiParam({ name: 'idUser', description: 'User ID (UUID)', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Status user berhasil diubah' })
  async toggleUserStatus(@Param('idUser', ParseUUIDPipe) idUser: string) {
    const result = await this.authService.toggleUserStatus(idUser);
    return ResponseUtil.success(
      result,
      `User berhasil ${result.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getAllUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    const result = await this.authService.getAllUsers(page, limit);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      'Daftar user berhasil diambil',
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Get('users/:idUser')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user detail by ID' })
  @ApiParam({ name: 'idUser', description: 'User ID (UUID)', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'User detail' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  async getUserById(@Param('idUser', ParseUUIDPipe) idUser: string) {
    const result = await this.authService.getProfile(idUser);
    return ResponseUtil.success(result, 'User detail berhasil diambil');
  }
}
