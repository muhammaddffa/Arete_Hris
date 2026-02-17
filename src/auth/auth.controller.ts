/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { AuthService } from '../auth/auth.service';
import {
  CreateUserAccountDto,
  LoginDto,
  ChangePasswordDto,
  AdminResetPasswordDto,
} from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermission } from './decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';
import { ResponseUtil } from '../common/utils/response.util';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ===== PUBLIC ENDPOINTS =====

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login karyawan' })
  @ApiResponse({ status: 200, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Username atau password salah' })
  async login(@Body() loginDto: LoginDto) {
    const { username, password } = loginDto;
    const result = await this.authService.login(username, password);
    return ResponseUtil.success(result, 'Login berhasil');
  }

  // ===== SELF-SERVICE ENDPOINTS (semua karyawan login) =====

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profil karyawan yang sedang login' })
  @ApiResponse({ status: 200, description: 'Profil berhasil diambil' })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.authService.getProfile(user.idKaryawan);
    return ResponseUtil.success(profile, 'Profil berhasil diambil');
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout karyawan' })
  @ApiResponse({ status: 200, description: 'Logout berhasil' })
  async logout() {
    // JWT stateless — client cukup hapus token di sisi mereka
    return ResponseUtil.success(null, 'Logout berhasil');
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ganti password sendiri' })
  @ApiResponse({ status: 200, description: 'Password berhasil diubah' })
  @ApiResponse({ status: 400, description: 'Password lama tidak sesuai' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const result = await this.authService.changePassword(
      user.idKaryawan,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
    return ResponseUtil.success(result, 'Password berhasil diubah');
  }

  // ===== ADMIN ENDPOINTS (butuh permission) =====

  @Post('create-account')
  @RequirePermission('toggle_user_status', PERMISSION.CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat akun login untuk karyawan' })
  @ApiResponse({ status: 201, description: 'Akun berhasil dibuat' })
  async createUserAccount(@Body() dto: CreateUserAccountDto) {
    const result = await this.authService.createUserAccount(dto);
    return ResponseUtil.created(
      result,
      'Akun berhasil dibuat. Berikan temporary password ke karyawan.',
    );
  }

  @Patch('admin-reset-password')
  @RequirePermission('reset_password', PERMISSION.CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin reset password karyawan' })
  @ApiResponse({ status: 200, description: 'Password berhasil direset' })
  async adminResetPassword(@Body() dto: AdminResetPasswordDto) {
    const result = await this.authService.adminResetPassword(dto);
    return ResponseUtil.success(
      result,
      'Password berhasil direset. Berikan temporary password ke karyawan.',
    );
  }

  @Patch('toggle-status/:idKaryawan')
  @RequirePermission('toggle_user_status', PERMISSION.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktifkan / nonaktifkan akun karyawan' })
  @ApiParam({ name: 'idKaryawan', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Status berhasil diubah' })
  async toggleUserStatus(
    @Param('idKaryawan', ParseUUIDPipe) idKaryawan: string,
  ) {
    const result = await this.authService.toggleUserStatus(idKaryawan);
    return ResponseUtil.success(
      result,
      `Akun berhasil ${result.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
    );
  }

  @Get('users')
  @RequirePermission('view_karyawan', PERMISSION.READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Daftar karyawan yang memiliki akun login' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Daftar berhasil diambil' })
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

  @Get('users/:idKaryawan')
  @RequirePermission('view_karyawan', PERMISSION.READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail karyawan by ID' })
  @ApiParam({ name: 'idKaryawan', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Detail berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Karyawan tidak ditemukan' })
  async getUserById(@Param('idKaryawan', ParseUUIDPipe) idKaryawan: string) {
    const result = await this.authService.getProfile(idKaryawan);
    return ResponseUtil.success(result, 'Detail berhasil diambil');
  }
}
