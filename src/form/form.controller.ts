/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { FormService } from './form.service';
import * as formDto from './dto/form.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseUtil } from '../common/utils/response.util';
import { validateUuid } from './form.validation';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { ApiTags } from '@nestjs/swagger';

@Controller('forms')
@ApiTags('Form')
// @UseGuards(JwtAuthGuard)
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(formDto.CreateFormSchema))
  async create(@Body() createFormDto: formDto.CreateFormDto) {
    const data = await this.formService.create(createFormDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.FORM.CREATED);
  }

  @Get()
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    validateUuid(id);
    const data = await this.formService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.FORM.FOUND);
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: string) {
    validateUuid(id);
    const data = await this.formService.getStatistics(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.FORM.STATISTICS);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(formDto.UpdateFormSchema))
  async update(
    @Param('id') id: string,
    @Body() updateFormDto: formDto.UpdateFormDto,
  ) {
    validateUuid(id);
    const data = await this.formService.update(id, updateFormDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.FORM.UPDATED);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    validateUuid(id);
    const data = await this.formService.remove(id);
    return ResponseUtil.success(data.message);
  }
}
