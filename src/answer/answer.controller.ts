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
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnswerService } from './answer.service';

import type {
  CreateAnswerDto,
  SubmitFormDto,
  UpdateAnswerDto,
  ExportAnswersDto,
} from './dto/answer.dto';

import {
  FilterAnswerDto,
  CreateAnswerSchema,
  SubmitFormSchema,
  UpdateAnswerSchema,
  ExportAnswersSchema,
} from './dto/answer.dto';

import { ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Answer')
@Controller('answers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  @RequirePermission('answer_form', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateAnswerSchema))
  @ApiOperation({ summary: 'Create single answer' })
  async create(@Body() createAnswerDto: CreateAnswerDto) {
    const data = await this.answerService.create(createAnswerDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.ANSWER.CREATED);
  }

  @Post('submit')
  @RequirePermission('answer_form', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(SubmitFormSchema))
  @ApiOperation({ summary: 'Submit form (bulk answers)' })
  async submitForm(@Body() submitFormDto: SubmitFormDto) {
    const data = await this.answerService.submitForm(submitFormDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.ANSWER.SUBMITTED);
  }

  @Post('export')
  @RequirePermission('view_form_responses', PERMISSION.READ)
  @UsePipes(new ZodValidationPipe(ExportAnswersSchema))
  @ApiOperation({ summary: 'Export answers' })
  async exportAnswers(@Body() exportDto: ExportAnswersDto) {
    const data = await this.answerService.exportAnswers(exportDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.EXPORTED);
  }

  @Get()
  @RequirePermission('view_form_responses', PERMISSION.READ)
  @ApiOperation({ summary: 'Get semua answers' })
  async findAll(@Query() query: FilterAnswerDto) {
    const result = await this.answerService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.ANSWER.LIST,
    );
  }

  @Get('form/:idForm')
  @RequirePermission('view_form_responses', PERMISSION.READ)
  @ApiOperation({ summary: 'Get semua responses untuk satu form' })
  async findByFormId(@Param('idForm', ParseUUIDPipe) idForm: string) {
    const data = await this.answerService.findByFormId(idForm);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.RESPONSES_LIST);
  }

  @Get('form/:idForm/user/:idKaryawan')
  @RequirePermission('answer_form', PERMISSION.READ)
  @ApiOperation({ summary: 'Get jawaban karyawan untuk satu form' })
  async findUserAnswers(
    @Param('idForm', ParseUUIDPipe) idForm: string,
    @Param('idKaryawan', ParseUUIDPipe) idKaryawan: string,
  ) {
    const data = await this.answerService.findUserAnswers(idForm, idKaryawan);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.USER_ANSWERS);
  }

  @Get(':id')
  @RequirePermission('answer_form', PERMISSION.READ)
  @ApiOperation({ summary: 'Get answer by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.answerService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.FOUND);
  }

  @Patch(':id')
  @RequirePermission('answer_form', PERMISSION.UPDATE)
  @UsePipes(new ZodValidationPipe(UpdateAnswerSchema))
  @ApiOperation({ summary: 'Update answer' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ) {
    const data = await this.answerService.update(id, updateAnswerDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.UPDATED);
  }

  @Delete('form/:idForm/user/:idKaryawan')
  @RequirePermission('answer_form', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus semua jawaban karyawan untuk satu form' })
  async removeUserAnswers(
    @Param('idForm', ParseUUIDPipe) idForm: string,
    @Param('idKaryawan', ParseUUIDPipe) idKaryawan: string,
  ) {
    const data = await this.answerService.removeUserAnswers(idForm, idKaryawan);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.DELETED);
  }

  @Delete(':id')
  @RequirePermission('answer_form', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete answer by ID' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.answerService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.DELETED);
  }
}
