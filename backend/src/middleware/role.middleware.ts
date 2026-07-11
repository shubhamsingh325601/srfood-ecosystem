import type { NextFunction, Request, Response } from 'express';

import type { UserRole } from '@/types/domain.types';
import { ForbiddenError, UnauthorizedError } from '@/utils/errors';

/** Backend-verified RBAC guard (CLAUDE.md §10) — never trust a client-supplied role, only the role loaded from the DB in requireAuth. */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError(`Requires one of roles: ${allowedRoles.join(', ')}`));
      return;
    }
    next();
  };
}
