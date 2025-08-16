import { PaginationQueryDto } from '@common/dto';

export interface PaginateOptions<T, TInclude = any> {
  model: {
    findMany: (args: any) => Promise<T[]>;
    count?: (args?: any) => Promise<number>;
  };
  paginationQuery: PaginationQueryDto;
  defaultOrderBy?: string;
  defaultSortBy?: 'asc' | 'desc';
  searchableFields?: (keyof T)[];
  condition?: Record<string, any>;
  include?: TInclude;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total?: number;
    page?: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function paginate<T, TInclude = any>({
  model,
  paginationQuery,
  defaultOrderBy = 'createdAt',
  defaultSortBy = 'desc',
  searchableFields = [],
  condition = {} as Record<string, any>,
  include = {} as TInclude,
}: PaginateOptions<T>): Promise<PaginatedResult<T>> {
  const {
    page = 1,
    limit = 10,
    cursor,
    orderBy = defaultOrderBy,
    sortBy = defaultSortBy,
    search,
  } = paginationQuery;

  const take = Number(limit);

  const where: Record<string, any> = { ...condition };

  if (search && searchableFields.length > 0) {
    where.OR = searchableFields.map((field) => ({
      [field]: {
        contains: search,
        mode: 'insensitive',
      },
    }));
  }

  const order = {
    [orderBy]: sortBy,
  };

  const baseQuery = {
    where,
    orderBy: order,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    include,
  };

  if (cursor) {
    const records = await model.findMany({
      ...baseQuery,
      take: take + 1,
      skip: 1,
      cursor: { id: cursor },
    });

    const hasNextPage = records.length > take;
    if (hasNextPage) records.pop();

    return {
      data: records,
      meta: {
        limit: take,
        hasNextPage,
        hasPreviousPage: !!cursor,
      },
    };
  }

  const skip = (page - 1) * take;

  const [data, total] = await Promise.all([
    model.findMany({
      ...baseQuery,
      take,
      skip,
    }),
    model.count ? model.count({ where }) : Promise.resolve(undefined),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit: take,
      hasNextPage: total ? page * take < total : false,
      hasPreviousPage: page > 1,
    },
  };
}
