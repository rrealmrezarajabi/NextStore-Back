export type PaginatedMeta = {
  total: number;
  offset: number;
  limit: number;
  hasNext: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginatedMeta;
};
