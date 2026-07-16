export type PaginatedResult<T> = {
  page: number;
  limit: number;
  total: number;
  data: T[];
};

export function unwrapList<T>(payload: T[] | PaginatedResult<T> | undefined | null): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

export function unwrapPage<T>(
  payload: T[] | PaginatedResult<T> | undefined | null,
): PaginatedResult<T> {
  if (!payload) return { page: 1, limit: 10, total: 0, data: [] };
  if (Array.isArray(payload)) {
    return { page: 1, limit: payload.length, total: payload.length, data: payload };
  }
  return {
    page: payload.page ?? 1,
    limit: payload.limit ?? payload.data?.length ?? 10,
    total: payload.total ?? payload.data?.length ?? 0,
    data: Array.isArray(payload.data) ? payload.data : [],
  };
}
