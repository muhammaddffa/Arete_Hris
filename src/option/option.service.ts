/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOptionDto,
  UpdateOptionDto,
  BulkCreateOptionsDto,
  ReorderOptionsDto,
} from './dto/option.dto';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@Injectable()
export class OptionService {
  constructor(private prisma: PrismaService) {}

  async create(createOptionDto: CreateOptionDto) {
    const question = await this.prisma.refQuestion.findUnique({
      where: { idQuestion: createOptionDto.idQuestion },
    });

    if (!question) {
      throw new NotFoundException(RESPONSE_MESSAGES.QUESTION.NOT_FOUND);
    }

    try {
      return await this.prisma.refOption.create({
        data: {
          idQuestion: createOptionDto.idQuestion,
          optionText: createOptionDto.optionText,
          optionValue: createOptionDto.optionValue,
          orderNumber: createOptionDto.orderNumber,
        },
        include: {
          question: {
            select: {
              idQuestion: true,
              nameQuestion: true,
              questionType: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(`Gagal membuat opsi: ${error.message}`);
    }
  }

  async bulkCreate(bulkCreateDto: BulkCreateOptionsDto) {
    const question = await this.prisma.refQuestion.findUnique({
      where: { idQuestion: bulkCreateDto.idQuestion },
    });

    if (!question) {
      throw new NotFoundException(RESPONSE_MESSAGES.QUESTION.NOT_FOUND);
    }

    try {
      return await this.prisma.$transaction(
        bulkCreateDto.options.map((opt) =>
          this.prisma.refOption.create({
            data: {
              idQuestion: bulkCreateDto.idQuestion,
              optionText: opt.optionText,
              optionValue: opt.optionValue,
              orderNumber: opt.orderNumber,
            },
          }),
        ),
      );
    } catch (error) {
      throw new BadRequestException(
        `Gagal membuat opsi secara bulk: ${error.message}`,
      );
    }
  }

  async findByQuestionId(idQuestion: string) {
    return await this.prisma.refOption.findMany({
      where: { idQuestion },
      orderBy: { orderNumber: 'asc' },
      include: {
        question: {
          select: {
            idQuestion: true,
            nameQuestion: true,
            questionType: true,
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
    const option = await this.prisma.refOption.findUnique({
      where: { idOption: id },
      include: {
        question: {
          select: {
            idQuestion: true,
            nameQuestion: true,
            questionType: true,
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    if (!option) {
      throw new NotFoundException(RESPONSE_MESSAGES.OPTION.NOT_FOUND);
    }

    return option;
  }

  async update(id: string, updateOptionDto: UpdateOptionDto) {
    await this.findOne(id);

    try {
      return await this.prisma.refOption.update({
        where: { idOption: id },
        data: {
          optionText: updateOptionDto.optionText,
          optionValue: updateOptionDto.optionValue,
          orderNumber: updateOptionDto.orderNumber,
        },
        include: {
          question: {
            select: {
              idQuestion: true,
              nameQuestion: true,
              questionType: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(`Gagal mengupdate opsi: ${error.message}`);
    }
  }

  async reorder(idQuestion: string, reorderDto: ReorderOptionsDto) {
    try {
      await this.prisma.$transaction(
        reorderDto.options.map((opt) =>
          this.prisma.refOption.update({
            where: { idOption: opt.idOption },
            data: { orderNumber: opt.orderNumber },
          }),
        ),
      );

      return await this.findByQuestionId(idQuestion);
    } catch (error) {
      throw new BadRequestException(
        `Gagal mengubah urutan opsi: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.refOption.delete({
        where: { idOption: id },
      });
    } catch (error) {
      throw new BadRequestException(`Gagal menghapus opsi: ${error.message}`);
    }
  }
}
