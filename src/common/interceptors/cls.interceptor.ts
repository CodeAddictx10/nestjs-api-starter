import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { ExpressRequest } from '@common/@types';

/**Not tested */
@Injectable()
export class ClsInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return this.cls.run(() => {
      const data = context.switchToHttp().getRequest<ExpressRequest>();
      if (data.token) {
        this.cls.set('token', data.token);
      }
      return next.handle();
    });
  }
}
