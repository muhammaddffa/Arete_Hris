// src/common/interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = ctx.getResponse();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return next.handle().pipe(
      map((data) => {
        // Jika data sudah dalam format response yang benar, langsung return
        if (data && typeof data === 'object' && 'statusCode' in data) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return data;
        }

        // Jika data memiliki meta (pagination), extract meta
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const meta = data?.meta;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const actualData = meta ? data.data : data;

        // Wrap response
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const wrappedResponse: ApiResponse<T> = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          statusCode: response.statusCode,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          message: this.getSuccessMessage(request.method),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: actualData,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          ...(meta && { meta }),
          timestamp: new Date().toISOString(),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          path: request.url,
        };

        return wrappedResponse;
      }),
    );
  }

  private getSuccessMessage(method: string): string {
    const messages: Record<string, string> = {
      GET: 'Data berhasil diambil',
      POST: 'Data berhasil dibuat',
      PATCH: 'Data berhasil diupdate',
      PUT: 'Data berhasil diupdate',
      DELETE: 'Data berhasil dihapus',
    };

    return messages[method] || 'Operasi berhasil';
  }
}
