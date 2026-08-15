import type { NextFunction, Request, Response } from 'express';

import { config } from '@/config/index';
import { ForbiddenError } from '@/utils/errors';

export function appValidation(req: Request, _res: Response, next: NextFunction): void {
  const appId = req.headers['x-app-id'];

  if (!appId || typeof appId !== 'string' || !config.app.allowedIds.includes(appId)) {
    next(new ForbiddenError(`Invalid or missing X-App-ID header. Expected one of: ${config.app.allowedIds.join(', ')}`));
    return;
  }

  next();
}
