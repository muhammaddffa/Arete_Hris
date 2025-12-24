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
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Option')
@ApiBearerAuth()
@Controller('options')
@UseGuards(JwtAuthGuard)
export class OptionController {
  constructor(private readonly optionService: OptionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_form')
  @UsePipes(new ZodValidationPipe(CreateOptionSchema))
  @ApiOperation({ summary: 'Create option (HRD & Admin only)' })
  async create(@Body() createOptionDto: CreateOptionDto) {
    const data = await this.optionService.create(createOptionDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.OPTION.CREATED);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_form')
  @UsePipes(new ZodValidationPipe(BulkCreateOptionsSchema))
  @ApiOperation({ summary: 'Bulk create options (HRD & Admin only)' })
  async bulkCreate(@Body() bulkCreateDto: BulkCreateOptionsDto) {
    const data = await this.optionService.bulkCreate(bulkCreateDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.OPTION.BULK_CREATED);
  }

  @Get('question/:idQuestion')
  @Public()
  @ApiOperation({ summary: 'Get options by question ID' })
  async findByQuestionId(
    @Param('idQuestion', ParseUUIDPipe) idQuestion: string,
  ) {
    const data = await this.optionService.findByQuestionId(idQuestion);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.OPTION.LIST);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get option by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.optionService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.OPTION.FOUND);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_form')
  @UsePipes(new ZodValidationPipe(UpdateOptionSchema))
  @ApiOperation({ summary: 'Update option (HRD & Admin only)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOptionDto: UpdateOptionDto,
  ) {
    const data = await this.optionService.update(id, updateOptionDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.OPTION.UPDATED);
  }

  @Patch('question/:idQuestion/reorder')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_form')
  @UsePipes(new ZodValidationPipe(ReorderOptionsSchema))
  @ApiOperation({ summary: 'Reorder options (HRD & Admin only)' })
  async reorder(
    @Param('idQuestion', ParseUUIDPipe) idQuestion: string,
    @Body() reorderDto: ReorderOptionsDto,
  ) {
    const data = await this.optionService.reorder(idQuestion, reorderDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.OPTION.REORDERED);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_form')
  @ApiOperation({ summary: 'Delete option (HRD & Admin only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.optionService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.OPTION.DELETED);
  }
}
