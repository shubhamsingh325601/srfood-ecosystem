import type { Response } from 'express';

import type { ApiSuccessResponse, PaginationMeta } from '@/types/api.types';

export function sendSuccess<T>(res: Response, data: T, options?: { message?: string; meta?: PaginationMeta; statusCode?: number }): void {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(options?.message ? { message: options.message } : {}),
    ...(options?.meta ? { meta: options.meta } : {}),
  };
  res.status(options?.statusCode ?? 200).json(body);
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
