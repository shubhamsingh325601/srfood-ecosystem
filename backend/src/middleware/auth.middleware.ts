import type { NextFunction, Request, Response } from 'express';

import { User } from '@/models/User.model';
import { UnauthorizedError } from '@/utils/errors';
import { verifyAccessToken } from '@/utils/jwt';

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice('Bearer '.length).trim();
}

/** Verifies the JWT and re-checks isBlocked/isDeleted on every request — a role claim in a stale token must never survive a block/delete (CLAUDE.md §10). */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req);
    if (!token) throw new UnauthorizedError('Missing bearer token');

    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.sub).select('role isBlocked isDeleted').lean();
    if (!user || user.isDeleted) throw new UnauthorizedError('User no longer exists');
    if (user.isBlocked) throw new UnauthorizedError('Account is blocked');

    req.user = {
      id: payload.sub,
      role: user.role,
    };
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

/** Attaches req.user when a valid token is present, but never rejects the request — for public/optionally-personalized endpoints. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('role isBlocked isDeleted').lean();
    if (user && !user.isDeleted && !user.isBlocked) {
      req.user = { id: payload.sub, role: user.role };
    }
  } catch {
    // Ignore invalid tokens on optional-auth routes.
  }
  next();
}
