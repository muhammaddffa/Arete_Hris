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
  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return createResponse(200, message, data);
  }

  static created<T>(data: T, message = 'Created'): ApiResponse<T> {
    return createResponse(201, message, data);
  }

  static successWithMeta<T>(
    data: T,
    meta: PaginationMeta,
    message = 'Success',
  ): ApiResponse<T> {
    return createResponse(200, message, data, meta);
  }

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
