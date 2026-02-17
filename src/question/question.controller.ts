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
import { QuestionService } from './question.service';
import type {
  CreateQuestionDto,
  UpdateQuestionDto,
  BulkCreateQuestionsDto,
  ReorderQuestionsDto,
} from './dto/question.dto';
import {
  CreateQuestionSchema,
  UpdateQuestionSchema,
  BulkCreateQuestionsSchema,
  ReorderQuestionsSchema,
} from './dto/question.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION } from '../common/constants/permission.constant';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Question')
@Controller('questions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @RequirePermission('manage_form', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateQuestionSchema))
  @ApiOperation({ summary: 'Buat question baru' })
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    const data = await this.questionService.create(createQuestionDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.QUESTION.CREATED);
  }

  @Post('bulk')
  @RequirePermission('manage_form', PERMISSION.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(BulkCreateQuestionsSchema))
  @ApiOperation({ summary: 'Bulk create questions' })
  async bulkCreate(@Body() bulkCreateDto: BulkCreateQuestionsDto) {
    const data = await this.questionService.bulkCreate(bulkCreateDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.QUESTION.BULK_CREATED);
  }

  @Get('form/:idForm')
  @RequirePermission('manage_form', PERMISSION.READ)
  @ApiOperation({ summary: 'Get questions by form ID' })
  async findByFormId(@Param('idForm', ParseUUIDPipe) idForm: string) {
    const data = await this.questionService.findByFormId(idForm);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.LIST);
  }

  @Get(':id/statistics')
  @RequirePermission('manage_form', PERMISSION.READ)
  @ApiOperation({ summary: 'Get statistik question' })
  async getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.questionService.getStatistics(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.STATISTICS);
  }

  @Get(':id')
  @RequirePermission('manage_form', PERMISSION.READ)
  @ApiOperation({ summary: 'Get question by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.questionService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.FOUND);
  }

  @Patch('form/:idForm/reorder')
  @RequirePermission('manage_form', PERMISSION.UPDATE)
  @UsePipes(new ZodValidationPipe(ReorderQuestionsSchema))
  @ApiOperation({ summary: 'Reorder questions' })
  async reorder(
    @Param('idForm', ParseUUIDPipe) idForm: string,
    @Body() reorderDto: ReorderQuestionsDto,
  ) {
    const data = await this.questionService.reorder(idForm, reorderDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.REORDERED);
  }

  @Patch(':id')
  @RequirePermission('manage_form', PERMISSION.UPDATE)
  @UsePipes(new ZodValidationPipe(UpdateQuestionSchema))
  @ApiOperation({ summary: 'Update question' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    const data = await this.questionService.update(id, updateQuestionDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.UPDATED);
  }

  @Delete(':id')
  @RequirePermission('manage_form', PERMISSION.DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete question' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.questionService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.DELETED);
  }
}
