import { ClsStore } from 'nestjs-cls';

export interface IClsStore extends ClsStore {
  token: string;
}
