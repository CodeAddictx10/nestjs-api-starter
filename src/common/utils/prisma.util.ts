/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { NotFoundException } from '@nestjs/common';

export function softDeleteExtension(prisma: any) {
  if (prisma.operation === 'delete' || prisma.operation === 'deleteMany') {
    const operation = prisma.operation == 'delete' ? 'update' : 'updateMany';
    prisma.__internalParams.action = operation;
    prisma.__internalParams.clientMethod = `${prisma.model}.${operation}`;

    return prisma.query({
      ...prisma.args,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  if (
    [
      'findFirstOrThrow',
      'findUniqueOrThrow',
      'findMany',
      'findFirst',
      'findUnique',
    ].includes(prisma.operation)
  ) {
    prisma.args.where = { deletedAt: { equals: null }, ...prisma.args.where };
  }

  return prisma.query(prisma.args);
}

export function lockForUpdateExtension(prisma: any) {
  return prisma.query({
    ...prisma.args,
    data: {
      ...prisma.args.data,
      version: { increment: 1 },
    },
  });
}

export async function errorExtension(prisma: any) {
  try {
    return await prisma.query(prisma.args);
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundException(`Record does not exist`);
    }
    throw error;
  }
}

export function getModelFields(models: any, model: string) {
  const modelFields = (models as any[]).find((m) => m.name === model)?.fields;
  return modelFields;
}

export function checkModelHasDeletedAtField(models: any, model: string) {
  const modelFields = getModelFields(models, model);
  return modelFields?.some((field) => field.name === 'deletedAt');
}
