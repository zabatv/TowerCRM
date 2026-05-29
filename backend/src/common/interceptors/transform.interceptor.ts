import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

function stripSensitive(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripSensitive);
  
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'passwordHash') continue;
    result[key] = typeof value === 'object' && value !== null ? stripSensitive(value) : value;
  }
  return result;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        data: stripSensitive(data),
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
