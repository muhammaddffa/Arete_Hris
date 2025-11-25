/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/common/utils/response.util.ts
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, PaginationMeta } from '../interfaces/response.interface';

export class ResponseUtil {
  // Existing methods...

  static success<T>(data: T, message: string) {
    return {
      statusCode: 200,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static successWithMeta<T>(data: T, meta: any, message: string) {
    return {
      statusCode: 200,
      message,
      data, // ← Data at top level
      meta, // ← Meta at top level
      timestamp: new Date().toISOString(),
    };
  }

  static created<T>(data: T, message: string) {
    return {
      statusCode: 201,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
