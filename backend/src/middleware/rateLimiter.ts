import type { Response } from 'express';
import rateLimit from 'express-rate-limit';

import { config } from '@/config/index';
import type { ApiErrorResponse } from '@/types/api.types';

function limitHandler(_req: unknown, res: Response): void {
  const body: ApiErrorResponse = {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later' },
  };
  res.status(429).json(body);
}

export const publicRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxPublic,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
});

export const authenticatedRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxAuthenticated,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? 'anonymous',
  handler: limitHandler,
});

export const authRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
});
