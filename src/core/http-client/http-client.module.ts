import {
  Module,
  DynamicModule,
  Provider,
  InjectionToken,
  Type,
  OptionalFactoryDependency,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpApiClientService } from './http-api-client.service';
import {
  HttpApiClientOptions,
  HttpApiClientAsyncOptions,
  HttpApiClientOptionsFactory,
} from './http-client.interface';
import { LoggerModule } from '../logger';

@Module({
  imports: [HttpModule, LoggerModule],
  providers: [HttpApiClientService],
  exports: [HttpApiClientService],
})
export class HttpClientModule {
  /**
   * Register the HTTP client module with default configuration
   * @returns A module with the default HttpApiClient
   */
  static register(): DynamicModule {
    return {
      module: HttpClientModule,
      imports: [HttpModule, LoggerModule],
      providers: [HttpApiClientService],
      exports: [HttpApiClientService],
    };
  }

  /**
   * Register the HTTP client module with async configuration
   * @param options Async configuration options for the HTTP API client
   * @returns A dynamic module with the asynchronously configured HttpApiClientService
   */
  static registerAsync(options: HttpApiClientAsyncOptions): DynamicModule {
    const providers = this.createAsyncProviders(options);

    return {
      module: HttpClientModule,
      imports: [HttpModule, ...(options.imports || [])],
      providers: [...providers, HttpApiClientService],
      exports: [HttpApiClientService],
    };
  }

  /**
   * Register the HTTP client module with custom configuration
   * @param options Configuration options for the HTTP API client
   * @returns A dynamic module with the configured HttpApiClientService
   */
  static forRoot(options: HttpApiClientOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: 'HTTP_API_CLIENT_OPTIONS',
      useValue: options,
    };

    return {
      module: HttpClientModule,
      imports: [HttpModule, LoggerModule],
      providers: [optionsProvider, HttpApiClientService],
      exports: [HttpApiClientService],
    };
  }

  /**
   * Register the HTTP client module with async configuration
   * @param options Async configuration options for the HTTP API client
   * @returns A dynamic module with the asynchronously configured HttpApiClientService
   */
  static forRootAsync(options: HttpApiClientAsyncOptions): DynamicModule {
    const providers = this.createAsyncProviders(options);

    return {
      module: HttpClientModule,
      imports: [HttpModule, ...(options.imports || [])],
      providers: [...providers, HttpApiClientService],
      exports: [HttpApiClientService],
    };
  }

  /**
   * Register the HTTP client module for a specific feature with custom configuration
   * @param options Configuration options for this feature's HTTP API client
   * @returns A dynamic module with the configured HttpApiClientService, scoped to this feature
   */
  static forFeature(options: HttpApiClientOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: 'HTTP_API_CLIENT_OPTIONS',
      useValue: options,
    };

    return {
      module: HttpClientModule,
      imports: [HttpModule, LoggerModule],
      providers: [optionsProvider, HttpApiClientService],
      exports: [HttpApiClientService],
    };
  }

  /**
   * Register the HTTP client module for a specific feature with async configuration
   * @param options Async configuration options for this feature's HTTP API client
   * @returns A dynamic module with the asynchronously configured HttpApiClientService, scoped to this feature
   */
  static forFeatureAsync(options: HttpApiClientAsyncOptions): DynamicModule {
    const providers = this.createAsyncProviders(options);

    return {
      module: HttpClientModule,
      imports: [HttpModule, ...(options.imports || [])],
      providers: [...providers, HttpApiClientService],
      exports: [HttpApiClientService],
    };
  }

  /**
   * Creates providers for async configuration
   * @param options Async configuration options
   * @returns Array of providers for the module
   */
  private static createAsyncProviders(
    options: HttpApiClientAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass as InjectionToken,
        useClass: options.useClass as Type<HttpApiClientOptionsFactory>,
      },
    ];
  }

  /**
   * Creates the async options provider
   * @param options Async configuration options
   * @returns Provider for HTTP client options
   */
  private static createAsyncOptionsProvider(
    options: HttpApiClientAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: 'HTTP_API_CLIENT_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: 'HTTP_API_CLIENT_OPTIONS',
      useFactory: async (optionsFactory: any) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        await optionsFactory.createHttpOptions(),
      inject: [options.useExisting || options.useClass] as Array<
        InjectionToken | OptionalFactoryDependency
      >,
    };
  }
}
