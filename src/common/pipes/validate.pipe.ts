import {
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';

@Injectable()
export class ValidateInputPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await super.transform(value, metadata);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw new BadRequestException(
          ValidateInputPipe.handleError(
            e.getResponse() as { message: unknown[] },
          ),
        );
      }
    }
  }

  private static handleError(errors: { message: unknown[] }): unknown {
    const mappedErrors = errors.message.map((error: unknown) => error);
    return mappedErrors[0];
  }
}
