/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto, UpdateFormDto, FilterFormDto } from './dto/form.dto';
import { createPaginatedResponse } from '../common/utils/pagination.utils';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  // Create Form
  async create(createFormDto: CreateFormDto) {
    try {
      const form = await this.prisma.refForm.create({
        data: {
          nameForm: createFormDto.nameForm,
          deskripsi: createFormDto.deskripsi,
          isActive: createFormDto.isActive ?? true,
        },
        include: {
          questions: {
            orderBy: { orderNumber: 'asc' },
            include: {
              options: {
                orderBy: { orderNumber: 'asc' },
              },
            },
          },
        },
      });

      return form;
    } catch (error) {
      throw new BadRequestException('Gagal membuat form: ' + error.message);
    }
  }

  // Get All Forms dengan Pagination
  async findAll(filterDto: FilterFormDto) {
    const page = parseInt(filterDto.page) || 1;
    const limit = parseInt(filterDto.limit) || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filterDto.search) {
      where.OR = [
        { nameForm: { contains: filterDto.search, mode: 'insensitive' } },
        { deskripsi: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }

    if (filterDto.isActive !== undefined) {
      where.isActive = filterDto.isActive === 'true';
    }

    // Count total
    const total = await this.prisma.refForm.count({ where });

    // Get data
    const data = await this.prisma.refForm.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [filterDto.sortBy || 'createdAt']: filterDto.sortOrder || 'desc',
      },
      include: {
        questions: {
          orderBy: { orderNumber: 'asc' },
          include: {
            options: {
              orderBy: { orderNumber: 'asc' },
            },
          },
        },
        _count: {
          select: {
            questions: true,
            answers: true,
          },
        },
      },
    });

    return createPaginatedResponse(data, total, page, limit);
  }

  // Get Form by ID
  async findOne(id: string) {
    const form = await this.prisma.refForm.findUnique({
      where: { idForm: id },
      include: {
        questions: {
          orderBy: { orderNumber: 'asc' },
          include: {
            options: {
              orderBy: { orderNumber: 'asc' },
            },
          },
        },
        _count: {
          select: {
            questions: true,
            answers: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(`Form dengan ID ${id} tidak ditemukan`);
    }

    return form;
  }

  // Update Form
  async update(id: string, updateFormDto: UpdateFormDto) {
    // Check if form exists
    await this.findOne(id);

    try {
      const updatedForm = await this.prisma.refForm.update({
        where: { idForm: id },
        data: {
          nameForm: updateFormDto.nameForm,
          deskripsi: updateFormDto.deskripsi,
          isActive: updateFormDto.isActive,
        },
        include: {
          questions: {
            orderBy: { orderNumber: 'asc' },
            include: {
              options: {
                orderBy: { orderNumber: 'asc' },
              },
            },
          },
        },
      });

      return updatedForm;
    } catch (error) {
      throw new BadRequestException('Gagal mengupdate form: ' + error.message);
    }
  }

  // Delete Form
  async remove(id: string) {
    // Check if form exists
    await this.findOne(id);

    try {
      await this.prisma.refForm.delete({
        where: { idForm: id },
      });

      return { message: 'Form berhasil dihapus' };
    } catch (error) {
      throw new BadRequestException('Gagal menghapus form: ' + error.message);
    }
  }

  // Get Form Statistics
  async getStatistics(id: string) {
    const form = await this.findOne(id);

    const totalResponses = await this.prisma.answer.groupBy({
      by: ['idKaryawan'],
      where: { idForm: id },
      _count: true,
    });

    const questionStats = await this.prisma.answer.groupBy({
      by: ['idQuestion'],
      where: { idForm: id },
      _count: true,
    });

    return {
      form: {
        idForm: form.idForm,
        nameForm: form.nameForm,
      },
      totalQuestions: form._count.questions,
      totalResponses: totalResponses.length,
      totalAnswers: form._count.answers,
      questionStats,
    };
  }
}
