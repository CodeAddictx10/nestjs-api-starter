export interface Response<T> {
  status: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Record<string, any>;
}
