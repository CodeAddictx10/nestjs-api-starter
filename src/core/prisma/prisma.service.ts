/* eslint-disable @typescript-eslint/no-unsafe-return */
import { errorExtension, softDeleteExtension } from '@common/utils';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV == 'production'
          ? ['error']
          : ['query', 'info', 'warn'],
      omit: {
        user: {
          password: true,
        },
      },
    });
  }
  async onModuleInit() {
    const extension = this.$extends({
      query: {
        $allModels: {
          async findFirstOrThrow(args) {
            return errorExtension(args);
          },
        },
        user: {
          $allOperations(args) {
            return softDeleteExtension(args);
          },
        },
      },
    });

    Object.assign(this, extension);
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
