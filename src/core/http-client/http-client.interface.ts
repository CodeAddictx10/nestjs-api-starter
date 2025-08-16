import { Observable } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { ModuleMetadata, Type } from '@nestjs/common';

export interface HttpApiClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface HttpApiClientOptionsFactory {
  createHttpOptions(): Promise<HttpApiClientOptions> | HttpApiClientOptions;
}

export interface HttpApiClientAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<HttpApiClientOptions> | HttpApiClientOptions;
  inject?: any[];
  useClass?: Type<HttpApiClientOptionsFactory>;
  useExisting?: Type<HttpApiClientOptionsFactory>;
}

export type ErrorHandler = (error: any) => Observable<never>;

export interface RequestOptions extends Partial<AxiosRequestConfig> {
  customErrorHandler?: ErrorHandler;
  retryConfig?: {
    times: number;
    delay: number;
  };
}

export interface IHttpApiClient {
  makeRequest<T = any>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T>;

  get<T = any>(endpoint: string, options?: RequestOptions): Promise<T>;
  post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T>;
  put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T>;
  delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T>;
  patch<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T>;
}
