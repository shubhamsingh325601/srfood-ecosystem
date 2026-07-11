import { PAGINATION_DEFAULTS } from '@/config/constants';

export function parsePagination(query: { page?: unknown; limit?: unknown }): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(query.page) || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(PAGINATION_DEFAULTS.MAX_LIMIT, Math.max(1, Number(query.limit) || PAGINATION_DEFAULTS.LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
