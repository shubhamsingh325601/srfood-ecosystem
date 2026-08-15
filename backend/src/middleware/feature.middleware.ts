import type { NextFunction, Request, Response } from 'express';

import { getCurrentAppFeatures } from '@/config/dbContext';
import { NotFoundError } from '@/utils/errors';

/** 404s the request unless the current app (resolved from X-App-ID) has the given feature enabled. Routers gated by this stay mounted for every app so feature availability is decided per-request, not at process startup. */
export function requireFeature(name: keyof ReturnType<typeof getCurrentAppFeatures>) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    if (!getCurrentAppFeatures()[name]) {
      next(new NotFoundError('Not found'));
      return;
    }
    next();
  };
}
