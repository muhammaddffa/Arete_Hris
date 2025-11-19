// src/common/utils/response.util.ts
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, PaginationMeta } from '../interfaces/response.interface';

export class ResponseUtil {
  static success<T>(
    data: T,
    message: string,
    statusCode: HttpStatus = HttpStatus.OK,
  ): ApiResponse<T> {
    return {
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static successWithMeta<T>(
    data: T,
    meta: PaginationMeta,
    message: string,
    statusCode: HttpStatus = HttpStatus.OK,
  ): ApiResponse<T> {
    return {
      statusCode,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  static created<T>(data: T, message: string): ApiResponse<T> {
    return this.success(data, message, HttpStatus.CREATED);
  }

  static noContent(message: string): ApiResponse<null> {
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
