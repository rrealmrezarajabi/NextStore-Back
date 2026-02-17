import { PaginatedResponse } from '../types/paginated-response.type';

export function paginate<T>(items: T[], total: number, offset: number, limit: number): PaginatedResponse<T> {
  return {
    data: items,
    meta: {
      total,
      offset,
      limit,
      hasNext: offset + items.length < total,
    },
  };
}
