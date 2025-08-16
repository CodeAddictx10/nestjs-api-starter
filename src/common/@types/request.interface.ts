import { Request } from 'express';

export interface ExpressRequest extends Omit<Request, 'cookies' | 'headers'> {
  user?: unknown;
  cookies?: Record<string, string | null>;
  headers?: Record<string, string | null>;
  token?: string;
}
