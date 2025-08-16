import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  Observable,
  firstValueFrom,
  throwError,
  catchError,
  retry,
  timer,
} from 'rxjs';
import {
  HttpApiClientOptions,
  RequestOptions,
  IHttpApiClient,
} from './http-client.interface';

@Injectable()
export class HttpApiClientService implements IHttpApiClient {
  private readonly logger = new Logger(HttpApiClientService.name);
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private retries: number;
  private retryDelay: number;

  constructor(
    private readonly httpService: HttpService,
    @Optional()
    @Inject('HTTP_API_CLIENT_OPTIONS')
    options?: HttpApiClientOptions,
  ) {
    this.baseUrl = options?.baseUrl || '';
    this.defaultHeaders = options?.defaultHeaders || {};
    this.timeout = options?.timeout || 10000;
    this.retries = options?.retries || 0;
    this.retryDelay = options?.retryDelay || 300;
    this.logger.log('HttpApiClient initialized');
  }

  /**
   * Update client configuration
   * @param options New configuration options
   */
  updateConfig(options: Partial<HttpApiClientOptions>): void {
    if (options.baseUrl !== undefined) {
      this.baseUrl = options.baseUrl;
    }

    if (options.defaultHeaders !== undefined) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        ...options.defaultHeaders,
      };
    }

    if (options.timeout !== undefined) {
      this.timeout = options.timeout;
    }

    if (options.retries !== undefined) {
      this.retries = options.retries;
    }

    if (options.retryDelay !== undefined) {
      this.retryDelay = options.retryDelay;
    }

    this.logger.log('HttpApiClient configuration updated');
  }

  /**
   * Make an API request with customizable options
   * @param method HTTP method
   * @param endpoint API endpoint (appended to baseUrl)
   * @param data Request payload
   * @param options Custom request options
   * @returns Promise with typed response data
   */
  async makeRequest<T = any>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    const requestConfig: AxiosRequestConfig = {
      headers: { ...this.defaultHeaders, ...(options?.headers || {}) },
      timeout: options?.timeout || this.timeout,
      ...options,
    };

    const { customErrorHandler, retryConfig, ...axiosConfig } =
      requestConfig as RequestOptions;

    try {
      let request$: Observable<AxiosResponse>;
      this.logger.log(`Calling ${method} on ${url}`);
      request$ = ['get', 'delete'].includes(method)
        ? this.httpService[method](url, axiosConfig as AxiosRequestConfig)
        : this.httpService[method](
            url,
            data,
            axiosConfig as AxiosRequestConfig,
          );

      // Apply retries if configured
      if (this.retries || (retryConfig?.times || 0) > 0) {
        request$ = request$.pipe(
          retry({
            count: this.retries || retryConfig?.times || 0,
            delay: (error: any, retryCount: number) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              if (this.shouldRetryStatus(error.response?.status as number)) {
                console.log(
                  'Retrying request',
                  error.response?.status,
                  'for:',
                  url,
                );
                this.logger.warn(
                  `Retrying request (${retryCount}/${this.retries || retryConfig?.times || 0}) for ${url}: ${error.message} - This will be delayed for ${this.retryDelay || retryConfig?.delay || 600000}ms`,
                );
                return timer(retryConfig?.delay || this.retryDelay || 600000);
              }

              console.log(
                'Not retrying request',
                error.response?.status,
                'for:',
                url,
              );
              return throwError(() => error);
            },
          }),
        );
      }

      // Apply error handling
      request$ = request$.pipe(
        catchError(customErrorHandler || this.defaultErrorHandler),
      );

      const response = await firstValueFrom(request$);
      return response.data as T;
    } catch (error) {
      this.logger.error(`Request failed: ${(error as Error).message}`);
      throw error instanceof Error
        ? error
        : new Error(
            `Unknown error occurred while making API request to ${url}`,
          );
    }
  }

  makeRequest$<T = any>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Observable<AxiosResponse<T>> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    const requestConfig: AxiosRequestConfig = {
      headers: { ...this.defaultHeaders, ...(options?.headers || {}) },
      timeout: options?.timeout || this.timeout,
      ...options,
    };

    const { ...axiosConfig } = requestConfig as RequestOptions;

    this.logger.log(`Calling ${method} on ${url}`);
    const request$ = ['get', 'delete'].includes(method)
      ? this.httpService[method](url, axiosConfig as AxiosRequestConfig)
      : this.httpService[method](url, data, axiosConfig as AxiosRequestConfig);

    return request$ as Observable<AxiosResponse<T>>;
  }

  /**
   * Default error handler that can be overridden
   */
  private defaultErrorHandler = (error: any): Observable<never> => {
    const errorMessage =
      error.response?.data?.message || error.message || 'API request failed';
    const statusCode = error.response?.status || 500;
    return throwError(
      () => new Error(`API Error (${statusCode}): ${errorMessage}`),
    );
  };

  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>('get', endpoint, undefined, options);
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    return this.makeRequest<T>('post', endpoint, data, options);
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    return this.makeRequest<T>('put', endpoint, data, options);
  }

  async delete<T = any>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<T> {
    return this.makeRequest<T>('delete', endpoint, undefined, options);
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    return this.makeRequest<T>('patch', endpoint, data, options);
  }

  shouldRetryStatus(status: number): boolean {
    if (status === 429 || status === 402) {
      return true;
    }
    return status >= 500 && status !== 401;
  }
}
