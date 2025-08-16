import { ExpressRequest } from '@common/@types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: keyof unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<ExpressRequest>();

    if (!request.user) {
      return null;
    }

    if (data) {
      return request.user[data];
    }

    return request.user;
  },
);
