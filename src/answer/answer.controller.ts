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
  FilterAnswerDto, // Class DTO
  CreateAnswerSchema,
  SubmitFormSchema,
  UpdateAnswerSchema,
  ExportAnswersSchema,
} from './dto/answer.dto';

import { ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
// import { Public } from '../auth/decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Answer')
@Controller('answers')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateAnswerSchema))
  @ApiOperation({ summary: 'Create single answer' })
  async create(@Body() createAnswerDto: CreateAnswerDto) {
    const data = await this.answerService.create(createAnswerDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.ANSWER.CREATED);
  }

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(SubmitFormSchema))
  @ApiOperation({ summary: 'Submit form (bulk answers)' })
  async submitForm(@Body() submitFormDto: SubmitFormDto) {
    const data = await this.answerService.submitForm(submitFormDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.ANSWER.SUBMITTED);
  }

  @Get()
  //   @UseGuards(PermissionsGuard)
  //   @RequirePermissions('view_all_answers')
  @ApiOperation({ summary: 'Get all answers (HRD & Manager)' })
  async findAll(@Query() query: FilterAnswerDto) {
    const result = await this.answerService.findAll(query);
    return ResponseUtil.successWithMeta(
      result.data,
      result.meta,
      RESPONSE_MESSAGES.ANSWER.LIST,
    );
  }

  @Get('form/:idForm')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('view_form_responses')
  @ApiOperation({ summary: 'Get all responses for a form (HRD & Manager)' })
  async findByFormId(@Param('idForm', ParseUUIDPipe) idForm: string) {
    const data = await this.answerService.findByFormId(idForm);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.RESPONSES_LIST);
  }

  @Get('form/:idForm/user/:idKaryawan')
  @ApiOperation({ summary: "Get user's answers for a form" })
  async findUserAnswers(
    @Param('idForm', ParseUUIDPipe) idForm: string,
    @Param('idKaryawan', ParseUUIDPipe) idKaryawan: string,
  ) {
    const data = await this.answerService.findUserAnswers(idForm, idKaryawan);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.USER_ANSWERS);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get answer by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.answerService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.FOUND);
  }

  @Post('export')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('export_answers')
  @UsePipes(new ZodValidationPipe(ExportAnswersSchema))
  @ApiOperation({ summary: 'Export answers (HRD & Manager)' })
  async exportAnswers(@Body() exportDto: ExportAnswersDto) {
    const data = await this.answerService.exportAnswers(exportDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.EXPORTED);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateAnswerSchema))
  @ApiOperation({ summary: 'Update answer' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ) {
    const data = await this.answerService.update(id, updateAnswerDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.UPDATED);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete answer' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.answerService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.DELETED);
  }

  @Delete('form/:idForm/user/:idKaryawan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete user's all answers for a form" })
  async removeUserAnswers(
    @Param('idForm', ParseUUIDPipe) idForm: string,
    @Param('idKaryawan', ParseUUIDPipe) idKaryawan: string,
  ) {
    const data = await this.answerService.removeUserAnswers(idForm, idKaryawan);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.ANSWER.DELETED);
  }
}
