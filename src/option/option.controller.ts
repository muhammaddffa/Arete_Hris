import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OptionService } from './option.service';
import type {
  CreateOptionDto,
  UpdateOptionDto,
  BulkCreateOptionsDto,
  ReorderOptionsDto,
} from './dto/option.dto';
import {
  CreateOptionSchema,
  UpdateOptionSchema,
  BulkCreateOptionsSchema,
  ReorderOptionsSchema,
} from './dto/option.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Option')
@ApiBearerAuth()
@Controller('options')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OptionController {
  constructor(private readonly optionService: OptionService) {}

  @Post()
  @RequirePermission('manage_form', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateOptionSchema))
  @ApiOperation({ summary: 'Buat option baru' })
  async create(@Body() createOptionDto: CreateOptionDto) {
    const data = await this.optionService.create(createOptionDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.OPTION.CREATED);
  }

  @Post('bulk')
  @RequirePermission('manage_form', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(BulkCreateOptionsSchema))
  @ApiOperation({ summary: 'Bulk create options' })
  async bulkCreate(@Body() bulkCreateDto: BulkCreateOptionsDto) {
    const data = await this.optionService.bulkCreate(bulkCreateDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.OPTION.BULK_CREATED);
  }

  @Get('question/:idQuestion')
  @RequirePermission('manage_form', PERMISSION.READ)
  @ApiOperation({ summary: 'Get options by question ID' })
  async findByQuestionId(
    @Param('idQuestion', ParseUUIDPipe) idQuestion: string,
  ) {
    const data = await this.optionService.findByQuestionId(idQuestion);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.OPTION.LIST);
  }

  @Get(':id')
  @RequirePermission('manage_form', PERMISSION.READ)
  @ApiOperation({ summary: 'Get option by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.optionService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.OPTION.FOUND);
  }

  @Patch('question/:idQuestion/reorder')
  @RequirePermission('manage_form', PERMISSION.UPDATE)
  @UsePipes(new ZodValidationPipe(ReorderOptionsSchema))
  @ApiOperation({ summary: 'Reorder options' })
  async reorder(
    @Param('idQuestion', ParseUUIDPipe) idQuestion: string,
    @Body() reorderDto: ReorderOptionsDto,
  ) {
    const data = await this.optionService.reorder(idQuestion, reorderDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.OPTION.REORDERED);
  }

  @Patch(':id')
  @RequirePermission('manage_form', PERMISSION.UPDATE)
  @UsePipes(new ZodValidationPipe(UpdateOptionSchema))
  @ApiOperation({ summary: 'Update option' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOptionDto: UpdateOptionDto,
  ) {
    const data = await this.optionService.update(id, updateOptionDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.OPTION.UPDATED);
  }

  @Delete(':id')
  @RequirePermission('manage_form', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete option' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.optionService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.OPTION.DELETED);
  }
}
