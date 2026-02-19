// src/common/utils/response.util.ts

import { ApiResponse } from '../interfaces/response.interface';
import { PaginationMeta } from './pagination.utils';

export function createResponse<T>(
  statusCode: number,
  message: string,
  data?: T,
  meta?: PaginationMeta,
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== undefined) response.data = data;
  if (meta !== undefined) response.meta = meta;

  return response;
}

export class ResponseUtil {
  // ✅ Generic — bisa untuk semua tipe data, dengan opsional meta pagination
  static success<T>(
    data: T,
    message = 'Success',
    meta?: PaginationMeta,
  ): ApiResponse<T> {
    return createResponse(200, message, data, meta);
  }

  // ✅ Untuk response 201 Created
  static created<T>(data: T, message = 'Created'): ApiResponse<T> {
    return createResponse(201, message, data);
  }

  // ✅ Alias eksplisit kalau ingin lebih readable di controller
  static successWithMeta<T>(
    data: T,
    meta: PaginationMeta,
    message = 'Success',
  ): ApiResponse<T> {
    return createResponse(200, message, data, meta);
  }

  // ✅ Untuk response error
  static error(
    statusCode: number,
    message: string | string[],
    error: string,
    path: string,
  ) {
    return {
      statusCode,
      message,
      error,
      path,
      timestamp: new Date().toISOString(),
    };
  }
}
