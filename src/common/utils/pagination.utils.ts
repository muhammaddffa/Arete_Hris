export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function getPaginationParams(
  page: number = 1,
  limit: number = 10,
): { skip: number; take: number } {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

  return {
    skip: (validPage - 1) * validLimit,
    take: validLimit,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 10,
): PaginatedResult<T> {
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, limit);
  const totalPages = Math.ceil(total / validLimit);

  return {
    data,
    meta: {
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1,
    },
  };
}
