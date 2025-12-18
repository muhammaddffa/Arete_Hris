/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  BulkCreateQuestionsDto,
  ReorderQuestionsDto,
} from './dto/question.dto';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const form = await this.prisma.refForm.findUnique({
      where: { idForm: createQuestionDto.idForm },
    });

    if (!form) {
      throw new NotFoundException(RESPONSE_MESSAGES.FORM.NOT_FOUND);
    }

    try {
      return await this.prisma.refQuestion.create({
        data: {
          idForm: createQuestionDto.idForm,
          nameQuestion: createQuestionDto.nameQuestion,
          questionType: createQuestionDto.questionType,
          isRequired: createQuestionDto.isRequired ?? false,
          orderNumber: createQuestionDto.orderNumber,
          options: createQuestionDto.options
            ? {
                create: createQuestionDto.options.map((opt) => ({
                  optionText: opt.optionText,
                  optionValue: opt.optionValue,
                  orderNumber: opt.orderNumber,
                })),
              }
            : undefined,
        },
        include: {
          options: {
            orderBy: { orderNumber: 'asc' },
          },
          form: {
            select: {
              idForm: true,
              nameForm: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Gagal membuat pertanyaan: ${error.message}`,
      );
    }
  }

  async bulkCreate(bulkCreateDto: BulkCreateQuestionsDto) {
    const form = await this.prisma.refForm.findUnique({
      where: { idForm: bulkCreateDto.idForm },
    });

    if (!form) {
      throw new NotFoundException(RESPONSE_MESSAGES.FORM.NOT_FOUND);
    }

    try {
      return await this.prisma.$transaction(
        bulkCreateDto.questions.map((q) =>
          this.prisma.refQuestion.create({
            data: {
              idForm: bulkCreateDto.idForm,
              nameQuestion: q.nameQuestion,
              questionType: q.questionType,
              isRequired: q.isRequired ?? false,
              orderNumber: q.orderNumber,
              options: q.options
                ? {
                    create: q.options.map((opt) => ({
                      optionText: opt.optionText,
                      optionValue: opt.optionValue,
                      orderNumber: opt.orderNumber,
                    })),
                  }
                : undefined,
            },
            include: {
              options: {
                orderBy: { orderNumber: 'asc' },
              },
            },
          }),
        ),
      );
    } catch (error) {
      throw new BadRequestException(
        `Gagal membuat pertanyaan secara bulk: ${error.message}`,
      );
    }
  }

  async findByFormId(idForm: string) {
    return await this.prisma.refQuestion.findMany({
      where: { idForm },
      orderBy: { orderNumber: 'asc' },
      include: {
        options: {
          orderBy: { orderNumber: 'asc' },
        },
        form: {
          select: {
            idForm: true,
            nameForm: true,
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const question = await this.prisma.refQuestion.findUnique({
      where: { idQuestion: id },
      include: {
        options: {
          orderBy: { orderNumber: 'asc' },
        },
        form: {
          select: {
            idForm: true,
            nameForm: true,
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException(RESPONSE_MESSAGES.QUESTION.NOT_FOUND);
    }

    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    await this.findOne(id);

    try {
      return await this.prisma.refQuestion.update({
        where: { idQuestion: id },
        data: {
          nameQuestion: updateQuestionDto.nameQuestion,
          questionType: updateQuestionDto.questionType,
          isRequired: updateQuestionDto.isRequired,
          orderNumber: updateQuestionDto.orderNumber,
        },
        include: {
          options: {
            orderBy: { orderNumber: 'asc' },
          },
          form: {
            select: {
              idForm: true,
              nameForm: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Gagal mengupdate pertanyaan: ${error.message}`,
      );
    }
  }

  async reorder(idForm: string, reorderDto: ReorderQuestionsDto) {
    try {
      await this.prisma.$transaction(
        reorderDto.questions.map((q) =>
          this.prisma.refQuestion.update({
            where: { idQuestion: q.idQuestion },
            data: { orderNumber: q.orderNumber },
          }),
        ),
      );

      return await this.findByFormId(idForm);
    } catch (error) {
      throw new BadRequestException(
        `Gagal mengubah urutan pertanyaan: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.refQuestion.delete({
        where: { idQuestion: id },
      });
    } catch (error) {
      throw new BadRequestException(
        `Gagal menghapus pertanyaan: ${error.message}`,
      );
    }
  }

  async getStatistics(id: string) {
    const question = await this.findOne(id);

    const [answerStats, textAnswers] = await Promise.all([
      this.prisma.answer.groupBy({
        by: ['idOption'],
        where: { idQuestion: id },
        _count: true,
      }),
      this.prisma.answer.findMany({
        where: {
          idQuestion: id,
          textAnswer: { not: null },
        },
        select: {
          textAnswer: true,
          createdAt: true,
          karyawan: {
            select: {
              nama: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      question: {
        idQuestion: question.idQuestion,
        nameQuestion: question.nameQuestion,
        questionType: question.questionType,
      },
      totalAnswers: question._count.answers,
      optionStats: answerStats,
      textAnswers:
        question.questionType === 'text' || question.questionType === 'textarea'
          ? textAnswers
          : [],
    };
  }
}
