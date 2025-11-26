import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { KaryawanJadwalService } from './karyawan-jadwal.service';
import {
  CreateKaryawanJadwalDto,
  QueryKaryawanJadwalDto,
  UpdateKaryawanJadwalDto,
} from './dto/karyawan-jadwal.dto';
import { ResponseUtil } from 'src/common/utils/response.util';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';

@ApiTags('Karyawan Jadwal')
@Controller('karyawan-jadwal')
export class KaryawanJadwalController {
  constructor(private readonly karyawanJadwalService: KaryawanJadwalService) {}

  @Post()
  @ApiOperation({ summary: 'Assign jadwal ke karyawan' })
  @ApiResponse({ status: 201, description: 'Jadwal berhasil di-assign' })
  create(@Body() createDto: CreateKaryawanJadwalDto) {
    return this.karyawanJadwalService.create(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get semua karyawan jadwal' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  async findAll(@Query() query: QueryKaryawanJadwalDto) {
    const result = await this.karyawanJadwalService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.KARYAWANJADWAL.LIST,
    );
  }

  @Get('karyawan/:idKaryawan')
  @ApiOperation({ summary: 'Get jadwal by karyawan' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
  findByKaryawan(@Param('idKaryawan') idKaryawan: string) {
    return this.karyawanJadwalService.findByKaryawan(idKaryawan);
  }

  @Get('karyawan/:idKaryawan/active')
  @ApiOperation({ summary: 'Get jadwal aktif karyawan' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
  findActiveByKaryawan(@Param('idKaryawan') idKaryawan: string) {
    return this.karyawanJadwalService.findActiveByKaryawan(idKaryawan);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get karyawan jadwal by ID' })
  @ApiParam({ name: 'id', description: 'ID Karyawan Jadwal (UUID)' })
  findOne(@Param('id') id: string) {
    return this.karyawanJadwalService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update karyawan jadwal' })
  @ApiParam({ name: 'id', description: 'ID Karyawan Jadwal (UUID)' })
  update(@Param('id') id: string, @Body() updateDto: UpdateKaryawanJadwalDto) {
    return this.karyawanJadwalService.update(id, updateDto);
  }

  @Post('karyawan/:idKaryawan/end')
  @ApiOperation({ summary: 'Akhiri jadwal aktif karyawan' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan (UUID)' })
  endActiveSchedule(
    @Param('idKaryawan') idKaryawan: string,
    @Body('tanggalSelesai') tanggalSelesai: string,
  ) {
    return this.karyawanJadwalService.endActiveSchedule(
      idKaryawan,
      new Date(tanggalSelesai),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus karyawan jadwal' })
  @ApiParam({ name: 'id', description: 'ID Karyawan Jadwal (UUID)' })
  remove(@Param('id') id: string) {
    return this.karyawanJadwalService.remove(id);
  }
}
