import { Response } from '../@types';

export function response<T>(
  status: boolean,
  statusCode: number,
  message: string,
  data?: T,
  meta?: Record<string, any>,
): Response<T> {
  return {
    status,
    statusCode,
    message,
    data,
    meta,
  };
}

export function successResponse<T>({
  data,
  message = 'Success',
  statusCode = 200,
  meta,
}: {
  data?: T;
  message?: string;
  statusCode?: number;
  meta?: Record<string, any>;
}): Response<T> {
  return response(true, statusCode, message, data, meta);
}

export function errorResponse<T>({
  message = 'Error',
  statusCode = 400,
  data,
  meta,
}: {
  message?: string;
  statusCode?: number;
  data?: T;
  meta?: Record<string, any>;
}): Response<T> {
  return response(false, statusCode, message, data, meta);
}
