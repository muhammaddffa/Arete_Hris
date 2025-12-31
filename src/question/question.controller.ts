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
  //   UseGuards,
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
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { PermissionsGuard } from '../auth/guards/permissions.guard';
// import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Question')
@Controller('questions')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  //   @UseGuards(PermissionsGuard)
  //   @RequirePermissions('manage_form')
  @UsePipes(new ZodValidationPipe(CreateQuestionSchema))
  @ApiOperation({ summary: 'Create question (HRD & Admin only)' })
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    const data = await this.questionService.create(createQuestionDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.QUESTION.CREATED);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  //   @UseGuards(PermissionsGuard)
  //   @RequirePermissions('manage_form')
  @UsePipes(new ZodValidationPipe(BulkCreateQuestionsSchema))
  @ApiOperation({ summary: 'Bulk create questions (HRD & Admin only)' })
  async bulkCreate(@Body() bulkCreateDto: BulkCreateQuestionsDto) {
    const data = await this.questionService.bulkCreate(bulkCreateDto);
    return ResponseUtil.created(data, RESPONSE_MESSAGES.QUESTION.BULK_CREATED);
  }

  @Get('form/:idForm')
  @Public()
  @ApiOperation({ summary: 'Get questions by form ID' })
  async findByFormId(@Param('idForm', ParseUUIDPipe) idForm: string) {
    const data = await this.questionService.findByFormId(idForm);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.LIST);
  }

  @Get(':id/statistics')
  //   @UseGuards(PermissionsGuard)
  //   @RequirePermissions('view_form_statistics')
  @ApiOperation({ summary: 'Get question statistics (HRD & Manager)' })
  async getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.questionService.getStatistics(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.STATISTICS);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get question by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.questionService.findOne(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.FOUND);
  }

  @Patch(':id')
  //   @UseGuards(PermissionsGuard)
  //   @RequirePermissions('manage_form')
  @UsePipes(new ZodValidationPipe(UpdateQuestionSchema))
  @ApiOperation({ summary: 'Update question (HRD & Admin only)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    const data = await this.questionService.update(id, updateQuestionDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.UPDATED);
  }

  @Patch('form/:idForm/reorder')
  //   @UseGuards(PermissionsGuard)
  //   @RequirePermissions('manage_form')
  @UsePipes(new ZodValidationPipe(ReorderQuestionsSchema))
  @ApiOperation({ summary: 'Reorder questions (HRD & Admin only)' })
  async reorder(
    @Param('idForm', ParseUUIDPipe) idForm: string,
    @Body() reorderDto: ReorderQuestionsDto,
  ) {
    const data = await this.questionService.reorder(idForm, reorderDto);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.REORDERED);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  //   @UseGuards(PermissionsGuard)
  //   @RequirePermissions('manage_form')
  @ApiOperation({ summary: 'Delete question (HRD & Admin only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.questionService.remove(id);
    return ResponseUtil.success(data, RESPONSE_MESSAGES.QUESTION.DELETED);
  }
}
