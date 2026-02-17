import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FormService } from './form.service';
import * as formDto from './dto/form.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';
import { ResponseUtil } from '../common/utils/response.util';
import { validateUuid } from './form.validation';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@ApiTags('Form')
@Controller('forms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post()
  @RequirePermission('manage_form', PERMISSION.CREATE)
  @UsePipes(new ZodValidationPipe(formDto.CreateFormSchema))
  async create(@Body() createFormDto: formDto.CreateFormDto) {
    const data = await this.formService.create(createFormDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.FORM.CREATED);
  }

  @Get()
  @RequirePermission('manage_form', PERMISSION.READ)
  async findAll(
    @Query(new ZodValidationPipe(formDto.FilterFormSchema))
    query: formDto.FilterFormDto,
  ) {
    const result = await this.formService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.FORM.LIST,
    );
  }

  @Get(':id/statistics')
  @RequirePermission('manage_form', PERMISSION.READ)
  async getStatistics(@Param('id') id: string) {
    validateUuid(id);
    const data = await this.formService.getStatistics(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.FORM.STATISTICS);
  }

  @Get(':id')
  @RequirePermission('manage_form', PERMISSION.READ)
  async findOne(@Param('id') id: string) {
    validateUuid(id);
    const data = await this.formService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.FORM.FOUND);
  }

  @Patch(':id')
  @RequirePermission('manage_form', PERMISSION.UPDATE)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(formDto.UpdateFormSchema))
    body: formDto.UpdateFormDto,
  ) {
    validateUuid(id);
    const data = await this.formService.update(id, body);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.FORM.UPDATED);
  }

  @Delete(':id')
  @RequirePermission('manage_form', PERMISSION.DELETE)
  async remove(@Param('id') id: string) {
    validateUuid(id);
    const data = await this.formService.remove(id);
    return ResponseUtil.success(data.message);
  }
}
