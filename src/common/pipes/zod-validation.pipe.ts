/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import * as zod from 'zod';
import { ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: zod.ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      // TAMBAHKAN INI UNTUK DEBUGGING
      if (error instanceof ZodError) {
        console.log('--- ZOD VALIDATION ERROR ---');
        console.log(JSON.stringify(error, null, 2));
        console.log('--- PAYLOAD YANG DITERIMA ---');
        console.log(value);
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
