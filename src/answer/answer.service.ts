/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAnswerDto,
  SubmitFormDto,
  UpdateAnswerDto,
  FilterAnswerDto,
  ExportAnswersDto,
} from './dto/answer.dto';
import { RESPONSE_MESSAGES } from '../common/constants/response-messages.constant';

@Injectable()
export class AnswerService {
  constructor(private prisma: PrismaService) {}

  async create(createAnswerDto: CreateAnswerDto) {
    // Verify form exists
    const form = await this.prisma.refForm.findUnique({
      where: { idForm: createAnswerDto.idForm },
    });
    if (!form) {
      throw new NotFoundException(RESPONSE_MESSAGES.FORM.NOT_FOUND);
    }

    // Verify question exists and belongs to form
    const question = await this.prisma.refQuestion.findFirst({
      where: {
        idQuestion: createAnswerDto.idQuestion,
        idForm: createAnswerDto.idForm,
      },
    });
    if (!question) {
      throw new NotFoundException(RESPONSE_MESSAGES.QUESTION.INVALID_FORM);
    }

    // Verify karyawan exists
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: createAnswerDto.idKaryawan },
    });
    if (!karyawan) {
      throw new NotFoundException(RESPONSE_MESSAGES.KARYAWAN.NOT_FOUND);
    }

    // If idOption provided, verify it exists and belongs to question
    if (createAnswerDto.idOption) {
      const option = await this.prisma.refOption.findFirst({
        where: {
          idOption: createAnswerDto.idOption,
          idQuestion: createAnswerDto.idQuestion,
        },
      });
      if (!option) {
        throw new NotFoundException(RESPONSE_MESSAGES.ANSWER.INVALID_OPTION);
      }
    }

    try {
      return await this.prisma.answer.create({
        data: {
          idForm: createAnswerDto.idForm,
          idQuestion: createAnswerDto.idQuestion,
          idKaryawan: createAnswerDto.idKaryawan,
          idOption: createAnswerDto.idOption,
          textAnswer: createAnswerDto.textAnswer,
        },
        include: {
          form: {
            select: {
              idForm: true,
              nameForm: true,
            },
          },
          question: {
            select: {
              idQuestion: true,
              nameQuestion: true,
              questionType: true,
            },
          },
          karyawan: {
            select: {
              idKaryawan: true,
              nama: true,
              nik: true,
            },
          },
          option: {
            select: {
              idOption: true,
              optionText: true,
              optionValue: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Gagal menyimpan jawaban: ${error.message}`,
      );
    }
  }

  async submitForm(submitFormDto: SubmitFormDto) {
    // Verify form exists
    const form = await this.prisma.refForm.findUnique({
      where: { idForm: submitFormDto.idForm },
      include: {
        questions: {
          where: { isRequired: true },
          select: { idQuestion: true },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(RESPONSE_MESSAGES.FORM.NOT_FOUND);
    }

    // Verify karyawan exists
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: submitFormDto.idKaryawan },
    });

    if (!karyawan) {
      throw new NotFoundException(RESPONSE_MESSAGES.KARYAWAN.NOT_FOUND);
    }

    // Check if user already submitted this form
    const existingAnswers = await this.prisma.answer.findFirst({
      where: {
        idForm: submitFormDto.idForm,
        idKaryawan: submitFormDto.idKaryawan,
      },
    });

    if (existingAnswers) {
      throw new ConflictException(RESPONSE_MESSAGES.ANSWER.ALREADY_SUBMITTED);
    }

    // Validate required questions
    const requiredQuestionIds = form.questions.map((q) => q.idQuestion);
    const answeredQuestionIds = submitFormDto.answers.map((a) => a.idQuestion);
    const missingRequired = requiredQuestionIds.filter(
      (id) => !answeredQuestionIds.includes(id),
    );

    if (missingRequired.length > 0) {
      throw new BadRequestException(
        RESPONSE_MESSAGES.ANSWER.REQUIRED_NOT_FILLED,
      );
    }

    // Validate all questions and options
    for (const answer of submitFormDto.answers) {
      const question = await this.prisma.refQuestion.findFirst({
        where: {
          idQuestion: answer.idQuestion,
          idForm: submitFormDto.idForm,
        },
      });

      if (!question) {
        throw new NotFoundException(RESPONSE_MESSAGES.QUESTION.NOT_FOUND);
      }

      if (answer.idOption) {
        const option = await this.prisma.refOption.findFirst({
          where: {
            idOption: answer.idOption,
            idQuestion: answer.idQuestion,
          },
        });

        if (!option) {
          throw new NotFoundException(RESPONSE_MESSAGES.ANSWER.INVALID_OPTION);
        }
      }
    }

    try {
      const createdAnswers = await this.prisma.$transaction(
        submitFormDto.answers.map((answer) =>
          this.prisma.answer.create({
            data: {
              idForm: submitFormDto.idForm,
              idQuestion: answer.idQuestion,
              idKaryawan: submitFormDto.idKaryawan,
              idOption: answer.idOption,
              textAnswer: answer.textAnswer,
            },
            include: {
              question: {
                select: {
                  nameQuestion: true,
                  questionType: true,
                },
              },
              option: {
                select: {
                  optionText: true,
                },
              },
            },
          }),
        ),
      );

      return {
        totalAnswers: createdAnswers.length,
        answers: createdAnswers,
      };
    } catch (error) {
      throw new BadRequestException(`Gagal submit form: ${error.message}`);
    }
  }

  async findAll(query: FilterAnswerDto) {
    const {
      idForm,
      idQuestion,
      idKaryawan,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (idForm) where.idForm = idForm;
    if (idQuestion) where.idQuestion = idQuestion;
    if (idKaryawan) where.idKaryawan = idKaryawan;

    const [data, total] = await Promise.all([
      this.prisma.answer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          form: {
            select: {
              idForm: true,
              nameForm: true,
            },
          },
          question: {
            select: {
              idQuestion: true,
              nameQuestion: true,
              questionType: true,
            },
          },
          karyawan: {
            select: {
              idKaryawan: true,
              nama: true,
              nik: true,
            },
          },
          option: {
            select: {
              idOption: true,
              optionText: true,
              optionValue: true,
            },
          },
        },
      }),
      this.prisma.answer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findByFormId(idForm: string) {
    const form = await this.prisma.refForm.findUnique({
      where: { idForm },
    });

    if (!form) {
      throw new NotFoundException(RESPONSE_MESSAGES.FORM.NOT_FOUND);
    }

    const respondents = await this.prisma.answer.findMany({
      where: { idForm },
      distinct: ['idKaryawan'],
      select: {
        karyawan: {
          select: {
            idKaryawan: true,
            nama: true,
            nik: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const responses = await Promise.all(
      respondents.map(async (resp) => {
        const answers = await this.prisma.answer.findMany({
          where: {
            idForm,
            idKaryawan: resp.karyawan.idKaryawan,
          },
          include: {
            question: {
              select: {
                nameQuestion: true,
                questionType: true,
              },
            },
            option: {
              select: {
                optionText: true,
                optionValue: true,
              },
            },
          },
          orderBy: {
            question: {
              orderNumber: 'asc',
            },
          },
        });

        return {
          respondent: resp.karyawan,
          submittedAt: resp.createdAt,
          answers,
        };
      }),
    );

    return {
      form: {
        idForm: form.idForm,
        nameForm: form.nameForm,
      },
      totalResponses: responses.length,
      responses,
    };
  }

  async findUserAnswers(idForm: string, idKaryawan: string) {
    const answers = await this.prisma.answer.findMany({
      where: { idForm, idKaryawan },
      include: {
        form: {
          select: {
            nameForm: true,
          },
        },
        question: {
          select: {
            nameQuestion: true,
            questionType: true,
          },
        },
        option: {
          select: {
            optionText: true,
            optionValue: true,
          },
        },
      },
      orderBy: {
        question: {
          orderNumber: 'asc',
        },
      },
    });

    if (answers.length === 0) {
      throw new NotFoundException(RESPONSE_MESSAGES.ANSWER.NOT_FOUND);
    }

    return {
      form: answers[0].form,
      karyawan: { idKaryawan },
      submittedAt: answers[0].createdAt,
      answers,
    };
  }

  async findOne(id: string) {
    const answer = await this.prisma.answer.findUnique({
      where: { idAnswer: id },
      include: {
        form: {
          select: {
            idForm: true,
            nameForm: true,
          },
        },
        question: {
          select: {
            idQuestion: true,
            nameQuestion: true,
            questionType: true,
          },
        },
        karyawan: {
          select: {
            idKaryawan: true,
            nama: true,
            nik: true,
          },
        },
        option: {
          select: {
            idOption: true,
            optionText: true,
            optionValue: true,
          },
        },
      },
    });

    if (!answer) {
      throw new NotFoundException(RESPONSE_MESSAGES.ANSWER.NOT_FOUND);
    }

    return answer;
  }

  async update(id: string, updateAnswerDto: UpdateAnswerDto) {
    const existingAnswer = await this.findOne(id);

    if (updateAnswerDto.idOption) {
      const option = await this.prisma.refOption.findFirst({
        where: {
          idOption: updateAnswerDto.idOption,
          idQuestion: existingAnswer.question.idQuestion,
        },
      });

      if (!option) {
        throw new NotFoundException(RESPONSE_MESSAGES.ANSWER.INVALID_OPTION);
      }
    }

    try {
      return await this.prisma.answer.update({
        where: { idAnswer: id },
        data: {
          idOption: updateAnswerDto.idOption,
          textAnswer: updateAnswerDto.textAnswer,
        },
        include: {
          form: {
            select: {
              nameForm: true,
            },
          },
          question: {
            select: {
              nameQuestion: true,
              questionType: true,
            },
          },
          option: {
            select: {
              optionText: true,
              optionValue: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Gagal mengupdate jawaban: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.answer.delete({
        where: { idAnswer: id },
      });
    } catch (error) {
      throw new BadRequestException(
        `Gagal menghapus jawaban: ${error.message}`,
      );
    }
  }

  async removeUserAnswers(idForm: string, idKaryawan: string) {
    const answers = await this.prisma.answer.findMany({
      where: { idForm, idKaryawan },
    });

    if (answers.length === 0) {
      throw new NotFoundException(RESPONSE_MESSAGES.ANSWER.NOT_FOUND);
    }

    try {
      await this.prisma.answer.deleteMany({
        where: { idForm, idKaryawan },
      });

      return { deletedCount: answers.length };
    } catch (error) {
      throw new BadRequestException(
        `Gagal menghapus jawaban: ${error.message}`,
      );
    }
  }

  async exportAnswers(exportDto: ExportAnswersDto) {
    const responses = await this.findByFormId(exportDto.idForm);

    if (exportDto.format === 'csv') {
      return this.convertToCSV(responses);
    }

    return responses;
  }

  private convertToCSV(data: any) {
    const headers = ['Respondent', 'NIK', 'Question', 'Answer', 'Submitted At'];
    const rows: any[] = []; // ✅ TAMBAHKAN TIPE EXPLICIT

    data.responses.forEach((response: any) => {
      response.answers.forEach((answer: any) => {
        rows.push([
          response.respondent.nama,
          response.respondent.nik,
          answer.question.nameQuestion,
          answer.option?.optionText || answer.textAnswer || '-',
          response.submittedAt,
        ]);
      });
    });

    return {
      headers,
      rows,
      totalRows: rows.length,
    };
  }
}
