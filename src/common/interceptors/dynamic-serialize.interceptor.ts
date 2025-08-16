/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';
import { Reflector } from '@nestjs/core';
import { SERIALIZE_OPTIONS_KEY } from '../decorators';
import { SerializeDefaults } from '@common/@types';

@Injectable()
export class DynamicSerializeInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private defaults: SerializeDefaults = {},
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options =
      this.reflector.get<{
        groups?: string[];
        version?: number;
        excludeExtraneousValues?: boolean;
      }>(SERIALIZE_OPTIONS_KEY, context.getHandler()) ?? {};

    const merged = {
      excludeExtraneousValues:
        options.excludeExtraneousValues ??
        this.defaults.excludeExtraneousValues, // sensible default
      groups: options.groups ?? this.defaults.groups,
      version: options.version ?? this.defaults.version,
    };
    return next.handle().pipe(
      map((data) => {
        // If it's a primitive or already plain, just return it.
        if (data == null || typeof data !== 'object') return data;

        return instanceToPlain(data, { ...merged });
      }),
    );
  }
}
