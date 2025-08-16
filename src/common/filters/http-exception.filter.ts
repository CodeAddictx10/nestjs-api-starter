import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { Response as ResponseInterface } from '@common/@types';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message;

    const apiResponse: ResponseInterface<null> = {
      status: false,
      statusCode: status,
      message: message,
      data: null,
    };

    response.status(status).json(apiResponse);
  }
}
