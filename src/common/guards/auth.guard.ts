import { ExpressRequest } from '@common/@types';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest<ExpressRequest>();

      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException();
      }
      const passToken = this.configService.getOrThrow<string>('PASS_TOKEN');
      if (token !== passToken) {
        throw new UnauthorizedException();
      }
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: ExpressRequest): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
