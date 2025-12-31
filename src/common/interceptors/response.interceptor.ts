/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const contentType = request.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      // Untuk multipart, langsung pass tanpa transform
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // Jika data sudah dalam format response yang benar, langsung return
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data;
        }

        // Jika data memiliki meta (pagination), extract meta
        const meta = data?.meta;
        const actualData = meta ? data.data : data;

        // Wrap response
        const wrappedResponse: ApiResponse<T> = {
          statusCode: response.statusCode,
          message: this.getSuccessMessage(request.method),
          data: actualData,
          ...(meta && { meta }),
          timestamp: new Date().toISOString(),
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
